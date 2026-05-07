"use client";
import { useEffect, useMemo, useState } from "react";

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
import type { MenuCategoryDefinition } from "@/lib/menu-catalog";
import {
  getCategoryFilterChips,
  matchesCategoryFilter,
} from "@/lib/menu-catalog";
import type {
  MenuProductSummary,
  ProductSummary,
  ViewerSummary,
} from "@/lib/types";

type CategoryMenuClientProps = {
  category: MenuCategoryDefinition;
  products: MenuProductSummary[];
  viewer: ViewerSummary | null;
};

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 text-stone-400"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.6"
    >
      <circle cx="10.75" cy="10.75" r="6.75" />
      <path d="M15.75 15.75 20.5 20.5" />
    </svg>
  );
}

export function CategoryMenuClient({
  category,
  products,
  viewer,
}: CategoryMenuClientProps) {
  const ownerKey = getCartOwnerKey(viewer?.id);
  const addProduct = useCustomerCartStore((state) => state.addProduct);
  const items = useCustomerCartStore(selectCartByOwner(ownerKey));
  const hasHydrated = useCustomerCartStore((state) => state.hasHydrated);
  const [isMounted, setIsMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [activeChip, setActiveChip] = useState("Все");
  const [activeProduct, setActiveProduct] = useState<MenuProductSummary | null>(null);

  useEffect(() => {
    if (hasHydrated) {
      setIsMounted(true);
    }
  }, [hasHydrated]);

  const chips = useMemo(
    () => getCategoryFilterChips(category.name, products),
    [category.name, products],
  );

  useEffect(() => {
    if (!chips.includes(activeChip)) {
      setActiveChip("Все");
    }
  }, [activeChip, chips]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      if (!matchesCategoryFilter(product, category.name, activeChip)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return product.name.toLowerCase().includes(normalizedQuery);
    });
  }, [activeChip, category.name, products, query]);

  const cartSummary = getCartSummary(items);

  function handleAddProduct(variant: ProductSummary, quantity: number) {
    for (let index = 0; index < quantity; index += 1) {
      addProduct(ownerKey, variant);
    }
  }

  return (
    <CustomerMobileShell viewer={viewer} className="pb-28 pt-0">
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BackLink />

          <div className="min-h-12 flex-1 rounded-[18px] bg-[#f3f2ee] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <SearchIcon />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Что вы хотите найти?"
                className="w-full bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {chips.map((chip) => {
            const isActive = chip === activeChip;

            return (
              <button
                key={chip}
                type="button"
                onClick={() => setActiveChip(chip)}
                className={`shrink-0 rounded-[14px] px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#eceae5] text-stone-950"
                    : "bg-transparent text-stone-700"
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>

        <div>
          <h1 className="text-[32px] font-medium leading-none tracking-tight text-stone-950">
            {category.label}
          </h1>
        </div>

        {filteredProducts.length === 0 ? (
          <EmptyState
            title="Ничего не найдено"
            description="Попробуйте убрать фильтр или изменить поисковый запрос."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <ProductGridCard
                key={product.id}
                product={product}
                onOpen={setActiveProduct}
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
