import { prisma } from "@/lib/prisma";
import type { MenuProductSummary, ProductSummary } from "@/lib/types";

type ProductRecord = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  available: boolean;
  kind: "FOOD" | "DRINK";
  category: string | null;
  groupKey: string | null;
  sizeLabel: string | null;
  sizeSort: number | null;
  sortOrder: number;
};

export function formatProductDisplayName(product: {
  name: string;
  sizeLabel: string | null;
}) {
  return product.sizeLabel ? `${product.name} ${product.sizeLabel}` : product.name;
}

function serializeProduct(product: ProductRecord) {
  return {
    id: product.id,
    name: product.name,
    displayName: formatProductDisplayName(product),
    description: product.description,
    price: product.price,
    available: product.available,
    kind: product.kind,
    category: product.category,
    groupKey: product.groupKey,
    sizeLabel: product.sizeLabel,
    sizeSort: product.sizeSort,
  } satisfies ProductSummary;
}

function groupMenuProducts(products: ProductSummary[]) {
  const groups = new Map<string, MenuProductSummary>();

  for (const product of products) {
    const key = product.groupKey ?? product.id;
    const existingGroup = groups.get(key);

    if (!existingGroup) {
      groups.set(key, {
        id: key,
        name: product.name,
        description: product.description,
        category: product.category,
        kind: product.kind,
        available: product.available,
        priceFrom: product.price,
        priceTo: product.price,
        variants: [product],
      });
      continue;
    }

    existingGroup.variants.push(product);
    existingGroup.available = existingGroup.available || product.available;
    existingGroup.priceFrom = Math.min(existingGroup.priceFrom, product.price);
    existingGroup.priceTo = Math.max(existingGroup.priceTo, product.price);
  }

  return Array.from(groups.values()).map((group) => ({
    ...group,
    variants: [...group.variants].sort(
      (left, right) =>
        (left.sizeSort ?? Number.MAX_SAFE_INTEGER) -
          (right.sizeSort ?? Number.MAX_SAFE_INTEGER) ||
        left.price - right.price ||
        left.displayName.localeCompare(right.displayName, "ru"),
    ),
  }));
}

async function fetchProducts(availableOnly: boolean) {
  return prisma.product.findMany({
    where: availableOnly ? { available: true } : undefined,
    orderBy: [
      { sortOrder: "asc" },
      { sizeSort: "asc" },
      { name: "asc" },
    ],
  });
}

export async function getProducts() {
  const products = await fetchProducts(false);
  return products.map(serializeProduct);
}

export async function getAvailableProducts() {
  const products = await fetchProducts(true);
  return groupMenuProducts(products.map(serializeProduct));
}
