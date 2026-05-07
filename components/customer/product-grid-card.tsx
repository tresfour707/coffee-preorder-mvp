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

function PlusGlyph({ compact }: { compact: boolean }) {
  return (
    <span className={cn("relative block", compact ? "h-[15px] w-[15px]" : "h-[18px] w-[18px]")}>
      <span
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff7ef]",
          compact ? "h-[2px] w-[14px]" : "h-[2.25px] w-[16px]",
        )}
      />
      <span
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff7ef]",
          compact ? "h-[14px] w-[2px]" : "h-[16px] w-[2.25px]",
        )}
      />
    </span>
  );
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
          aria-label={`Добавить ${product.name}`}
          disabled={!product.available}
          onClick={() => onOpen(product)}
          className={cn(
            "ml-auto flex items-center justify-center rounded-full bg-[#c69a7d] shadow-[0_12px_26px_rgba(117,75,48,0.22)] transition hover:bg-[#bb8d70] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none",
            compact ? "h-8 w-[58px]" : "h-10 w-[74px]",
          )}
        >
          <PlusGlyph compact={compact} />
        </button>
      </div>
    </article>
  );
}
