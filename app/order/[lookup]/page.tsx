import { notFound } from "next/navigation";

import { OrderStatusClient } from "@/components/customer/order-status-client";
import { getOrderDetails } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ lookup: string }>;
}) {
  const { lookup } = await params;
  const order = await getOrderDetails(lookup);

  if (!order) {
    notFound();
  }

  return <OrderStatusClient initialOrder={order} />;
}
