import { redirect } from "next/navigation";

import { CustomerTopNav } from "@/components/customer/customer-top-nav";
import { SignInForm } from "@/components/auth/sign-in-form";
import { PageShell } from "@/components/ui/page-shell";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const viewer = await getCurrentUser();

  if (viewer) {
    redirect("/menu");
  }

  const params = await searchParams;
  const nextPath =
    typeof params.next === "string" && params.next.startsWith("/")
      ? params.next
      : "/menu";

  return (
    <PageShell
      eyebrow="Аккаунт"
      title="Вход"
      description="Легкий demo-login для тестирования нескольких пользователей и их заказов."
      subnav={<CustomerTopNav viewer={null} />}
    >
      <SignInForm nextPath={nextPath} />
    </PageShell>
  );
}
