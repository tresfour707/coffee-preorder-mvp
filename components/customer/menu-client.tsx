"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { FloatingCartLink } from "@/components/customer/floating-cart-link";
import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { ProductArtwork } from "@/components/customer/product-artwork";
import { getCartSummary } from "@/lib/cart";
import {
  getCartOwnerKey,
  selectCartByOwner,
  useCustomerCartStore,
} from "@/lib/cart-store";
import {
  buildMenuCategoryEntries,
  getMenuCategoryHref,
} from "@/lib/menu-catalog";
import type { MenuProductSummary, PublicQueueSummary, ViewerSummary } from "@/lib/types";

type MenuClientProps = {
  products: MenuProductSummary[];
  viewer: ViewerSummary | null;
  initialQueueSummary: PublicQueueSummary;
};

export function MenuClient({
  products,
  viewer,
  initialQueueSummary,
}: MenuClientProps) {
  const ownerKey = getCartOwnerKey(viewer?.id);
  const items = useCustomerCartStore(selectCartByOwner(ownerKey));
  const hasHydrated = useCustomerCartStore((state) => state.hasHydrated);
  const [isMounted, setIsMounted] = useState(false);
  const categoryEntries = useMemo(() => buildMenuCategoryEntries(products), [products]);

  useEffect(() => {
    if (hasHydrated) {
      setIsMounted(true);
    }
  }, [hasHydrated]);

  const cartSummary = getCartSummary(items);

  return (
    <CustomerMobileShell
      viewer={viewer}
      queueSummary={initialQueueSummary}
      className="pb-28 pt-0"
    >
      <section id="categories" className="grid grid-cols-2 gap-3">
        {categoryEntries.map((entry) => (
          <Link
            key={entry.category}
            href={getMenuCategoryHref(entry.category)}
            className="relative min-h-[176px] overflow-hidden rounded-[24px] bg-[#f3f2ee] px-4 pt-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.88)]"
          >
            <div className="relative z-10 max-w-[128px]">
              <p className="text-[17px] font-medium leading-[1.14] tracking-tight text-stone-950">
                {entry.definition.label}
              </p>
            </div>

            <div className="absolute -bottom-2 -right-4 w-[134px]">
              <ProductArtwork
                product={entry.products[0]}
                className="h-[126px] rounded-[22px] bg-transparent shadow-none"
              />
            </div>
          </Link>
        ))}
      </section>

      {isMounted && cartSummary.itemsCount > 0 ? (
        <FloatingCartLink
          itemsCount={cartSummary.itemsCount}
          totalPrice={cartSummary.totalPrice}
        />
      ) : null}
    </CustomerMobileShell>
  );
}
