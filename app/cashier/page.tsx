import { redirect } from "next/navigation";

import { CashierClient } from "@/components/cashier/cashier-client";
import { getProducts } from "@/lib/products";
import { getQueueSnapshot } from "@/lib/queue";
import { hasStaffSession } from "@/lib/staff-auth";

export const dynamic = "force-dynamic";

export default async function CashierPage() {
  const accessGranted = await hasStaffSession();

  if (!accessGranted) {
    redirect("/staff-access?next=/cashier");
  }

  const [products, queue] = await Promise.all([getProducts(), getQueueSnapshot()]);

  return <CashierClient products={products} initialQueue={queue} />;
}
