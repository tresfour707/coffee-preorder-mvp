import { redirect } from "next/navigation";

import { MyOrdersClient } from "@/components/customer/my-orders-client";
import { getCurrentUser } from "@/lib/auth";
import { listOrdersForUser } from "@/lib/orders";
import { getPublicQueueSummary } from "@/lib/queue";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const viewer = await getCurrentUser();

  if (!viewer) {
    redirect("/sign-in?next=/orders");
  }

  const [orders, initialQueueSummary] = await Promise.all([
    listOrdersForUser(viewer.id),
    getPublicQueueSummary(),
  ]);

  return (
    <MyOrdersClient
      viewer={viewer}
      orders={orders}
      initialQueueSummary={initialQueueSummary}
    />
  );
}
