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
  compact?: boolean;
  className?: string;
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
  compact = false,
  className,
}: ProductGridCardProps) {
  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden bg-white shadow-[0_6px_18px_rgba(17,24,39,0.05)]",
        compact ? "rounded-[20px] p-1.5" : "rounded-[22px] p-2",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(product)}
        disabled={!product.available}
        className="block w-full flex-none text-left disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ProductArtwork
          product={product}
          size={compact ? "compact" : "regular"}
          className={compact ? "rounded-[16px]" : "rounded-[18px]"}
        />

        <div className={cn("px-1 pb-1", compact ? "pt-2.5" : "pt-3")}>
          <h2
            className={cn(
              "font-medium leading-[1.16] tracking-tight text-stone-950",
              compact ? "text-[15px]" : "text-[17px]",
              stableLayout ? (compact ? "min-h-[42px]" : "min-h-[60px]") : "",
            )}
          >
            {product.name}
          </h2>
          <p className={cn("text-stone-400", compact ? "mt-1.5 text-[13px]" : "mt-2 text-[15px]")}>
            {getProductMeta(product)}
          </p>
        </div>
      </button>

      <div className={cn("mt-auto px-1 pb-1", compact ? "pt-1.5" : "pt-2")}>
        <button
          type="button"
          disabled={!product.available}
          onClick={() => onOpen(product)}
          className={cn(
            "ml-auto flex items-center justify-center rounded-full bg-[#3f2a1d] font-light leading-none text-white transition hover:bg-[#302016] disabled:cursor-not-allowed disabled:bg-stone-300",
            compact ? "h-8 w-[58px] text-[23px]" : "h-10 w-[74px] text-[28px]",
          )}
        >
          +
        </button>
      </div>
    </article>
  );
}
