"use client";

import { ProductArtwork } from "@/components/customer/product-artwork";
import { cn } from "@/lib/cn";
import { sortProductVariants } from "@/lib/menu-catalog";
import { formatMoney } from "@/lib/money";
import type { MenuProductSummary } from "@/lib/types";

type ProductGridCardProps = {
  product: MenuProductSummary;
  onOpen: (product: MenuProductSummary) => void;
  stableLayout?: boolean;
};

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

export function ProductGridCard({
  product,
  onOpen,
  stableLayout = false,
}: ProductGridCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[22px] bg-white p-2 shadow-[0_6px_18px_rgba(17,24,39,0.05)]">
      <button
        type="button"
        onClick={() => onOpen(product)}
        disabled={!product.available}
        className="block w-full flex-none text-left disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ProductArtwork product={product} className="rounded-[18px]" />

        <div className="px-1 pb-1 pt-3">
          <h2
            className={cn(
              "text-[17px] font-medium leading-[1.16] tracking-tight text-stone-950",
              stableLayout ? "min-h-[60px]" : "",
            )}
          >
            {product.name}
          </h2>
          <p className="mt-2 text-[15px] text-stone-400">
            {getProductMeta(product)}
          </p>
        </div>
      </button>

      <div className="mt-auto px-1 pb-1 pt-2">
        <button
          type="button"
          disabled={!product.available}
          onClick={() => onOpen(product)}
          className="ml-auto flex h-10 w-[74px] items-center justify-center rounded-full bg-[#3f2a1d] text-[28px] font-light leading-none text-white transition hover:bg-[#302016] disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          +
        </button>
      </div>
    </article>
  );
}
