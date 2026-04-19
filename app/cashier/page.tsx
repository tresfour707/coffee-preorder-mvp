import { CashierClient } from "@/components/cashier/cashier-client";
import { getProducts } from "@/lib/products";
import { getQueueSnapshot } from "@/lib/queue";

export const dynamic = "force-dynamic";

export default async function CashierPage() {
  const [products, queue] = await Promise.all([getProducts(), getQueueSnapshot()]);

  return <CashierClient products={products} initialQueue={queue} />;
}
