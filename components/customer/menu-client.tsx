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
  "Напитки",
  "Завтрак",
  "Холодные закуски",
  "Вторые блюда",
  "Десерт",
] as const;

const categoryVisuals: Record<
  string,
  {
    poster: string;
    accent: string;
    text: string;
    emoji: string;
    preview: string;
  }
> = {
  Напитки: {
    poster: "bg-[linear-gradient(180deg,#f0c6ab_0%,#eab996_100%)]",
    accent: "bg-[#fff0e6]",
    text: "text-stone-950",
    emoji: "☕",
    preview: "Кофе, латте и раф",
  },
  Завтрак: {
    poster: "bg-[linear-gradient(180deg,#f2d48a_0%,#edc667_100%)]",
    accent: "bg-[#fbefc3]",
    text: "text-stone-950",
    emoji: "🥐",
    preview: "Круассаны и утренние позиции",
  },
  "Холодные закуски": {
    poster: "bg-[linear-gradient(180deg,#efc4b4_0%,#e8af98_100%)]",
    accent: "bg-[#f8dfd6]",
    text: "text-stone-950",
    emoji: "🥪",
    preview: "Лёгкие закуски на ходу",
  },
  "Вторые блюда": {
    poster: "bg-[linear-gradient(180deg,#d9e28f_0%,#c6d26b_100%)]",
    accent: "bg-[#eef4c3]",
    text: "text-stone-950",
    emoji: "🍳",
    preview: "Горячая кухня и сытные блюда",
  },
  Десерт: {
    poster: "bg-[linear-gradient(180deg,#efc2cc_0%,#e7a9b8_100%)]",
    accent: "bg-[#f7dee6]",
    text: "text-stone-950",
    emoji: "🍰",
    preview: "Сладкое к кофе",
  },
};

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

