"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { ProductArtwork } from "@/components/customer/product-artwork";
import { QuantityControl } from "@/components/ui/quantity-control";
import { getCartSummary } from "@/lib/cart";
import {
  getCartOwnerKey,
  selectCartByOwner,
  useCustomerCartStore,
} from "@/lib/cart-store";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/money";
import type {
  MenuProductSummary,
  ProductSummary,
  PublicQueueSummary,
  ViewerSummary,
} from "@/lib/types";

type MenuClientProps = {
  products: MenuProductSummary[];
  viewer: ViewerSummary | null;
  initialQueueSummary: PublicQueueSummary;
};

type CategoryEntry = {
  category: string;
  products: MenuProductSummary[];
};

const categoryOrder = [
  "Завтрак",
  "Холодные закуски",
  "Вторые блюда",
  "Десерт",
  "Напитки",
] as const;

const categoryStyles: Record<
  string,
  {
    bg: string;
    accent: string;
    text: string;
    tall?: boolean;
  }
> = {
  "Завтрак": {
    bg: "bg-[linear-gradient(180deg,#f4d276_0%,#eeb653_100%)]",
    accent: "bg-[#9d5b22]",
    text: "text-stone-950",
    tall: true,
  },
  "Холодные закуски": {
    bg: "bg-[linear-gradient(180deg,#efc0a8_0%,#eba98d_100%)]",
    accent: "bg-[#b85e46]",
    text: "text-stone-950",
  },
  "Вторые блюда": {
    bg: "bg-[linear-gradient(180deg,#cfd574_0%,#b8c75c_100%)]",
    accent: "bg-[#68743a]",
    text: "text-stone-950",
    tall: true,
  },
  Десерт: {
    bg: "bg-[linear-gradient(180deg,#efb1b4_0%,#e98f95_100%)]",
    accent: "bg-[#ba536c]",
    text: "text-stone-950",
  },
  Напитки: {
    bg: "bg-[linear-gradient(180deg,#f3cca1_0%,#e8b176_100%)]",
    accent: "bg-[#8c5d36]",
    text: "text-stone-950",
  },
};

