import { redirect } from "next/navigation";

import { PaymentMethodsClient } from "@/components/customer/payment-methods-client";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PaymentMethodsPage() {
  const viewer = await getCurrentUser();

  if (!viewer) {
    redirect("/sign-in?next=/payment-methods");
  }

  return <PaymentMethodsClient viewer={viewer} />;
}
