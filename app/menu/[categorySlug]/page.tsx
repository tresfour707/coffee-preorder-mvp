import { notFound } from "next/navigation";

import { CategoryMenuClient } from "@/components/customer/category-menu-client";
import { getCurrentUser } from "@/lib/auth";
import {
  getMenuCategoryDefinitionBySlug,
} from "@/lib/menu-catalog";
import { getAvailableProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const category = getMenuCategoryDefinitionBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const [products, viewer] = await Promise.all([
    getAvailableProducts(),
    getCurrentUser(),
  ]);

  const categoryProducts = products.filter((product) => product.category === category.name);

  if (categoryProducts.length === 0) {
    notFound();
  }

  return (
    <CategoryMenuClient
      category={category}
      products={categoryProducts}
      viewer={viewer}
    />
  );
}
