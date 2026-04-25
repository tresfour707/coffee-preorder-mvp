import { notFound, redirect } from "next/navigation";

import { DemoPaymentClient } from "@/components/customer/demo-payment-client";
import { getCurrentUser } from "@/lib/auth";
import { getDemoPaymentDetails } from "@/lib/orders";

export const dynamic = "force-dynamic";

export default async function DemoPaymentPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const viewer = await getCurrentUser();

  if (!viewer) {
    const { paymentId } = await params;
    redirect(`/sign-in?next=/checkout/payment/${paymentId}`);
  }

  const { paymentId } = await params;
  const payment = await getDemoPaymentDetails(paymentId, viewer.id);

  if (!payment) {
    notFound();
  }

  return <DemoPaymentClient payment={payment} viewer={viewer} />;
}
