import { redirect } from "next/navigation";

import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { SignInForm } from "@/components/auth/sign-in-form";
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
    <CustomerMobileShell
      viewer={null}
      showBottomNav={false}
      header={
        <div>
          <p className="kicker">Аккаунт</p>
          <h1 className="mt-2 text-[36px] font-semibold leading-[0.94] tracking-tight text-stone-950">
            Войти в аккаунт
          </h1>
          <p className="mt-3 max-w-[320px] text-sm leading-6 text-stone-600">
            Лёгкий demo-login для тестирования нескольких пользователей и их заказов.
          </p>
        </div>
      }
    >
      <SignInForm nextPath={nextPath} />
    </CustomerMobileShell>
  );
}
