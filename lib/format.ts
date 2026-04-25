export function formatOrderNumber(orderNumber: number) {
  return `#${orderNumber.toString().padStart(3, "0")}`;
}

export function groupProductsByCategory<T extends { category: string | null }>(
  products: T[],
) {
  return products.reduce<Record<string, T[]>>((groups, product) => {
    const category = product.category ?? "Other";
    groups[category] ??= [];
    groups[category].push(product);
    return groups;
  }, {});
}
