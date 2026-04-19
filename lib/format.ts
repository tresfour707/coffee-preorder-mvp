import type { ProductSummary } from "@/lib/types";

export function formatOrderNumber(orderNumber: number) {
  return `#${orderNumber.toString().padStart(3, "0")}`;
}

export function groupProductsByCategory(products: ProductSummary[]) {
  return products.reduce<Record<string, ProductSummary[]>>((groups, product) => {
    const category = product.category ?? "Other";
    groups[category] ??= [];
    groups[category].push(product);
    return groups;
  }, {});
}
