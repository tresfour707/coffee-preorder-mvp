import { redirect } from "next/navigation";

import { SignUpForm } from "@/components/auth/sign-up-form";
import { PageShell } from "@/components/ui/page-shell";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SignUpPage({
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
      title="Регистрация"
      description="Создайте demo-аккаунт, чтобы тестировать заказы под разными пользователями."
    >
      <SignUpForm nextPath={nextPath} />
    </PageShell>
  );
}
