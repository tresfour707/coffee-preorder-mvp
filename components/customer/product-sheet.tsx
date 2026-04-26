"use client";

import { useEffect, useState } from "react";

import { ProductArtwork } from "@/components/customer/product-artwork";
import { QuantityControl } from "@/components/ui/quantity-control";
import { sortProductVariants } from "@/lib/menu-catalog";
import { formatMoney } from "@/lib/money";
import type { MenuProductSummary, ProductSummary } from "@/lib/types";

type ProductSheetProps = {
  product: MenuProductSummary;
  onClose: () => void;
  onAdd: (variant: ProductSummary, quantity: number) => void;
};

export function ProductSheet({
  product,
  onClose,
  onAdd,
}: ProductSheetProps) {
  const availableVariants = sortProductVariants(
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
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-stone-950/30 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Закрыть карточку товара"
        onClick={onClose}
        className="absolute inset-0"
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[34px] bg-[#fffdf9] shadow-2xl">
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-stone-300" />

        <div className="overflow-y-auto px-4 pb-6 pt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-stone-400">
                {product.kind === "DRINK" ? "Напитки" : product.category}
              </p>
              <h2 className="mt-2 text-[32px] font-semibold leading-[0.96] tracking-tight text-stone-950">
                {product.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5f4f1] text-[26px] text-stone-500"
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
                <p className="mt-2 text-[32px] font-semibold leading-none tracking-tight text-stone-950">
                  {selectedVariant
                    ? formatMoney(selectedVariant.price)
                    : formatMoney(product.priceFrom)}
                </p>
              </div>
              <p className="max-w-[132px] text-right text-xs leading-5 text-stone-500">
                {product.kind === "DRINK"
                  ? "Выберите объём и добавьте в корзину"
                  : "Можно добавить сразу"}
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

        <div className="border-t border-stone-200 bg-[#fffdf9] px-4 py-4">
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
                className="rounded-full bg-[#ff5a4f] px-5 py-3.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-stone-300"
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
