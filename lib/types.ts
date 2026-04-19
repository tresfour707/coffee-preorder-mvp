export type OrderSource = "ONLINE" | "OFFLINE";
export type OrderStatus = "WAITING" | "PREPARING" | "READY" | "CANCELLED";

export type ProductSummary = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  available: boolean;
  category: string | null;
};

export type OrderRequestItem = {
  productId: string;
  quantity: number;
};

export type CartLine = {
  productId: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  quantity: number;
};

export type OrderItemSummary = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type OrderDetails = {
  id: string;
  publicOrderNumber: number;
  source: OrderSource;
  status: OrderStatus;
  businessDay: string;
  totalPrice: number;
  confirmedAt: string;
  items: OrderItemSummary[];
  ordersAhead: number;
  canCancel: boolean;
};

export type QueueOrder = {
  id: string;
  publicOrderNumber: number;
  source: OrderSource;
  status: OrderStatus;
  totalPrice: number;
  confirmedAt: string;
  items: OrderItemSummary[];
};

export type QueueSnapshot = {
  currentOrder: QueueOrder | null;
  nextOrders: QueueOrder[];
  activeOrders: QueueOrder[];
};
