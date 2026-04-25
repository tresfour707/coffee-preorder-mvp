import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import type { ViewerSummary } from "@/lib/types";

type AuthActionsProps = {
  viewer: ViewerSummary | null;
};

export function AuthActions({ viewer }: AuthActionsProps) {
  if (!viewer) {
    return (
      <>
        <Link
          href="/sign-in"
          className="inline-flex rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
        >
          Войти
        </Link>
        <Link
          href="/sign-up"
          className="inline-flex rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Регистрация
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/orders"
        className="inline-flex rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
      >
        Мои заказы
      </Link>
      <div className="rounded-3xl border border-stone-200 bg-white px-4 py-3 text-center text-sm text-stone-600 md:rounded-full md:text-left">
        <span className="font-semibold text-stone-900">{viewer.name}</span>
        <span className="mt-1 block text-xs text-stone-500 md:ml-2 md:mt-0 md:inline md:text-sm">
          {viewer.email}
        </span>
      </div>
      <SignOutButton className="inline-flex rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 disabled:cursor-wait disabled:opacity-60" />
    </>
  );
}
