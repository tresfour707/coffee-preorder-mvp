import { redirect } from "next/navigation";

import { PurchasedClient } from "@/components/customer/purchased-client";
import { getCurrentUser } from "@/lib/auth";
import {
  listRecentlyPurchasedProductKeysForUser,
  sortProductsByPurchasedKeys,
} from "@/lib/orders";
import { getAvailableProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function PurchasedPage() {
  const viewer = await getCurrentUser();

  if (!viewer) {
    redirect("/sign-in?next=/menu/purchased");
  }

  const [products, purchasedKeys] = await Promise.all([
    getAvailableProducts(),
    listRecentlyPurchasedProductKeysForUser(viewer.id),
  ]);
  const { purchasedProducts, otherProducts } = sortProductsByPurchasedKeys(
    products,
    purchasedKeys,
  );

  return (
    <PurchasedClient
      purchasedProducts={purchasedProducts}
      otherProducts={otherProducts}
      viewer={viewer}
    />
  );
}
