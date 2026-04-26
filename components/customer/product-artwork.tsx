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
    emoji: string;
    tag: string;
  }
> = {
  Напитки: {
    panel: "from-[#f3dcc9] to-[#efd0bb]",
    accent: "bg-[#f8ede3]",
    emoji: "☕",
    tag: "кофе",
  },
  Завтрак: {
    panel: "from-[#f0d689] to-[#efc766]",
    accent: "bg-[#fbf0c1]",
    emoji: "🥐",
    tag: "утро",
  },
  "Холодные закуски": {
    panel: "from-[#f0c3b2] to-[#ebb09b]",
    accent: "bg-[#f8ded4]",
    emoji: "🥪",
    tag: "с собой",
  },
  "Вторые блюда": {
    panel: "from-[#dbe08f] to-[#c9d36c]",
    accent: "bg-[#eef3be]",
    emoji: "🍳",
    tag: "кухня",
  },
  Десерт: {
    panel: "from-[#efc0cb] to-[#e8a7b6]",
    accent: "bg-[#f8dde4]",
    emoji: "🍰",
    tag: "сладкое",
  },
};

export function ProductArtwork({
  product,
  className,
  emphasis = "card",
}: ProductArtworkProps) {
  const style = categoryStyles[product.category ?? "Напитки"] ?? categoryStyles["Напитки"];
  const isSheet = emphasis === "sheet";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[30px] bg-gradient-to-br",
        style.panel,
        isSheet ? "h-[250px]" : "h-[108px] w-[104px] shrink-0",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.34),transparent_32%)]" />
      <div
        className={cn(
          "absolute rounded-full blur-sm",
          style.accent,
          isSheet ? "-right-6 top-8 h-28 w-28" : "-right-4 top-5 h-16 w-16",
        )}
      />
      <div
        className={cn(
          "absolute rounded-full bg-white/30",
          isSheet ? "bottom-6 left-5 h-24 w-24" : "bottom-4 left-3 h-12 w-12",
        )}
      />

      <div className="absolute left-4 top-4 rounded-full bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-stone-700">
        {style.tag}
      </div>

      <div
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none leading-none",
          isSheet ? "text-[104px]" : "text-[54px]",
        )}
      >
        {style.emoji}
      </div>
    </div>
  );
}
