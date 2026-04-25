export type OrderSource = "ONLINE" | "OFFLINE";
export type OrderStatus =
  | "DRAFT"
  | "WAITING"
  | "PREPARING"
  | "READY"
  | "CANCELLED";
export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
export type PaymentMethod = "DEMO_CARD" | "DEMO_SBP";

export type ViewerSummary = {
  id: string;
  name: string;
  email: string;
};

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

export type UserOrderSummary = {
  id: string;
  publicOrderNumber: number;
  status: OrderStatus;
  totalPrice: number;
  confirmedAt: string;
  source: OrderSource;
  ordersAhead: number;
};

export type DemoPaymentDetails = {
  paymentId: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  source: OrderSource;
  customerName: string | null;
  customerEmail: string | null;
  items: OrderItemSummary[];
};

export type DemoPaymentResolution = {
  paymentId: string;
  status: PaymentStatus;
  order: OrderDetails | null;
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

export type PublicQueueSummary = {
  activeOrdersCount: number;
  currentOrderPublicNumber: number | null;
};
