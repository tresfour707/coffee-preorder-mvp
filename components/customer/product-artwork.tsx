import Image from "next/image";

import { cn } from "@/lib/cn";
import { getProductMedia } from "@/lib/product-media";
import type { MenuProductSummary } from "@/lib/types";

type ProductArtworkProps = {
  product: Pick<MenuProductSummary, "name" | "category" | "kind">;
  className?: string;
  emphasis?: "card" | "sheet";
  size?: "regular" | "compact";
};

function getDrinkPalette(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes("маття") || normalized.includes("матча")) {
    return {
      liquid: "bg-[#9bc65a]",
      foam: "bg-[#dbeec0]",
      swirl: "bg-[radial-gradient(circle_at_50%_50%,#f5f4ef_0%,#f5f4ef_28%,transparent_29%),radial-gradient(circle_at_54%_42%,transparent_0%,transparent_33%,#f5f4ef_34%,#f5f4ef_38%,transparent_39%),radial-gradient(circle_at_44%_58%,transparent_0%,transparent_38%,#f5f4ef_39%,#f5f4ef_43%,transparent_44%)]",
    };
  }

  if (
    normalized.includes("айс") ||
    normalized.includes("холод") ||
    normalized.includes("лимонад") ||
    normalized.includes("тоник") ||
    normalized.includes("бамбл")
  ) {
    return {
      liquid: "bg-[#d5b080]",
      foam: "bg-[#f8e9ce]",
      swirl: "bg-[radial-gradient(circle_at_50%_50%,#fff4e1_0%,#fff4e1_24%,transparent_25%),radial-gradient(circle_at_58%_44%,transparent_0%,transparent_31%,#fff4e1_32%,#fff4e1_37%,transparent_38%)]",
    };
  }

  return {
    liquid: "bg-[#a66630]",
    foam: "bg-[#d59d53]",
    swirl: "bg-[radial-gradient(circle_at_50%_50%,#f6f3ee_0%,#f6f3ee_27%,transparent_28%),radial-gradient(circle_at_58%_44%,transparent_0%,transparent_31%,#f6f3ee_32%,#f6f3ee_37%,transparent_38%),radial-gradient(circle_at_42%_56%,transparent_0%,transparent_37%,#f6f3ee_38%,#f6f3ee_42%,transparent_43%)]",
  };
}

function CupArt({
  name,
  isSheet,
  isCompact,
}: {
  name: string;
  isSheet: boolean;
  isCompact: boolean;
}) {
  const palette = getDrinkPalette(name);

  return (
    <>
      <div
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 rounded-full bg-black/8 blur-md",
          isSheet
            ? "h-6 w-40 translate-y-[86px]"
            : isCompact
              ? "h-3 w-20 translate-y-[48px]"
              : "h-4 w-24 translate-y-[58px]",
        )}
      />
      <div
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_10px_25px_rgba(17,24,39,0.08)]",
          isSheet ? "h-44 w-44" : isCompact ? "h-24 w-24" : "h-28 w-28",
        )}
      >
        <div
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full",
            palette.liquid,
            isSheet ? "h-32 w-32" : isCompact ? "h-[70px] w-[70px]" : "h-20 w-20",
          )}
        />
        <div
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-85",
            palette.foam,
            isSheet
              ? "h-[106px] w-[106px]"
              : isCompact
                ? "h-[58px] w-[58px]"
                : "h-[68px] w-[68px]",
          )}
        />
        <div
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-90",
            palette.swirl,
            isSheet
              ? "h-[84px] w-[84px]"
              : isCompact
                ? "h-[44px] w-[44px]"
                : "h-[52px] w-[52px]",
          )}
        />
      </div>
    </>
  );
}

function PlateArt({
  category,
  isSheet,
  isCompact,
}: {
  category: string | null;
  isSheet: boolean;
  isCompact: boolean;
}) {
  const accent =
    category === "Десерт"
      ? "bg-[#7d3f39]"
      : category === "Завтрак"
        ? "bg-[#ca8b37]"
        : category === "Холодные закуски"
          ? "bg-[#7ead5e]"
          : "bg-[#d6864a]";

  const side =
    category === "Десерт"
      ? "bg-[#e85c6c]"
      : category === "Холодные закуски"
        ? "bg-[#a3d689]"
        : "bg-[#f3d38a]";

  return (
    <>
      <div
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 rounded-full bg-black/8 blur-md",
          isSheet
            ? "h-6 w-44 translate-y-[84px]"
            : isCompact
              ? "h-3 w-24 translate-y-[50px]"
              : "h-4 w-28 translate-y-[60px]",
        )}
      />
      <div
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_10px_25px_rgba(17,24,39,0.08)]",
          isSheet ? "h-40 w-40" : isCompact ? "h-[90px] w-[90px]" : "h-[104px] w-[104px]",
        )}
      >
        <div
          className={cn(
            "absolute rounded-full",
            accent,
            isSheet
              ? "right-[30px] top-[46px] h-14 w-20 rotate-12"
              : isCompact
                ? "right-[16px] top-[26px] h-8 w-12 rotate-12"
                : "right-[18px] top-[30px] h-10 w-14 rotate-12",
          )}
        />
        <div
          className={cn(
            "absolute rounded-full",
            side,
            isSheet
              ? "left-[26px] top-[58px] h-12 w-14 rotate-[-18deg]"
              : isCompact
                ? "left-[14px] top-[34px] h-7 w-9 rotate-[-18deg]"
                : "left-[16px] top-[38px] h-8 w-10 rotate-[-18deg]",
          )}
        />
        <div
          className={cn(
            "absolute rounded-full bg-[#58a04a]",
            isSheet
              ? "left-[60px] top-[30px] h-7 w-7"
              : isCompact
                ? "left-[33px] top-[16px] h-4 w-4"
                : "left-[38px] top-[18px] h-5 w-5",
          )}
        />
      </div>
    </>
  );
}

export function ProductArtwork({
  product,
  className,
  emphasis = "card",
  size = "regular",
}: ProductArtworkProps) {
  const isSheet = emphasis === "sheet";
  const isCompact = !isSheet && size === "compact";
  const productMedia = getProductMedia(product.name);

  if (productMedia) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-[24px] bg-[#f5f2ed]",
          isSheet ? "h-[280px]" : isCompact ? "h-[132px] w-full" : "h-[170px] w-full",
          className,
        )}
      >
        <Image
          src={productMedia.src}
          alt={productMedia.alt}
          fill
          sizes={isSheet ? "520px" : "(max-width: 430px) 50vw, 220px"}
          className="object-cover"
          style={{ objectPosition: productMedia.objectPosition ?? "center center" }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
          "relative overflow-hidden rounded-[24px] bg-[#f5f4f1]",
        isSheet ? "h-[250px]" : isCompact ? "h-[132px] w-full" : "h-[170px] w-full",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_32%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.58)_0%,rgba(245,244,241,0.92)_100%)]" />

      {product.kind === "DRINK" ? (
        <CupArt name={product.name} isSheet={isSheet} isCompact={isCompact} />
      ) : (
        <PlateArt
          category={product.category}
          isSheet={isSheet}
          isCompact={isCompact}
        />
      )}
    </div>
  );
}
