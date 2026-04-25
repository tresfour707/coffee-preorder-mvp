import { cn } from "@/lib/cn";
import type { MenuProductSummary } from "@/lib/types";

type ProductArtworkProps = {
  product: Pick<MenuProductSummary, "name" | "category" | "kind">;
  className?: string;
  emphasis?: "card" | "sheet";
};

const categoryStyles: Record<
  string,
  {
    panel: string;
    accent: string;
    accentSoft: string;
    tag: string;
  }
> = {
  "Завтрак": {
    panel: "bg-[#f3d06f]",
    accent: "bg-[#b96f36]",
    accentSoft: "bg-[#f7ebbe]",
    tag: "утро",
  },
  "Холодные закуски": {
    panel: "bg-[#f0b79f]",
    accent: "bg-[#c0684c]",
    accentSoft: "bg-[#f7d8ca]",
    tag: "сэндвич",
  },
  "Вторые блюда": {
    panel: "bg-[#d8d57a]",
    accent: "bg-[#6f7b35]",
    accentSoft: "bg-[#eceab4]",
    tag: "кухня",
  },
  Десерт: {
    panel: "bg-[#efb0ae]",
    accent: "bg-[#c15c75]",
    accentSoft: "bg-[#f7d4d3]",
    tag: "сладкое",
  },
  Напитки: {
    panel: "bg-[#f0d1a6]",
    accent: "bg-[#8b5830]",
    accentSoft: "bg-[#f8e9d2]",
    tag: "coffee",
  },
};

export function ProductArtwork({
  product,
  className,
  emphasis = "card",
}: ProductArtworkProps) {
  const style = categoryStyles[product.category ?? "Напитки"] ?? categoryStyles["Напитки"];
  const isDrink = product.kind === "DRINK";
  const cupScale = emphasis === "sheet" ? "h-48 w-40" : "h-36 w-28";
  const foodScale = emphasis === "sheet" ? "h-44 w-52" : "h-28 w-36";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[30px]",
        style.panel,
        emphasis === "sheet" ? "h-[270px]" : "h-[196px]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.45),transparent_32%)]" />
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/25" />
      <div className="absolute left-4 top-4 rounded-full bg-white/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-800/70">
        {style.tag}
      </div>

      {isDrink ? (
        <>
          <div className="absolute bottom-7 left-1/2 h-6 w-32 -translate-x-1/2 rounded-full bg-black/10 blur-md" />
          <div
            className={cn(
              "absolute bottom-10 left-1/2 -translate-x-1/2 rounded-b-[34px] rounded-t-[22px] border border-white/70",
              cupScale,
              style.accentSoft,
            )}
          />
          <div
            className={cn(
              "absolute left-1/2 -translate-x-1/2 rounded-full border border-white/80 bg-white",
              emphasis === "sheet" ? "bottom-[218px] h-9 w-40" : "bottom-[150px] h-7 w-28",
            )}
          />
          <div
            className={cn(
              "absolute left-1/2 -translate-x-1/2 rounded-full bg-white/55 text-center text-[9px] font-semibold uppercase tracking-[0.28em] text-white/90",
              emphasis === "sheet"
                ? "bottom-[118px] w-48 rotate-90 px-2 py-10"
                : "bottom-[82px] w-32 rotate-90 px-1 py-6",
            )}
          >
            slow time moves
          </div>
        </>
      ) : (
        <>
          <div className="absolute bottom-6 left-1/2 h-6 w-40 -translate-x-1/2 rounded-full bg-black/10 blur-md" />
          <div
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[44%_56%_53%_47%/49%_48%_52%_51%]",
              foodScale,
              style.accent,
            )}
          />
          <div
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%_50%_48%_52%/50%_44%_56%_50%] border border-white/55",
              emphasis === "sheet" ? "h-28 w-32 rotate-12" : "h-20 w-24 rotate-12",
              style.accentSoft,
            )}
          />
        </>
      )}

      <div className="absolute bottom-4 left-4 rounded-full bg-white/82 px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm">
        {product.name}
      </div>
    </div>
  );
}
