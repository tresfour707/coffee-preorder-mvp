import { MenuClient } from "@/components/customer/menu-client";
import { getCurrentUser } from "@/lib/auth";
import {
  listRecentlyPurchasedProductKeysForUser,
  listTrackableOrdersForUser,
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
  const [queueHeadline, purchasedKeys, trackableOrders] = await Promise.all([
    getQueueHeadline(viewer?.id),
    viewer ? listRecentlyPurchasedProductKeysForUser(viewer.id) : [],
    viewer ? listTrackableOrdersForUser(viewer.id) : [],
  ]);
  const { purchasedProducts } = sortProductsByPurchasedKeys(products, purchasedKeys);

  return (
    <MenuClient
      products={products}
      purchasedProducts={purchasedProducts}
      trackableOrders={trackableOrders}
      viewer={viewer}
      initialQueueSummary={initialQueueSummary}
      queueHeadline={queueHeadline}
    />
  );
}
