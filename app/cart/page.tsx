import { CartClient } from "@/components/customer/cart-client";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const viewer = await getCurrentUser();

  return <CartClient viewer={viewer} />;
}
