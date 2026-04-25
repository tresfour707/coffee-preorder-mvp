import { MenuClient } from "@/components/customer/menu-client";
import { getCurrentUser } from "@/lib/auth";
import { getAvailableProducts } from "@/lib/products";
import { getPublicQueueSummary } from "@/lib/queue";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const [products, viewer, initialQueueSummary] = await Promise.all([
    getAvailableProducts(),
    getCurrentUser(),
    getPublicQueueSummary(),
  ]);

  return (
    <MenuClient
      products={products}
      viewer={viewer}
      initialQueueSummary={initialQueueSummary}
    />
  );
}
