"use client";
import { useEffect, useMemo, useState } from "react";

import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { FloatingCartLink } from "@/components/customer/floating-cart-link";
import { ProductArtwork } from "@/components/customer/product-artwork";
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
  sortProductVariants,
} from "@/lib/menu-catalog";
import { formatMoney } from "@/lib/money";
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
    <span className="relative block h-4 w-4 text-stone-400">
      <span className="absolute inset-0 rounded-full border-2 border-current" />
      <span className="absolute bottom-[-1px] right-[-1px] h-2 w-[2px] rotate-[-45deg] rounded-full bg-current" />
    </span>
  );
}

function getProductMeta(product: MenuProductSummary) {
  const firstVariant = sortProductVariants(
    product.variants.filter((variant) => variant.available),
  )[0];

  if (!firstVariant) {
    return formatMoney(product.priceFrom);
  }

  if (firstVariant.sizeLabel) {
    return `${firstVariant.sizeLabel} / ${formatMoney(firstVariant.price)}`;
  }

  return formatMoney(firstVariant.price);
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
        <div className="rounded-[18px] bg-[#f3f2ee] px-4 py-3.5">
          <div className="flex items-center gap-3">
            <SearchIcon />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Что вы хотите найти?"
              className="w-full bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
            />
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
              <article
                key={product.id}
                className="overflow-hidden rounded-[22px] bg-white p-2 shadow-[0_6px_18px_rgba(17,24,39,0.05)]"
              >
                <button
                  type="button"
                  onClick={() => setActiveProduct(product)}
                  disabled={!product.available}
                  className="block w-full text-left disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ProductArtwork
                    product={product}
                    className="rounded-[18px]"
                  />

                  <div className="px-1 pb-1 pt-3">
                    <h2 className="text-[17px] font-medium leading-[1.16] tracking-tight text-stone-950">
                      {product.name}
                    </h2>
                    <p className="mt-2 text-[15px] text-stone-400">
                      {getProductMeta(product)}
                    </p>
                  </div>
                </button>

                <div className="px-1 pb-1 pt-2">
                  <button
                    type="button"
                    disabled={!product.available}
                    onClick={() => setActiveProduct(product)}
                    className="ml-auto flex h-10 w-[74px] items-center justify-center rounded-full bg-[#3f2a1d] text-[28px] font-light leading-none text-white transition hover:bg-[#302016] disabled:cursor-not-allowed disabled:bg-stone-300"
                  >
                    +
                  </button>
                </div>
              </article>
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
