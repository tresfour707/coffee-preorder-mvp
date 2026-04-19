import { OrderSource, OrderStatus } from "@prisma/client";

import { AppError } from "@/lib/app-error";
import { getBusinessDay } from "@/lib/business-day";
import { normalizeRequestItems } from "@/lib/cart";
import { prisma } from "@/lib/prisma";
import {
  ensureQueueState,
  listActiveOrders,
  orderWithItemsInclude,
  serializeOrderDetails,
  type DbClient,
} from "@/lib/queue";
import type { OrderDetails, OrderRequestItem, OrderSource as PublicOrderSource } from "@/lib/types";

type CreateOrderInput = {
  source: PublicOrderSource;
  items: OrderRequestItem[];
};

type CancelActor = "CUSTOMER" | "STAFF";

async function getNextPublicOrderNumber(db: DbClient, businessDay: string) {
  const lastOrder = await db.order.findFirst({
    where: { businessDay },
    orderBy: {
      publicOrderNumber: "desc",
    },
    select: {
      publicOrderNumber: true,
    },
  });

  return (lastOrder?.publicOrderNumber ?? 0) + 1;
}

async function getOrderRecord(db: DbClient, orderId: string) {
  return db.order.findUnique({
    where: { id: orderId },
    include: orderWithItemsInclude,
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
      productNameSnapshot: product.name,
      unitPriceSnapshot: product.price,
      quantity: item.quantity,
    };
  });
}

export async function getOrderDetails(orderId: string) {
  const order = await getOrderRecord(prisma, orderId);

  if (!order) {
    return null;
  }

  const activeOrderIds = await getActiveOrderIds(prisma);
  return serializeOrderDetails(order, activeOrderIds);
}

export async function createOrder(input: CreateOrderInput): Promise<OrderDetails> {
  return prisma.$transaction(async (tx) => {
    const businessDay = getBusinessDay();
    const confirmedAt = new Date();
    const items = await getValidatedProducts(tx, input.items);
    const publicOrderNumber = await getNextPublicOrderNumber(tx, businessDay);
    const totalPrice = items.reduce(
      (sum, item) => sum + item.unitPriceSnapshot * item.quantity,
      0,
    );

    const createdOrder = await tx.order.create({
      data: {
        publicOrderNumber,
        source:
          input.source === "ONLINE" ? OrderSource.ONLINE : OrderSource.OFFLINE,
        status: OrderStatus.WAITING,
        businessDay,
        confirmedAt,
        totalPrice,
        items: {
          create: items,
        },
      },
      include: orderWithItemsInclude,
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

export async function cancelOrder(orderId: string, actor: CancelActor) {
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

    const activeOrderIds = await getActiveOrderIds(tx);
    const currentView = serializeOrderDetails(order, activeOrderIds);

    if (actor === "CUSTOMER") {
      if (order.source !== OrderSource.ONLINE) {
        throw new AppError("Через этот экран можно отменить только онлайн-заказ.", 403);
      }

      if (currentView.status !== "WAITING") {
        throw new AppError(
          "Онлайн-заказ можно отменить только пока он находится в Waiting.",
          409,
        );
      }
    }

    if (actor === "STAFF") {
      if (order.source !== OrderSource.OFFLINE) {
        throw new AppError("Сотрудник может отменять только офлайн-заказы.", 403);
      }
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    await ensureQueueState(tx);

    const refreshedOrder = await getOrderRecord(tx, order.id);

    if (!refreshedOrder) {
      throw new AppError("Не удалось загрузить обновлённый заказ.", 500);
    }

    const refreshedActiveOrderIds = await getActiveOrderIds(tx);
    return serializeOrderDetails(refreshedOrder, refreshedActiveOrderIds);
  });
}
