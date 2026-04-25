import { MenuClient } from "@/components/customer/menu-client";
import { getCurrentUser } from "@/lib/auth";
import { getAvailableProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const [products, viewer] = await Promise.all([getAvailableProducts(), getCurrentUser()]);
  return <MenuClient products={products} viewer={viewer} />;
}
