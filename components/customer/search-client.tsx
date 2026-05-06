"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { BackLink } from "@/components/customer/back-link";
import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { FloatingCartLink } from "@/components/customer/floating-cart-link";
import { ProductGridCard } from "@/components/customer/product-grid-card";
import { ProductSheet } from "@/components/customer/product-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { getCartSummary } from "@/lib/cart";
import {
  getCartOwnerKey,
  selectCartByOwner,
  useCustomerCartStore,
} from "@/lib/cart-store";
import type {
  MenuProductSummary,
  ProductSummary,
  ViewerSummary,
} from "@/lib/types";

type SearchClientProps = {
  products: MenuProductSummary[];
  viewer: ViewerSummary | null;
};

function SearchIcon() {
  return (
    <span className="relative block h-[18px] w-[18px] text-stone-400">
      <span className="absolute inset-0 rounded-full border-2 border-current" />
      <span className="absolute bottom-[-1px] right-[-1px] h-2 w-[2px] rotate-[-45deg] rounded-full bg-current" />
    </span>
  );
}

function getSearchText(product: MenuProductSummary) {
  return [
    product.name,
    product.category ?? "",
    product.description ?? "",
    product.variants.map((variant) => variant.sizeLabel ?? "").join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

export function SearchClient({
  products,
  viewer,
}: SearchClientProps) {
  const ownerKey = getCartOwnerKey(viewer?.id);
  const addProduct = useCustomerCartStore((state) => state.addProduct);
  const items = useCustomerCartStore(selectCartByOwner(ownerKey));
  const hasHydrated = useCustomerCartStore((state) => state.hasHydrated);
  const [isMounted, setIsMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [activeProduct, setActiveProduct] = useState<MenuProductSummary | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (hasHydrated) {
      setIsMounted(true);
    }
  }, [hasHydrated]);

  const normalizedQuery = query.trim().toLowerCase();
  const queryTokens = useMemo(
    () => normalizedQuery.split(/\s+/).filter(Boolean),
    [normalizedQuery],
  );
  const filteredProducts = useMemo(() => {
    if (queryTokens.length === 0) {
      return products;
    }

    return products.filter((product) => {
      const searchText = getSearchText(product);

      return queryTokens.every((token) => searchText.includes(token));
    });
  }, [products, queryTokens]);
  const cartSummary = getCartSummary(items);

  function handleAddProduct(variant: ProductSummary, quantity: number) {
    for (let index = 0; index < quantity; index += 1) {
      addProduct(ownerKey, variant);
    }
  }

  return (
    <CustomerMobileShell viewer={viewer} className="pb-28 pt-0" contentClassName="mt-0">
      <section className="space-y-5">
        <div className="sticky top-[82px] z-20 -mx-1 flex items-center gap-2 bg-[#fffaf6]/78 px-1 py-2 backdrop-blur-[22px]">
          <BackLink />

          <div className="flex min-h-12 flex-1 items-center gap-3 rounded-[17px] bg-[rgba(255,255,255,0.76)] px-4 shadow-[0_12px_26px_rgba(31,23,18,0.08)]">
            <SearchIcon />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Быстрый поиск"
              className="min-w-0 flex-1 bg-transparent text-[17px] font-medium text-stone-950 outline-none placeholder:text-stone-400"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Очистить поиск"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-200/80 text-[18px] leading-none text-stone-600"
              >
                ×
              </button>
            ) : null}
          </div>
        </div>

        <div>
          <h1 className="text-[30px] font-medium leading-none tracking-tight text-stone-950">
            {queryTokens.length > 0
              ? `Нашли ${filteredProducts.length} позиций`
              : "Все позиции"}
          </h1>
        </div>

        {filteredProducts.length === 0 ? (
          <EmptyState
            title="Ничего не найдено"
            description="Попробуйте другое название."
          />
        ) : (
          <div className="grid auto-rows-fr grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <ProductGridCard
                key={product.id}
                product={product}
                onOpen={setActiveProduct}
                stableLayout
              />
            ))}
          </div>
        )}
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