function truncateText(value: string | null, maxLength: number) {
  if (!value) {
    return null;
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}…`;
}

function buildCategoryEntries(products: MenuProductSummary[]): CategoryEntry[] {
  const groups = new Map<string, MenuProductSummary[]>();

  for (const product of products) {
    const category = product.category ?? "Другое";
    groups.set(category, [...(groups.get(category) ?? []), product]);
  }

  const orderedEntries = categoryOrder
    .map((category) => ({
      category,
      products: groups.get(category) ?? [],
    }))
    .filter((entry) => entry.products.length > 0);

  const unorderedEntries = Array.from(groups.entries())
    .filter(([category]) => !categoryOrder.includes(category as (typeof categoryOrder)[number]))
    .map(([category, categoryProducts]) => ({
      category,
      products: categoryProducts,
    }));

  return [...orderedEntries, ...unorderedEntries];
}

function ProductSheet({
  product,
  onClose,
  onAdd,
}: {
  product: MenuProductSummary;
  onClose: () => void;
  onAdd: (variant: ProductSummary, quantity: number) => void;
}) {
  const availableVariants = product.variants.filter((variant) => variant.available);
  const firstAvailableVariantId = availableVariants[0]?.id ?? "";
  const [selectedVariantId, setSelectedVariantId] = useState(firstAvailableVariantId);
  const [quantity, setQuantity] = useState(1);

  const selectedVariant =
    availableVariants.find((variant) => variant.id === selectedVariantId) ??
    availableVariants[0] ??
    null;

  const showVariantPicker =
    availableVariants.length > 1 ||
    availableVariants.some((variant) => variant.sizeLabel !== null);

  useEffect(() => {
    setSelectedVariantId(firstAvailableVariantId);
    setQuantity(1);
  }, [firstAvailableVariantId, product.id]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/45">
      <button
        type="button"
        aria-label="Закрыть выбор товара"
        onClick={onClose}
        className="absolute inset-0"
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[34px] bg-[#fffaf4] shadow-2xl">
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-stone-300" />

        <div className="overflow-y-auto px-4 pb-6 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="kicker">Выбор позиции</p>
              <h2 className="mt-2 text-[34px] font-semibold leading-[0.96] tracking-tight text-stone-950">
                {product.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl text-stone-500 shadow-sm"
            >
              ×
            </button>
          </div>

          <div className="mt-4">
            <ProductArtwork product={product} emphasis="sheet" />
          </div>

          {product.description ? (
            <p className="mt-4 text-sm leading-6 text-stone-600">
              {product.description}
            </p>
          ) : null}

          <div className="mt-5 rounded-[28px] bg-white p-4 shadow-sm">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="kicker">Цена</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
                  {selectedVariant
                    ? formatMoney(selectedVariant.price)
                    : formatMoney(product.priceFrom)}
                </p>
              </div>
              <p className="text-xs leading-5 text-stone-500">
                {product.kind === "DRINK"
                  ? "Выберите объем, затем добавьте в корзину"
                  : "Можно сразу добавить в корзину"}
              </p>
            </div>

            {showVariantPicker ? (
              <div className="mt-5">
                <p className="kicker">Объем</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {availableVariants.map((variant) => {
                    const isSelected = variant.id === selectedVariantId;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`rounded-full border px-4 py-3 text-sm font-semibold transition ${
                          isSelected
                            ? "border-stone-950 bg-stone-950 text-white"
                            : "border-stone-200 bg-stone-50 text-stone-700"
                        }`}
                      >
                        {variant.sizeLabel ?? "Стандарт"}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="mt-5 flex items-center justify-between gap-4">
              <div>
                <p className="kicker">Количество</p>
                <p className="mt-2 text-sm text-stone-500">
                  Отредактировать можно и в корзине
                </p>
              </div>
              <QuantityControl
                quantity={quantity}
                onIncrement={() => setQuantity((current) => current + 1)}
                onDecrement={() => setQuantity((current) => Math.max(1, current - 1))}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-stone-200 bg-[#fffaf4] px-4 py-4">
          <div className="floating-bar flex items-center justify-between gap-3 px-3 py-3">
            <div>
              <p className="text-sm text-stone-500">{quantity} шт.</p>
              <p className="text-lg font-semibold tracking-tight text-stone-950">
                {selectedVariant
                  ? formatMoney(selectedVariant.price * quantity)
                  : formatMoney(product.priceFrom * quantity)}
              </p>
            </div>
            <button
              type="button"
              disabled={!selectedVariant}
              onClick={() => {
                if (!selectedVariant) {
                  return;
                }

                onAdd(selectedVariant, quantity);
                onClose();
              }}
              className="rounded-full bg-stone-950 px-5 py-3.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              Добавить в корзину
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MenuClient({
  products,
  viewer,
  initialQueueSummary,
}: MenuClientProps) {
  const ownerKey = getCartOwnerKey(viewer?.id);
  const addProduct = useCustomerCartStore((state) => state.addProduct);
  const items = useCustomerCartStore(selectCartByOwner(ownerKey));
  const hasHydrated = useCustomerCartStore((state) => state.hasHydrated);
  const [isMounted, setIsMounted] = useState(false);
  const categoryEntries = useMemo(() => buildCategoryEntries(products), [products]);
  const [activeCategory, setActiveCategory] = useState(categoryEntries[0]?.category ?? "");
  const [activeProduct, setActiveProduct] = useState<MenuProductSummary | null>(null);

  useEffect(() => {
    if (hasHydrated) {
      setIsMounted(true);
    }
  }, [hasHydrated]);

  useEffect(() => {
    if (!categoryEntries.some((entry) => entry.category === activeCategory)) {
      setActiveCategory(categoryEntries[0]?.category ?? "");
    }
  }, [activeCategory, categoryEntries]);

  const cartSummary = getCartSummary(items);
  const activeEntry =
    categoryEntries.find((entry) => entry.category === activeCategory) ??
    categoryEntries[0] ??
    null;

  function handleAddProduct(variant: ProductSummary, quantity: number) {
    for (let index = 0; index < quantity; index += 1) {
      addProduct(ownerKey, variant);
    }
  }

  return (
    <CustomerMobileShell
      viewer={viewer}
      queueSummary={initialQueueSummary}
      header={
        <div>
          <p className="kicker">Меню на сегодня</p>
          <h1 className="mt-2 text-[42px] font-semibold leading-[0.92] tracking-tight text-stone-950">
            Соберите заказ
            <br />
            за пару минут
          </h1>
          <p className="mt-3 max-w-[330px] text-sm leading-6 text-stone-600">
            Сначала выберите категорию, затем откройте товар и добавьте его в корзину
            через мобильный product sheet.
          </p>
        </div>
      }
    >
      <section className="grid grid-cols-2 gap-3">
        {categoryEntries.map((entry, index) => {
          const style = categoryStyles[entry.category] ?? categoryStyles["Напитки"];
          const previewNames = entry.products.slice(0, 2).map((product) => product.name);
          const isActive = entry.category === activeEntry?.category;

          return (
            <button
              key={entry.category}
              type="button"
              onClick={() => setActiveCategory(entry.category)}
              className={cn(
                "poster-tile min-h-[172px] border border-transparent p-4 text-left",
                style.bg,
                style.text,
                style.tall || index === 0 ? "col-span-2 min-h-[196px]" : "",
                isActive ? "ring-2 ring-white/90" : "",
              )}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent_32%)]" />
              <div className={cn("absolute -bottom-10 -right-8 h-36 w-36 rounded-full opacity-80", style.accent)} />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <p className="text-[30px] font-semibold leading-[0.95] tracking-tight">
                    {entry.category}
                  </p>
                  <p className="mt-2 text-sm text-stone-900/70">
                    {entry.products.length} позиций
                  </p>
                </div>

                <div className="flex items-end justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {previewNames.map((name) => (
                      <span
                        key={name}
                        className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-stone-800"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/30 text-lg">
                    →
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </section>

      {activeEntry ? (
        <section className="mt-6">
          <div className="overflow-x-auto pb-1">
            <div className="flex min-w-max gap-2">
              {categoryEntries.map((entry) => (
                <button
                  key={entry.category}
                  type="button"
                  onClick={() => setActiveCategory(entry.category)}
                  className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                    entry.category === activeEntry.category
                      ? "border-stone-950 bg-stone-950 text-white"
                      : "border-stone-200 bg-white text-stone-700"
                  }`}
                >
                  {entry.category}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="kicker">Категория</p>
              <h2 className="mt-2 text-[32px] font-semibold leading-[0.96] tracking-tight text-stone-950">
                {activeEntry.category}
              </h2>
            </div>
            <p className="text-sm text-stone-500">
              {activeEntry.products.length} позиций
            </p>
          </div>

          <div className="mt-4 space-y-4">
            {activeEntry.products.map((product) => {
              const hasManyVariants =
                product.kind === "DRINK" &&
                product.variants.filter((variant) => variant.available).length > 1;
              const sizePreview = product.variants
                .filter((variant) => variant.available && variant.sizeLabel)
                .slice(0, 3);

              return (
                <button
                  key={product.id}
                  type="button"
                  disabled={!product.available}
                  onClick={() => setActiveProduct(product)}
                  className="app-card w-full overflow-hidden p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ProductArtwork product={product} />

                  <div className="px-1 pb-1 pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          {product.kind === "DRINK" ? (
                            <span className="rounded-full bg-brand-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-700">
                              Напиток
                            </span>
                          ) : (
                            <span className="rounded-full bg-stone-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-600">
                              Еда
                            </span>
                          )}
                        </div>

                        <h3 className="mt-3 text-[28px] font-semibold leading-[0.96] tracking-tight text-stone-950">
                          {product.name}
                        </h3>

                        {product.description ? (
                          <p className="mt-2 text-sm leading-6 text-stone-500">
                            {truncateText(product.description, 110)}
                          </p>
                        ) : null}
                      </div>

                      {!product.available ? (
                        <span className="rounded-full bg-stone-200 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-600">
                          Нет
                        </span>
                      ) : (
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-950 text-lg text-white">
                          →
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-2xl font-semibold tracking-tight text-stone-950">
                          {product.priceFrom === product.priceTo
                            ? formatMoney(product.priceFrom)
                            : `от ${formatMoney(product.priceFrom)}`}
                        </p>
                        {sizePreview.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {sizePreview.map((variant) => (
                              <span
                                key={variant.id}
                                className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600"
                              >
                                {variant.sizeLabel}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <p className="text-right text-xs leading-5 text-stone-500">
                        {hasManyVariants
                          ? "Открыть и выбрать объём"
                          : "Открыть и добавить"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {isMounted && cartSummary.itemsCount > 0 ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 px-4">
          <div className="floating-bar pointer-events-auto mx-auto flex w-full max-w-[398px] items-center justify-between gap-4 px-4 py-3">
            <div>
              <p className="text-sm text-stone-500">
                {cartSummary.itemsCount} позиций в корзине
              </p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-stone-950">
                {formatMoney(cartSummary.totalPrice)}
              </p>
            </div>
            <Link
              href="/cart"
              className="rounded-full bg-stone-950 px-4 py-3 text-sm font-semibold text-white"
            >
              Открыть корзину
            </Link>
          </div>
        </div>
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
