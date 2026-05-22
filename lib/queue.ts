import {
  OrderSource,
  OrderStatus,
  Prisma,
  PrismaClient,
  type Order,
  type OrderItem,
} from "@prisma/client";

import { AppError } from "@/lib/app-error";
import { QUEUE_PREVIEW_COUNT } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import type {
  OrderDetails,
  OrderItemSummary,
  PublicQueueSummary,
  QueueOrder,
  QueueSnapshot,
} from "@/lib/types";

export type DbClient = PrismaClient | Prisma.TransactionClient;

export const activeQueueStatuses: OrderStatus[] = [
  OrderStatus.WAITING,
  OrderStatus.PREPARING,
];

export const queueOrderBy = [
  { confirmedAt: "asc" },
  { createdAt: "asc" },
  { id: "asc" },
] satisfies Prisma.OrderOrderByWithRelationInput[];

export const orderWithItemsInclude = Prisma.validator<Prisma.OrderInclude>()({
  items: {
    orderBy: {
      id: "asc",
    },
  },
});

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: typeof orderWithItemsInclude;
}>;

export function isActiveQueueStatus(status: OrderStatus) {
  return activeQueueStatuses.includes(status);
}

export function serializeOrderItems(items: OrderItem[]): OrderItemSummary[] {
  return items.map((item) => ({
    id: item.id,
    productId: item.productId,
    productName: item.productNameSnapshot,
    quantity: item.quantity,
    unitPrice: item.unitPriceSnapshot,
    subtotal: item.unitPriceSnapshot * item.quantity,
  }));
}

function requireConfirmedOrderFields(
  order: Pick<Order, "id" | "publicOrderNumber" | "confirmedAt">,
) {
  if (order.publicOrderNumber == null || order.confirmedAt == null) {
    throw new AppError(
      `У заказа ${order.id} нет подтверждённых данных для очереди.`,
      500,
    );
  }

  return {
    publicOrderNumber: order.publicOrderNumber,
    confirmedAt: order.confirmedAt,
  };
}

export async function listActiveOrders(db: DbClient) {
  return db.order.findMany({
    where: {
      status: {
        in: activeQueueStatuses,
      },
    },
    orderBy: queueOrderBy,
    include: orderWithItemsInclude,
  });
}

export function getVisibleStatus(
  order: Pick<Order, "id" | "status">,
  activeOrderIds: string[],
): OrderStatus {
  if (!isActiveQueueStatus(order.status)) {
    return order.status;
  }

  return activeOrderIds[0] === order.id
    ? OrderStatus.PREPARING
    : OrderStatus.WAITING;
}

export function serializeQueueOrder(
  order: OrderWithItems,
  activeOrderIds: string[],
): QueueOrder {
  const { publicOrderNumber, confirmedAt } = requireConfirmedOrderFields(order);

  return {
    id: order.id,
    publicOrderNumber,
    source: order.source,
    status: getVisibleStatus(order, activeOrderIds),
    totalPrice: order.totalPrice,
    confirmedAt: confirmedAt.toISOString(),
    items: serializeOrderItems(order.items),
  };
}

export function serializeOrderDetails(
  order: OrderWithItems,
  activeOrderIds: string[],
): OrderDetails {
  const { publicOrderNumber, confirmedAt } = requireConfirmedOrderFields(order);
  const visibleStatus = getVisibleStatus(order, activeOrderIds);
  const queueIndex = activeOrderIds.indexOf(order.id);
  const ordersAhead = queueIndex >= 0 ? queueIndex : 0;

  return {
    id: order.id,
    publicOrderNumber,
    source: order.source,
    status: visibleStatus,
    businessDay: order.businessDay ?? "",
    totalPrice: order.totalPrice,
    confirmedAt: confirmedAt.toISOString(),
    items: serializeOrderItems(order.items),
    ordersAhead,
    canCancel:
      order.source === "ONLINE" && visibleStatus === OrderStatus.WAITING,
  };
}

function getOrdersWord(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "заказ";
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "заказа";
  }

  return "заказов";
}

export async function getQueueHeadline(
  viewerUserId?: string,
  db: DbClient = prisma,
): Promise<string> {
  const activeOrders = await db.order.findMany({
    where: {
      status: {
        in: activeQueueStatuses,
      },
    },
    orderBy: queueOrderBy,
    select: {
      userId: true,
      source: true,
      status: true,
    },
  });

  if (viewerUserId) {
    const viewerIndex = activeOrders.findIndex(
      (order) => order.source === OrderSource.ONLINE && order.userId === viewerUserId,
    );

    if (viewerIndex === 0) {
      return "Готовим ваш заказ";
    }

    if (viewerIndex > 0) {
      return `Перед вами ${viewerIndex} ${getOrdersWord(viewerIndex)}`;
    }
  }

  if (activeOrders.length === 0) {
    return "Нет заказов";
  }

  return `Перед вами ${activeOrders.length} ${getOrdersWord(activeOrders.length)}`;
}

export async function ensureQueueState(db: DbClient) {
  const activeOrders = await db.order.findMany({
    where: {
      status: {
        in: activeQueueStatuses,
      },
    },
    orderBy: queueOrderBy,
    select: {
      id: true,
      status: true,
    },
  });

  if (activeOrders.length === 0) {
    return null;
  }

  const [currentOrder, ...restOrders] = activeOrders;

  if (currentOrder.status !== OrderStatus.PREPARING) {
    await db.order.update({
      where: { id: currentOrder.id },
      data: { status: OrderStatus.PREPARING },
    });
  }

  const waitingResetIds = restOrders
    .filter((order) => order.status !== OrderStatus.WAITING)
    .map((order) => order.id);

  if (waitingResetIds.length > 0) {
    await db.order.updateMany({
      where: { id: { in: waitingResetIds } },
      data: { status: OrderStatus.WAITING },
    });
  }

  return currentOrder.id;
}

export async function getQueueSnapshot(db: DbClient = prisma): Promise<QueueSnapshot> {
  const activeOrders = await listActiveOrders(db);
  const activeOrderIds = activeOrders.map((order) => order.id);
  const serializedOrders = activeOrders.map((order) =>
    serializeQueueOrder(order, activeOrderIds),
  );

  return {
    currentOrder: serializedOrders[0] ?? null,
    nextOrders: serializedOrders.slice(1, QUEUE_PREVIEW_COUNT + 1),
    activeOrders: serializedOrders,
  };
}

export async function getPublicQueueSummary(
  db: DbClient = prisma,
): Promise<PublicQueueSummary> {
  const activeOrders = await db.order.findMany({
    where: {
      status: {
        in: activeQueueStatuses,
      },
    },
    orderBy: queueOrderBy,
    select: {
      publicOrderNumber: true,
    },
  });

  return {
    activeOrdersCount: activeOrders.length,
    currentOrderPublicNumber: activeOrders[0]?.publicOrderNumber ?? null,
  };
}

export async function markCurrentOrderReady() {
  return prisma.$transaction(async (tx) => {
    const activeOrders = await listActiveOrders(tx);
    const currentOrder = activeOrders[0];

    if (!currentOrder) {
      throw new AppError("В очереди сейчас нет активного заказа.", 409);
    }

    await tx.order.update({
      where: { id: currentOrder.id },
      data: {
        status: OrderStatus.READY,
        readyAt: new Date(),
      },
    });

    await ensureQueueState(tx);

    return getQueueSnapshot(tx);
  });
}
