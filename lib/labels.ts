import type { OrderSource, OrderStatus } from "@/lib/types";

export const statusLabels: Record<OrderStatus, string> = {
  DRAFT: "Черновик",
  WAITING: "В очереди",
  PREPARING: "Готовится",
  READY: "Готов",
  CANCELLED: "Отменен",
};

export const sourceLabels: Record<OrderSource, string> = {
  ONLINE: "Онлайн",
  OFFLINE: "Очный",
};
