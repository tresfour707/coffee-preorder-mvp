import { CartClient } from "@/components/customer/cart-client";
import { getCurrentUser } from "@/lib/auth";
import { getPublicQueueSummary, getQueueHeadline } from "@/lib/queue";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const [viewer, initialQueueSummary] = await Promise.all([
    getCurrentUser(),
    getPublicQueueSummary(),
  ]);
  const queueHeadline = await getQueueHeadline(viewer?.id);

  return (
    <CartClient
      viewer={viewer}
      initialQueueSummary={initialQueueSummary}
      queueHeadline={queueHeadline}
    />
  );
}
