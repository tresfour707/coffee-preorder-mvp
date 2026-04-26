"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
import { formatMoney } from "@/lib/money";
import type { MenuProductSummary, PublicQueueSummary, ViewerSummary } from "@/lib/types";

type MenuClientProps = {
  products: MenuProductSummary[];
  viewer: ViewerSummary | null;
  initialQueueSummary: PublicQueueSummary;
};

function getOrdersWord(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "заказ";
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "заказа";
  }

  return "заказов";
}

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
    <CustomerMobileShell viewer={viewer} className="pb-28 pt-0">
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

      <section className="mt-5 rounded-[22px] bg-[#f3f2ee] px-4 py-4 text-sm text-stone-700">
        {initialQueueSummary.activeOrdersCount > 0
          ? `Сейчас в общей очереди ${initialQueueSummary.activeOrdersCount} ${getOrdersWord(
              initialQueueSummary.activeOrdersCount,
            )}`
          : "Сейчас очередь свободна"}
      </section>

      {isMounted && cartSummary.itemsCount > 0 ? (
        <div className="customer-action-bar">
          <div className="customer-action-bar-inner flex items-center justify-between gap-4 px-4 py-3">
            <div>
              <p className="text-sm text-stone-500">{cartSummary.itemsCount} позиций</p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-stone-950">
                {formatMoney(cartSummary.totalPrice)}
              </p>
            </div>

            <Link
              href="/cart"
              className="rounded-full bg-[#ff5a4f] px-5 py-3 text-sm font-semibold text-white"
            >
              Корзина
            </Link>
          </div>
        </div>
      ) : null}
    </CustomerMobileShell>
  );
}
