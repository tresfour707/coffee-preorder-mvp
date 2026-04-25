import type { OrderSource, OrderStatus } from "@/lib/types";

export const statusLabels: Record<OrderStatus, string> = {
  DRAFT: "Draft",
  WAITING: "Waiting",
  PREPARING: "Preparing",
  READY: "Ready",
  CANCELLED: "Cancelled",
};

export const sourceLabels: Record<OrderSource, string> = {
  ONLINE: "Онлайн",
  OFFLINE: "Очный",
};
