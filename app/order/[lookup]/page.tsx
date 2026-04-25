import { notFound, redirect } from "next/navigation";

import { OrderStatusClient } from "@/components/customer/order-status-client";
import { getCurrentUser } from "@/lib/auth";
import { getOrderDetails } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ lookup: string }>;
}) {
  const { lookup } = await params;
  const viewer = await getCurrentUser();

  if (!viewer) {
    redirect(`/sign-in?next=/order/${lookup}`);
  }

  const order = await getOrderDetails(lookup, viewer.id);

  if (!order) {
    notFound();
  }

  return <OrderStatusClient initialOrder={order} viewer={viewer} />;
}
