import { MenuClient } from "@/components/customer/menu-client";
import { getCurrentUser } from "@/lib/auth";
import { getAvailableProducts } from "@/lib/products";
import { getPublicQueueSummary, getQueueHeadline } from "@/lib/queue";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const [products, viewer, initialQueueSummary] = await Promise.all([
    getAvailableProducts(),
    getCurrentUser(),
    getPublicQueueSummary(),
  ]);
  const queueHeadline = await getQueueHeadline(viewer?.id);

  return (
    <MenuClient
      products={products}
      viewer={viewer}
      initialQueueSummary={initialQueueSummary}
      queueHeadline={queueHeadline}
    />
  );
}
