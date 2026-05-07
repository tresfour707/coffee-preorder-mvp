import {
  OrderSource,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
} from "@prisma/client";

import { AppError } from "@/lib/app-error";
import { getBusinessDay } from "@/lib/business-day";
import { normalizeRequestItems } from "@/lib/cart";
import { formatProductDisplayName } from "@/lib/products";
import { prisma } from "@/lib/prisma";
import {
  ensureQueueState,
  listActiveOrders,
  serializeOrderDetails,
  serializeOrderItems,
  type DbClient,
} from "@/lib/queue";
import type {
  DemoPaymentDetails,
  DemoPaymentResolution,
  MenuProductSummary,
  OrderDetails,
  OrderRequestItem,
  PaymentMethod as PublicPaymentMethod,
  PaymentStatus as PublicPaymentStatus,
  UserOrderSummary,
} from "@/lib/types";

type CreateOfflineOrderInput = {
  items: OrderRequestItem[];
};

type CreateDemoPaymentInput = {
  items: OrderRequestItem[];
  method: PublicPaymentMethod;
  userId: string;
  customerName: string;
  customerEmail: string;
};

type CancelActor = "CUSTOMER" | "STAFF";
type DemoPaymentResult = "SUCCESS" | "FAIL" | "CANCEL";

const orderWithRelationsInclude = Prisma.validator<Prisma.OrderInclude>()({
  items: {
    orderBy: {
      id: "asc",
    },
  },
  payment: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
});

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: typeof orderWithRelationsInclude;
}>;

async function getNextPublicOrderAssignment(db: DbClient, businessDay: string) {
  const lastOrder = await db.order.findFirst({
    where: {
      businessDay,
      publicOrderNumber: {
        not: null,
      },
    },
    orderBy: {
      publicOrderNumber: "desc",
    },
    select: {
      publicOrderNumber: true,
    },
  });

  const publicOrderNumber = (lastOrder?.publicOrderNumber ?? 0) + 1;

  return {
    businessDay,
    publicOrderNumber,
    publicOrderKey: `${businessDay}-${publicOrderNumber}`,
  };
}

async function getOrderRecord(db: DbClient, orderId: string) {
  return db.order.findUnique({
    where: { id: orderId },
    include: orderWithRelationsInclude,
  });
}

async function getPaymentRecord(db: DbClient, paymentId: string) {
  return db.payment.findUnique({
    where: { id: paymentId },
    include: {
      order: {
        include: orderWithRelationsInclude,
      },
    },
  });
}

async function getActiveOrderIds(db: DbClient) {
  const activeOrders = await listActiveOrders(db);
  return activeOrders.map((order) => order.id);
}

async function getValidatedProducts(
  db: DbClient,
  items: OrderRequestItem[],
) {
  const normalizedItems = normalizeRequestItems(items);

  if (normalizedItems.length === 0) {
    throw new AppError("Добавьте хотя бы одну доступную позицию в заказ.", 400);
  }

  const products = await db.product.findMany({
    where: {
      id: {
        in: normalizedItems.map((item) => item.productId),
      },
    },
  });

  const productMap = new Map(products.map((product) => [product.id, product]));
  const missingOrUnavailableProduct = normalizedItems.find((item) => {
    const product = productMap.get(item.productId);
    return !product || !product.available;
  });

  if (missingOrUnavailableProduct) {
    throw new AppError("Одна или несколько позиций больше недоступны.", 409);
  }

  return normalizedItems.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new AppError("Товар не найден.", 404);
    }

    return {
      productId: product.id,
      productNameSnapshot: formatProductDisplayName(product),
      unitPriceSnapshot: product.price,
      quantity: item.quantity,
    };
  });
}

async function cleanupAbandonedDemoOrders(db: DbClient, userId: string) {
  const cutoff = new Date(Date.now() - 1000 * 60 * 60 * 12);

  await db.order.deleteMany({
    where: {
      userId,
      source: OrderSource.ONLINE,
      publicOrderNumber: null,
      createdAt: {
        lt: cutoff,
      },
      status: {
        in: [OrderStatus.DRAFT, OrderStatus.CANCELLED],
      },
    },
  });
}

function ensureViewerCanAccessOrder(
  order: Pick<OrderWithRelations, "source" | "userId">,
  viewerUserId?: string,
) {
  if (order.source === OrderSource.ONLINE) {
    if (!viewerUserId || order.userId !== viewerUserId) {
      throw new AppError("Заказ не найден.", 404);
    }
  }
}

function serializeDemoPayment(order: OrderWithRelations): DemoPaymentDetails {
  if (!order.payment?.id || !order.payment.method) {
    throw new AppError("Demo payment не найден.", 404);
  }

  return {
    paymentId: order.payment.id,
    orderId: order.id,
    amount: order.payment.amount,
    method: order.payment.method,
    status: order.payment.status as PublicPaymentStatus,
    source: order.source,
    customerName: order.customerName ?? order.user?.name ?? null,
    customerEmail: order.user?.email ?? null,
    items: serializeOrderItems(order.items),
  };
}

