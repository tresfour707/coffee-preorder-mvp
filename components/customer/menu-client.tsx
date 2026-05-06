"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { FloatingCartLink } from "@/components/customer/floating-cart-link";
import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
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

function SearchIcon() {
  return (
    <span className="relative block h-5 w-5 text-stone-400">
      <span className="absolute inset-0 rounded-full border-[2.5px] border-current" />
      <span className="absolute bottom-[-2px] right-[-2px] h-2.5 w-[2.5px] rotate-[-45deg] rounded-full bg-current" />
    </span>
  );
}

type MenuClientProps = {
  products: MenuProductSummary[];
  viewer: ViewerSummary | null;
  initialQueueSummary: PublicQueueSummary;
  queueHeadline: string;
};

export function MenuClient({
  products,
  viewer,
  initialQueueSummary,
  queueHeadline,
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
      queueHeadline={queueHeadline}
      queueClassName="mt-0 pb-7 pt-1"
      contentClassName="mt-0"
      className="pb-28 pt-0"
    >
      <section className="mb-5">
        <Link
          href="/menu/search"
          className="flex min-h-[62px] items-center gap-4 rounded-[22px] border border-white/70 bg-[rgba(255,255,255,0.72)] px-5 text-[19px] font-medium tracking-tight text-stone-500 shadow-[0_16px_34px_rgba(31,23,18,0.08)] backdrop-blur-[22px] transition active:scale-[0.99]"
          aria-label="Открыть быстрый поиск"
        >
          <SearchIcon />
          <span>Быстрый поиск</span>
        </Link>
      </section>

      <section id="categories" className="grid grid-cols-2 gap-3">
        {categoryEntries.map((entry) => (
          <Link
            key={entry.category}
            href={getMenuCategoryHref(entry.category)}
            className="group relative min-h-[176px] overflow-hidden rounded-[24px] bg-[#f3f2ee] shadow-[inset_0_1px_0_rgba(255,255,255,0.88)]"
          >
            <Image
              src={entry.definition.imageSrc}
              alt={entry.definition.imageAlt}
              fill
              sizes="(max-width: 430px) 50vw, 210px"
              className="pointer-events-none object-cover transition duration-300 group-active:scale-[1.01]"
              style={{ objectPosition: entry.definition.imagePosition }}
            />

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0)_100%)]" />

            <div className="relative z-10 h-full p-4">
              <p className="max-w-[136px] text-[17px] font-medium leading-[1.14] tracking-tight text-stone-950">
                {entry.definition.label}
              </p>
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
