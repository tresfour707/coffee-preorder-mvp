import { CartClient } from "@/components/customer/cart-client";
import { getCurrentUser } from "@/lib/auth";
import { getPublicQueueSummary } from "@/lib/queue";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const [viewer, initialQueueSummary] = await Promise.all([
    getCurrentUser(),
    getPublicQueueSummary(),
  ]);

  return <CartClient viewer={viewer} initialQueueSummary={initialQueueSummary} />;
}
