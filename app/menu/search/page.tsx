import { SearchClient } from "@/components/customer/search-client";
import { getCurrentUser } from "@/lib/auth";
import { getAvailableProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const [products, viewer] = await Promise.all([
    getAvailableProducts(),
    getCurrentUser(),
  ]);

  return <SearchClient products={products} viewer={viewer} />;
}
