"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AuthActions } from "@/components/auth/auth-actions";
import { CustomerTopNav } from "@/components/customer/customer-top-nav";
import { PublicQueueBanner } from "@/components/customer/public-queue-banner";
import { PageShell } from "@/components/ui/page-shell";
import { getCartSummary } from "@/lib/cart";
import {
  getCartOwnerKey,
  selectCartByOwner,
  useCustomerCartStore,
} from "@/lib/cart-store";
import { groupProductsByCategory } from "@/lib/format";
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

function getCategorySectionId(index: number) {
  return `category-${index + 1}`;
}

function getProductPriceLabel(product: MenuProductSummary) {
  if (product.priceFrom === product.priceTo) {
    return formatMoney(product.priceFrom);
  }

  return `от ${formatMoney(product.priceFrom)}`;
}

function shouldOpenSizePicker(product: MenuProductSummary) {
  return (
    product.kind === "DRINK" &&
    product.variants.filter((variant) => variant.available).length > 1
  );
}

type ProductSheetProps = {
  product: MenuProductSummary;
  onClose: () => void;
  onAdd: (variant: ProductSummary) => void;
};

function ProductSheet({ product, onClose, onAdd }: ProductSheetProps) {
  const availableVariants = product.variants.filter((variant) => variant.available);
  const [selectedVariantId, setSelectedVariantId] = useState(
    availableVariants[0]?.id ?? "",
  );

  const selectedVariant =
    availableVariants.find((variant) => variant.id === selectedVariantId) ??
    availableVariants[0] ??
    null;

  useEffect(() => {
    setSelectedVariantId(availableVariants[0]?.id ?? "");
  }, [product.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/45 p-4 sm:items-center">
      <button
        type="button"
        aria-label="Закрыть выбор объёма"
        onClick={onClose}
        className="absolute inset-0"
      />

      <div className="relative z-10 w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
        <p className="label-muted">Выбор объёма</p>
        <h3 className="mt-2 text-2xl font-semibold text-stone-900">
          {product.name}
        </h3>
        {product.description ? (
          <p className="mt-3 text-sm leading-6 text-stone-600">
            {product.description}
          </p>
        ) : null}

        <div className="mt-6 grid gap-3">
          {availableVariants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              onClick={() => setSelectedVariantId(variant.id)}
              className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                variant.id === selectedVariantId
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-200 bg-white text-stone-900 hover:border-stone-400"
              }`}
            >
              <div>
                <p className="text-base font-semibold">
                  {variant.sizeLabel ?? "Стандарт"}
                </p>
                <p
                  className={`mt-1 text-sm ${
                    variant.id === selectedVariantId
                      ? "text-stone-200"
                      : "text-stone-500"
                  }`}
                >
                  {variant.displayName}
                </p>
              </div>
              <p className="text-base font-semibold">{formatMoney(variant.price)}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 justify-center rounded-full border border-stone-300 bg-white px-5 py-4 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
          >
            Отмена
          </button>
          <button
            type="button"
            disabled={!selectedVariant}
            onClick={() => {
              if (!selectedVariant) {
                return;
              }

              onAdd(selectedVariant);
              onClose();
            }}
            className="inline-flex flex-1 justify-center rounded-full bg-stone-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {selectedVariant
              ? `Добавить за ${formatMoney(selectedVariant.price)}`
              : "Недоступно"}
          </button>
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
  const [activeProduct, setActiveProduct] = useState<MenuProductSummary | null>(null);

  useEffect(() => {
    if (hasHydrated) {
      setIsMounted(true);
    }
  }, [hasHydrated]);

  const groupedProducts = useMemo(
    () => Object.entries(groupProductsByCategory(products)),
    [products],
  );
  const cartSummary = getCartSummary(items);

  function handleAddProduct(product: MenuProductSummary) {
    const firstAvailableVariant = product.variants.find((variant) => variant.available);

    if (!firstAvailableVariant) {
      return;
    }

    if (shouldOpenSizePicker(product)) {
      setActiveProduct(product);
      return;
    }

    addProduct(ownerKey, firstAvailableVariant);
  }

  return (
    <PageShell
      className={isMounted && cartSummary.itemsCount > 0 ? "pb-28 md:pb-32" : undefined}
      eyebrow={viewer ? "Клиент" : "Гость"}
      title="Меню"
      description="Еда добавляется сразу, а для напитков с несколькими объёмами сначала открывается выбор размера. Это быстрее и привычнее на телефоне."
      subnav={<CustomerTopNav viewer={viewer} />}
      banner={<PublicQueueBanner initialSummary={initialQueueSummary} />}
      actions={
        <>
          <Link
            href="/cart"
            className="inline-flex rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Открыть корзину
          </Link>
          <AuthActions viewer={viewer} />
        </>
      }
    >
      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex min-w-max gap-2">
          {groupedProducts.map(([category], index) => (
            <a
              key={category}
              href={`#${getCategorySectionId(index)}`}
              className="inline-flex rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
            >
              {category}
            </a>
          ))}
        </div>
      </div>

      <div className="grid gap-8">
        {groupedProducts.map(([category, categoryProducts], index) => (
          <section
            key={category}
            id={getCategorySectionId(index)}
            className="scroll-mt-40"
          >
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="label-muted">{category}</p>
                <h2 className="mt-1 text-xl font-semibold text-stone-900 md:text-2xl">
                  {category}
                </h2>
              </div>
              <p className="hidden text-sm text-stone-500 md:block">
                {category === "Напитки"
                  ? "Для напитков с объёмами сначала открывается выбор размера."
                  : "Добавляйте еду в корзину прямо из карточки."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {categoryProducts.map((product) => {
                const showSizePicker = shouldOpenSizePicker(product);
                const hasVariants = product.variants.some((variant) => variant.sizeLabel);

                return (
                  <article
                    key={product.id}
                    className="surface flex min-h-52 flex-col p-4 transition hover:-translate-y-0.5 md:min-h-56 md:p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-stone-900 md:text-xl">
                            {product.name}
                          </h3>
                          {product.kind === "DRINK" ? (
                            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                              Напиток
                            </span>
                          ) : null}
                        </div>

                        {product.description ? (
                          <p className="mt-2 text-sm leading-6 text-stone-600">
                            {product.description}
                          </p>
                        ) : null}

                        {hasVariants ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {product.variants.map((variant) => (
                              <span
                                key={variant.id}
                                className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600"
                              >
                                {variant.sizeLabel}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      {!product.available ? (
                        <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
                          Нет
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-3 pt-6 md:pt-8">
                      <div>
                        <p className="label-muted">
                          {showSizePicker ? "Цена от" : "Цена"}
                        </p>
                        <p className="mt-1 text-xl font-semibold text-stone-900 md:text-2xl">
                          {getProductPriceLabel(product)}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={!product.available}
                        onClick={() => handleAddProduct(product)}
                        className="rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
                      >
                        {showSizePicker ? "Выбрать объём" : "Добавить"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {isMounted && cartSummary.itemsCount > 0 ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 px-4">
          <div className="pointer-events-auto mx-auto flex max-w-xl items-center justify-between rounded-[1.75rem] bg-stone-900 px-4 py-3 text-white shadow-2xl md:rounded-full md:px-5 md:py-4">
            <div>
              <p className="text-sm text-stone-300">
                {cartSummary.itemsCount} позиций в корзине
              </p>
              <p className="text-base font-semibold md:text-lg">
                {formatMoney(cartSummary.totalPrice)}
              </p>
            </div>
            <Link
              href="/cart"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-900"
            >
              Перейти
            </Link>
          </div>
        </div>
      ) : null}

      {activeProduct ? (
        <ProductSheet
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
          onAdd={(variant) => addProduct(ownerKey, variant)}
        />
      ) : null}
    </PageShell>
  );
}