export async function getOrderDetails(orderId: string, viewerUserId?: string) {
  const order = await getOrderRecord(prisma, orderId);

  if (!order) {
    return null;
  }

  if (order.source !== OrderSource.ONLINE) {
    return null;
  }

  ensureViewerCanAccessOrder(order, viewerUserId);

  if (order.publicOrderNumber == null || order.confirmedAt == null) {
    return null;
  }

  const activeOrderIds = await getActiveOrderIds(prisma);
  return serializeOrderDetails(order, activeOrderIds);
}

export async function listOrdersForUser(viewerUserId: string): Promise<UserOrderSummary[]> {
  const [orders, activeOrderIds] = await Promise.all([
    prisma.order.findMany({
      where: {
        userId: viewerUserId,
        source: OrderSource.ONLINE,
        publicOrderNumber: {
          not: null,
        },
        confirmedAt: {
          not: null,
        },
      },
      orderBy: [
        {
          confirmedAt: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      include: orderWithRelationsInclude,
    }),
    getActiveOrderIds(prisma),
  ]);

  return orders.map((order) => {
    const details = serializeOrderDetails(order, activeOrderIds);

    return {
      id: details.id,
      publicOrderNumber: details.publicOrderNumber,
      status: details.status,
      totalPrice: details.totalPrice,
      confirmedAt: details.confirmedAt,
      source: details.source,
      ordersAhead: details.ordersAhead,
    };
  });
}

export async function listRecentlyPurchasedProductKeysForUser(
  viewerUserId: string,
): Promise<string[]> {
  const orders = await prisma.order.findMany({
    where: {
      userId: viewerUserId,
      source: OrderSource.ONLINE,
      status: {
        not: OrderStatus.CANCELLED,
      },
      publicOrderNumber: {
        not: null,
      },
      confirmedAt: {
        not: null,
      },
    },
    orderBy: [
      {
        confirmedAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    include: {
      items: {
        orderBy: {
          id: "asc",
        },
        include: {
          product: {
            select: {
              id: true,
              groupKey: true,
            },
          },
        },
      },
    },
  });

  const orderedKeys: string[] = [];
  const seenKeys = new Set<string>();

  for (const order of orders) {
    for (const item of order.items) {
      const key = item.product?.groupKey ?? item.product?.id;

      if (!key || seenKeys.has(key)) {
        continue;
      }

      seenKeys.add(key);
      orderedKeys.push(key);
    }
  }

  return orderedKeys;
}

export function sortProductsByPurchasedKeys(
  products: MenuProductSummary[],
  purchasedKeys: string[],
) {
  const productById = new Map(products.map((product) => [product.id, product]));
  const purchasedProducts: MenuProductSummary[] = [];
  const purchasedIds = new Set<string>();

  for (const key of purchasedKeys) {
    const product = productById.get(key);

    if (!product || purchasedIds.has(product.id)) {
      continue;
    }

    purchasedIds.add(product.id);
    purchasedProducts.push(product);
  }

  const otherProducts = products.filter((product) => !purchasedIds.has(product.id));

  return {
    purchasedProducts,
    otherProducts,
  };
}

export async function createOfflineOrder(
  input: CreateOfflineOrderInput,
): Promise<OrderDetails> {
  return prisma.$transaction(async (tx) => {
    const businessDay = getBusinessDay();
    const confirmedAt = new Date();
    const items = await getValidatedProducts(tx, input.items);
    const numbering = await getNextPublicOrderAssignment(tx, businessDay);
    const totalPrice = items.reduce(
      (sum, item) => sum + item.unitPriceSnapshot * item.quantity,
      0,
    );

    const createdOrder = await tx.order.create({
      data: {
        ...numbering,
        source: OrderSource.OFFLINE,
        status: OrderStatus.WAITING,
        confirmedAt,
        totalPrice,
        items: {
          create: items,
        },
      },
      include: orderWithRelationsInclude,
    });

    await ensureQueueState(tx);

    const refreshedOrder = await getOrderRecord(tx, createdOrder.id);

    if (!refreshedOrder) {
      throw new AppError("Не удалось загрузить только что созданный заказ.", 500);
    }

    const activeOrderIds = await getActiveOrderIds(tx);
    return serializeOrderDetails(refreshedOrder, activeOrderIds);
  });
}

export async function createDemoPayment(
  input: CreateDemoPaymentInput,
): Promise<DemoPaymentDetails> {
  return prisma.$transaction(async (tx) => {
    await cleanupAbandonedDemoOrders(tx, input.userId);

    const items = await getValidatedProducts(tx, input.items);
    const totalPrice = items.reduce(
      (sum, item) => sum + item.unitPriceSnapshot * item.quantity,
      0,
    );

    const createdOrder = await tx.order.create({
      data: {
        source: OrderSource.ONLINE,
        status: OrderStatus.DRAFT,
        totalPrice,
        userId: input.userId,
        customerName: input.customerName,
        items: {
          create: items,
        },
        payment: {
          create: {
            amount: totalPrice,
            method:
              input.method === "DEMO_SBP"
                ? PaymentMethod.DEMO_SBP
                : PaymentMethod.DEMO_CARD,
            status: PaymentStatus.PENDING,
          },
        },
      },
      include: orderWithRelationsInclude,
    });

    return serializeDemoPayment(createdOrder);
  });
}

export async function getDemoPaymentDetails(
  paymentId: string,
  viewerUserId: string,
) {
  const payment = await getPaymentRecord(prisma, paymentId);

  if (!payment) {
    return null;
  }

  ensureViewerCanAccessOrder(payment.order, viewerUserId);

  return serializeDemoPayment(payment.order);
}

export async function resolveDemoPayment(
  paymentId: string,
  viewerUserId: string,
  result: DemoPaymentResult,
): Promise<DemoPaymentResolution> {
  return prisma.$transaction(async (tx) => {
    const payment = await getPaymentRecord(tx, paymentId);

    if (!payment) {
      throw new AppError("Demo payment не найден.", 404);
    }

    ensureViewerCanAccessOrder(payment.order, viewerUserId);

    if (payment.status === PaymentStatus.SUCCEEDED) {
      const activeOrderIds = await getActiveOrderIds(tx);

      return {
        paymentId: payment.id,
        status: payment.status,
        order:
          payment.order.publicOrderNumber != null &&
          payment.order.confirmedAt != null
            ? serializeOrderDetails(payment.order, activeOrderIds)
            : null,
      };
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new AppError("Этот demo payment уже завершён.", 409);
    }

    if (result === "SUCCESS") {
      const businessDay = getBusinessDay();
      const confirmedAt = new Date();
      const numbering = await getNextPublicOrderAssignment(tx, businessDay);

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCEEDED,
          completedAt: confirmedAt,
        },
      });

      await tx.order.update({
        where: { id: payment.order.id },
        data: {
          ...numbering,
          businessDay,
          confirmedAt,
          status: OrderStatus.WAITING,
        },
      });

      await ensureQueueState(tx);

      const refreshedOrder = await getOrderRecord(tx, payment.order.id);

      if (!refreshedOrder) {
        throw new AppError("Не удалось загрузить оплаченный заказ.", 500);
      }

      const activeOrderIds = await getActiveOrderIds(tx);

      return {
        paymentId: payment.id,
        status: PaymentStatus.SUCCEEDED,
        order: serializeOrderDetails(refreshedOrder, activeOrderIds),
      };
    }

    const cancelledAt = new Date();
    const nextPaymentStatus =
      result === "FAIL" ? PaymentStatus.FAILED : PaymentStatus.CANCELLED;

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: nextPaymentStatus,
        failedAt: result === "FAIL" ? cancelledAt : null,
        cancelledAt: result === "CANCEL" ? cancelledAt : null,
      },
    });

    await tx.order.update({
      where: { id: payment.order.id },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt,
      },
    });

    return {
      paymentId: payment.id,
      status: nextPaymentStatus,
      order: null,
    };
  });
}

