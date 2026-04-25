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
        <Link href="/sign-in" className="btn-secondary">
          Войти
        </Link>
        <Link href="/sign-up" className="btn-primary">
          Регистрация
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="rounded-[24px] border border-stone-200 bg-white px-4 py-3 text-center text-sm text-stone-600 md:rounded-full md:text-left">
        <span className="font-semibold text-stone-900">{viewer.name}</span>
        <span className="mt-1 block text-xs text-stone-500 md:ml-2 md:mt-0 md:inline md:text-sm">
          {viewer.email}
        </span>
      </div>
      <SignOutButton className="btn-secondary disabled:cursor-wait disabled:opacity-60" />
    </>
  );
}
