import { redirect } from "next/navigation";

import { MyOrdersClient } from "@/components/customer/my-orders-client";
import { getCurrentUser } from "@/lib/auth";
import { listOrdersForUser } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const viewer = await getCurrentUser();

  if (!viewer) {
    redirect("/sign-in?next=/orders");
  }

  const orders = await listOrdersForUser(viewer.id);

  return <MyOrdersClient viewer={viewer} orders={orders} />;
}