function sortVariants(variants: ProductSummary[]) {
  return [...variants].sort((left, right) => {
    const leftSort = left.sizeSort ?? 999;
    const rightSort = right.sizeSort ?? 999;
    return leftSort - rightSort;
  });
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
  const availableVariants = sortVariants(
    product.variants.filter((variant) => variant.available),
  );
  const firstAvailableVariantId = availableVariants[0]?.id ?? "";
  const [selectedVariantId, setSelectedVariantId] = useState(firstAvailableVariantId);
  const [quantity, setQuantity] = useState(1);

  const selectedVariant =
    availableVariants.find((variant) => variant.id === selectedVariantId) ??
    availableVariants[0] ??
    null;

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
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-stone-950/35 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Закрыть карточку товара"
        onClick={onClose}
        className="absolute inset-0"
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[36px] bg-[#fff8f2] shadow-2xl">
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-stone-300" />

        <div className="overflow-y-auto px-4 pb-6 pt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                {product.kind === "DRINK" ? "Напиток" : product.category}
              </p>
              <h2 className="mt-2 text-[34px] font-semibold leading-[0.95] tracking-tight text-stone-950">
                {product.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[26px] text-stone-500 shadow-sm"
            >
              ×
            </button>
          </div>

          <div className="mt-4">
            <ProductArtwork product={product} emphasis="sheet" />
          </div>

          {product.description ? (
            <p className="mt-4 text-sm leading-6 text-stone-600">{product.description}</p>
          ) : null}

          <section className="customer-soft-card mt-5 px-4 py-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="kicker text-stone-400">Стоимость</p>
                <p className="mt-2 text-[34px] font-semibold leading-none tracking-tight text-stone-950">
                  {selectedVariant
                    ? formatMoney(selectedVariant.price)
                    : formatMoney(product.priceFrom)}
                </p>
              </div>
              <p className="max-w-[132px] text-right text-xs leading-5 text-stone-500">
                {product.kind === "DRINK"
                  ? "Выберите объём и добавьте в корзину"
                  : "Готово к добавлению"}
              </p>
            </div>

            {availableVariants.length > 1 ||
            availableVariants.some((variant) => variant.sizeLabel !== null) ? (
              <div className="mt-5">
                <p className="kicker text-stone-400">Объём</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {availableVariants.map((variant) => {
                    const isSelected = variant.id === selectedVariantId;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                          isSelected
                            ? "bg-stone-950 text-white"
                            : "bg-white text-stone-700 shadow-sm"
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
                <p className="kicker text-stone-400">Количество</p>
                <p className="mt-2 text-sm text-stone-500">Изменить можно и позже</p>
              </div>

              <QuantityControl
                quantity={quantity}
                onIncrement={() => setQuantity((current) => current + 1)}
                onDecrement={() => setQuantity((current) => Math.max(1, current - 1))}
              />
            </div>
          </section>
        </div>

        <div className="border-t border-stone-200 bg-[#fff8f2] px-4 py-4">
          <div className="customer-action-bar-inner max-w-none px-3 py-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-stone-500">{quantity} шт.</p>
                <p className="mt-1 text-lg font-semibold tracking-tight text-stone-950">
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
                Добавить
              </button>
            </div>
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

  function handleOpenCategory(category: string) {
    setActiveCategory(category);
    window.setTimeout(() => {
      document.getElementById("product-list")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 10);
  }

  return (
    <CustomerMobileShell
      viewer={viewer}
      queueSummary={initialQueueSummary}
      className="pb-28"
      header={
        <section className="customer-hero">
          <div className="absolute -bottom-8 -right-4 h-32 w-32 rounded-full bg-white/36" />
          <div className="absolute bottom-12 right-10 text-[72px] leading-none text-stone-400/18">
            ☁
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">
              online order
            </p>
            <h1 className="mt-4 text-[42px] font-semibold leading-[0.92] tracking-tight text-stone-950">
              Кофе и еда
              <br />
              без лишней суеты
            </h1>
            <p className="mt-4 max-w-[290px] text-sm leading-6 text-stone-700">
              Сначала выбираете категорию, затем товар, после оплаты заказ попадает в
              общую очередь.
            </p>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() =>
                  document.getElementById("categories")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                className="flex w-full items-center justify-center rounded-full border border-white/70 bg-white/42 px-5 py-4 text-sm font-semibold text-stone-950 backdrop-blur-sm"
              >
                Смотреть меню
              </button>
              <Link
                href={viewer ? "/orders" : "/sign-in"}
                className="flex w-full items-center justify-center rounded-full bg-stone-950 px-5 py-4 text-sm font-semibold text-white shadow-soft"
              >
                {viewer ? "Мои заказы" : "Войти в аккаунт"}
              </Link>
            </div>
          </div>
        </section>
      }
    >
      <section id="categories" className="space-y-3">
        {categoryEntries.map((entry, index) => {
          const visual = categoryVisuals[entry.category] ?? categoryVisuals["Напитки"];

          return (
            <button
              key={entry.category}
              type="button"
              onClick={() => handleOpenCategory(entry.category)}
              className={`customer-poster-card min-h-[168px] w-full ${visual.poster} ${visual.text} ${
                index === 0 ? "min-h-[196px]" : ""
              }`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.42),transparent_34%)]" />
              <div className="absolute -bottom-8 -right-6 h-28 w-28 rounded-full bg-white/28" />
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[34px] font-semibold leading-[0.92] tracking-tight">
                      {entry.category}
                    </p>
                    <p className="mt-2 max-w-[210px] text-sm leading-6 text-stone-900/72">
                      {visual.preview}
                    </p>
                  </div>
                  <div className="rounded-full bg-white/40 px-3 py-2 text-[32px] leading-none">
                    {visual.emoji}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="rounded-full bg-white/72 px-3 py-2 text-xs font-semibold text-stone-800">
                    {entry.products.length} позиций
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${visual.accent} text-lg`}>
                    →
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </section>

      {activeEntry ? (
        <section id="product-list" className="mt-6">
          <div className="customer-soft-card px-5 py-5">
            <p className="kicker text-stone-400">Сейчас открыто</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-[34px] font-semibold leading-[0.95] tracking-tight text-stone-950">
                  {activeEntry.category}
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Нажмите на позицию, чтобы открыть её и настроить перед добавлением в
                  корзину.
                </p>
              </div>
              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm">
                {activeEntry.products.length}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {activeEntry.products.map((product) => {
              const sizePreview = sortVariants(
                product.variants.filter((variant) => variant.available && variant.sizeLabel),
              ).slice(0, 3);

              return (
                <button
                  key={product.id}
                  type="button"
                  disabled={!product.available}
                  onClick={() => setActiveProduct(product)}
                  className="customer-soft-card-strong flex w-full items-start gap-4 p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ProductArtwork product={product} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-stone-400">
                          {product.kind === "DRINK" ? "напиток" : product.category}
                        </p>
                        <h3 className="mt-2 text-[24px] font-semibold leading-[0.96] tracking-tight text-stone-950">
                          {product.name}
                        </h3>
                      </div>

                      <span className="pt-1 text-lg text-stone-400">→</span>
                    </div>

                    {product.description ? (
                      <p className="mt-2 text-sm leading-6 text-stone-600">
                        {product.description}
                      </p>
                    ) : null}

                    <div className="mt-4 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xl font-semibold tracking-tight text-stone-950">
                          {product.priceFrom === product.priceTo
                            ? formatMoney(product.priceFrom)
                            : `от ${formatMoney(product.priceFrom)}`}
                        </p>
                        {sizePreview.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {sizePreview.map((variant) => (
                              <span
                                key={variant.id}
                                className="rounded-full bg-[#f8eee7] px-3 py-1 text-xs font-semibold text-stone-600"
                              >
                                {variant.sizeLabel}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      {!product.available ? (
                        <span className="rounded-full bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-500">
                          Нет в наличии
                        </span>
                      ) : (
                        <span className="text-right text-xs leading-5 text-stone-500">
                          Открыть
                          <br />
                          и выбрать
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <section id="contacts" className="mt-6 customer-soft-card px-5 py-5">
        <p className="kicker text-stone-400">Контакты</p>
        <h2 className="mt-3 text-[32px] font-semibold leading-[0.95] tracking-tight text-stone-950">
          Раздел для кофейни
        </h2>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Реальные адрес, режим работы и контакты добавим после финального согласования
          с владельцем. Сейчас здесь зафиксирован слот под будущий контент.
        </p>
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
              className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Корзина
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
