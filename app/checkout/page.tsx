import { redirect } from "next/navigation";

import { CheckoutClient } from "@/components/customer/checkout-client";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const viewer = await getCurrentUser();

  if (!viewer) {
    redirect("/sign-in?next=/checkout");
  }

  return <CheckoutClient viewer={viewer} />;
}
