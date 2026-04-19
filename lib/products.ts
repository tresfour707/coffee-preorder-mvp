import { prisma } from "@/lib/prisma";
import type { ProductSummary } from "@/lib/types";

function serializeProduct(product: {
  id: string;
  name: string;
  description: string | null;
  price: number;
  available: boolean;
  category: string | null;
}) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    available: product.available,
    category: product.category,
  } satisfies ProductSummary;
}

export async function getProducts() {
  const products = await prisma.product.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  return products.map(serializeProduct);
}

export async function getAvailableProducts() {
  const products = await prisma.product.findMany({
    where: { available: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  return products.map(serializeProduct);
}
