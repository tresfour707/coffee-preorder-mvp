"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { FloatingCartLink } from "@/components/customer/floating-cart-link";
import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { ProductGridCard } from "@/components/customer/product-grid-card";
import { ProductSheet } from "@/components/customer/product-sheet";
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
import type {
  MenuProductSummary,
  ProductSummary,
  PublicQueueSummary,
  ViewerSummary,
} from "@/lib/types";

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 text-stone-400"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.7"
    >
      <circle cx="10.75" cy="10.75" r="6.75" />
      <path d="M15.75 15.75 20.5 20.5" />
    </svg>
  );
}

type MenuClientProps = {
  products: MenuProductSummary[];
  purchasedProducts: MenuProductSummary[];
  viewer: ViewerSummary | null;
  initialQueueSummary: PublicQueueSummary;
  queueHeadline: string;
};

export function MenuClient({
  products,
  purchasedProducts,
  viewer,
  initialQueueSummary,
  queueHeadline,
}: MenuClientProps) {
  const ownerKey = getCartOwnerKey(viewer?.id);
  const addProduct = useCustomerCartStore((state) => state.addProduct);
  const items = useCustomerCartStore(selectCartByOwner(ownerKey));
  const hasHydrated = useCustomerCartStore((state) => state.hasHydrated);
  const [isMounted, setIsMounted] = useState(false);
  const [activeProduct, setActiveProduct] = useState<MenuProductSummary | null>(null);
  const categoryEntries = useMemo(() => buildMenuCategoryEntries(products), [products]);

  useEffect(() => {
    if (hasHydrated) {
      setIsMounted(true);
    }
  }, [hasHydrated]);

  const cartSummary = getCartSummary(items);

  function handleAddProduct(variant: ProductSummary, quantity: number) {
    for (let index = 0; index < quantity; index += 1) {
      addProduct(ownerKey, variant);
    }
  }

  return (
    <CustomerMobileShell
      viewer={viewer}
      queueSummary={initialQueueSummary}
      queueHeadline={queueHeadline}
      queueClassName="mt-0 pb-7 pt-1"
      contentClassName="mt-0"
      className="pb-28 pt-0"
    >
      {purchasedProducts.length > 0 ? (
        <section className="mb-14">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-[28px] font-medium leading-none tracking-tight text-stone-950">
              Вы покупали
            </h2>

            <Link
              href="/menu/purchased"
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[rgba(255,255,255,0.72)] px-4 text-sm font-semibold text-stone-800 shadow-[0_12px_26px_rgba(31,23,18,0.08)] backdrop-blur-[22px] transition active:scale-[0.97]"
            >
              Все
              <span className="text-[22px] font-light leading-none">›</span>
            </Link>
          </div>

          <div className="-mx-4 overflow-x-auto px-4 pb-1">
            <div className="flex items-stretch gap-3">
              {purchasedProducts.map((product) => (
                <ProductGridCard
                  key={product.id}
                  product={product}
                  onOpen={setActiveProduct}
                  stableLayout
                  compact
                  className="w-[146px] shrink-0"
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section id="quick-search" className="mb-5 scroll-mt-[112px]">
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

      {activeProduct ? (
        <ProductSheet
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
          onAdd={handleAddProduct}
        />
      ) : null}
    </CustomerMobileShell>
  );
}
