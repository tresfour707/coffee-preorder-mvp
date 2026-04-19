import { MenuClient } from "@/components/customer/menu-client";
import { getAvailableProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const products = await getAvailableProducts();
  return <MenuClient products={products} />;
}
