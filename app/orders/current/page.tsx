import { redirect } from "next/navigation";

import { MyOrdersClient } from "@/components/customer/my-orders-client";
import { getCurrentUser } from "@/lib/auth";
import { listTrackableOrdersForUser } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function CurrentOrdersPage() {
  const viewer = await getCurrentUser();

  if (!viewer) {
    redirect("/sign-in?next=/orders/current");
  }

  const orders = await listTrackableOrdersForUser(viewer.id);

  return <MyOrdersClient viewer={viewer} orders={orders} mode="current" />;
}
