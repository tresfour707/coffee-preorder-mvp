import { notFound, redirect } from "next/navigation";

import { OrderHistoryDetailClient } from "@/components/customer/order-history-detail-client";
import { OrderStatusClient } from "@/components/customer/order-status-client";
import { getCurrentUser } from "@/lib/auth";
import { getOrderDetails } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ lookup: string }>;
  searchParams?: Promise<{ view?: string }>;
}) {
  const { lookup } = await params;
  const query = await searchParams;
  const viewer = await getCurrentUser();

  if (!viewer) {
    redirect(`/sign-in?next=/order/${lookup}`);
  }

  const order = await getOrderDetails(lookup, viewer.id);

  if (!order) {
    notFound();
  }

  if (query?.view === "history") {
    return <OrderHistoryDetailClient order={order} viewer={viewer} />;
  }

  return <OrderStatusClient initialOrder={order} viewer={viewer} />;
}