export async function cancelOrder(
  orderId: string,
  actor: CancelActor,
  viewerUserId?: string,
) {
  return prisma.$transaction(async (tx) => {
    const order = await getOrderRecord(tx, orderId);

    if (!order) {
      throw new AppError("Заказ не найден.", 404);
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new AppError("Заказ уже был отменён.", 409);
    }

    if (order.status === OrderStatus.READY) {
      throw new AppError("Готовый заказ отменить нельзя.", 409);
    }

    if (actor === "CUSTOMER") {
      ensureViewerCanAccessOrder(order, viewerUserId);

      if (order.source !== OrderSource.ONLINE) {
        throw new AppError("Через этот экран можно отменить только онлайн-заказ.", 403);
      }
    }

    if (actor === "STAFF" && order.source !== OrderSource.OFFLINE) {
      throw new AppError("Сотрудник может отменять только офлайн-заказы.", 403);
    }

    const activeOrderIds = await getActiveOrderIds(tx);
    const currentView =
      order.publicOrderNumber != null && order.confirmedAt != null
        ? serializeOrderDetails(order, activeOrderIds)
        : null;

    if (actor === "CUSTOMER" && currentView?.status !== OrderStatus.WAITING) {
      throw new AppError(
        "Онлайн-заказ можно отменить только пока он находится в Waiting.",
        409,
      );
    }

    const cancelledAt = new Date();

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt,
      },
    });

    if (order.payment) {
      await tx.payment.update({
        where: { id: order.payment.id },
        data: {
          status: PaymentStatus.CANCELLED,
          cancelledAt,
        },
      });
    }

    await ensureQueueState(tx);

    const refreshedOrder = await getOrderRecord(tx, order.id);

    if (!refreshedOrder) {
      throw new AppError("Не удалось загрузить обновлённый заказ.", 500);
    }

    if (refreshedOrder.publicOrderNumber == null || refreshedOrder.confirmedAt == null) {
      throw new AppError("Отменённый заказ больше недоступен в customer view.", 409);
    }

    const refreshedActiveOrderIds = await getActiveOrderIds(tx);
    return serializeOrderDetails(refreshedOrder, refreshedActiveOrderIds);
  });
}
