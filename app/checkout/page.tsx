import { redirect } from "next/navigation";

import { CheckoutClient } from "@/components/customer/checkout-client";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>;
}) {
  const viewer = await getCurrentUser();

  if (!viewer) {
    redirect("/sign-in?next=/checkout");
  }

  const params = await searchParams;
  const paymentNotice =
    params.payment === "failed"
      ? "FAILED"
      : params.payment === "cancelled"
        ? "CANCELLED"
        : null;

  return <CheckoutClient viewer={viewer} paymentNotice={paymentNotice} />;
}
