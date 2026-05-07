import { MenuClient } from "@/components/customer/menu-client";
import { getCurrentUser } from "@/lib/auth";
import {
  listRecentlyPurchasedProductKeysForUser,
  sortProductsByPurchasedKeys,
} from "@/lib/orders";
import { getAvailableProducts } from "@/lib/products";
import { getPublicQueueSummary, getQueueHeadline } from "@/lib/queue";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const [products, viewer, initialQueueSummary] = await Promise.all([
    getAvailableProducts(),
    getCurrentUser(),
    getPublicQueueSummary(),
  ]);
  const [queueHeadline, purchasedKeys] = await Promise.all([
    getQueueHeadline(viewer?.id),
    viewer ? listRecentlyPurchasedProductKeysForUser(viewer.id) : [],
  ]);
  const { purchasedProducts } = sortProductsByPurchasedKeys(products, purchasedKeys);

  return (
    <MenuClient
      products={products}
      purchasedProducts={purchasedProducts}
      viewer={viewer}
      initialQueueSummary={initialQueueSummary}
      queueHeadline={queueHeadline}
    />
  );
}
