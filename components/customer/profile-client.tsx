"use client";

import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import type { PublicQueueSummary, ViewerSummary } from "@/lib/types";

type ProfileClientProps = {
  viewer: ViewerSummary;
  initialQueueSummary: PublicQueueSummary;
};

export function ProfileClient({
  viewer,
  initialQueueSummary,
}: ProfileClientProps) {
  return (
    <CustomerMobileShell
      viewer={viewer}
      queueSummary={initialQueueSummary}
      className="pb-24"
      header={
        <section className="customer-soft-card px-5 py-5">
          <p className="kicker text-stone-400">Профиль</p>
          <h1 className="mt-3 text-[36px] font-semibold leading-[0.94] tracking-tight text-stone-950">
            Аккаунт и оплата
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Здесь собраны ваши данные, история заказов и будущий блок со способами
            оплаты.
          </p>
        </section>
      }
    >
      <div className="space-y-3">
        <section className="customer-soft-card-strong px-5 py-5">
          <p className="kicker text-stone-400">Личные данные</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-[24px] bg-[#fbf5ef] px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                Имя
              </p>
              <p className="mt-2 text-[24px] font-semibold leading-none tracking-tight text-stone-950">
                {viewer.name}
              </p>
            </div>
            <div className="rounded-[24px] bg-[#fbf5ef] px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                Email
              </p>
              <p className="mt-2 text-sm font-semibold text-stone-900">{viewer.email}</p>
            </div>
          </div>
        </section>

        <section className="customer-soft-card-strong px-5 py-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="kicker text-stone-400">Способы оплаты</p>
              <h2 className="mt-3 text-[30px] font-semibold leading-[0.95] tracking-tight text-stone-950">
                Подключим позже
              </h2>
            </div>
            <span className="rounded-full bg-[#fbf5ef] px-4 py-2 text-sm font-semibold text-stone-600">
              demo
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 text-stone-600">
            Пока оплата выбирается на этапе checkout, а сохранённые карты и любимые
            способы можно будет добавить следующим шагом развития продукта.
          </p>
        </section>

        <section className="customer-soft-card-strong px-5 py-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="kicker text-stone-400">Заказы</p>
              <h2 className="mt-3 text-[30px] font-semibold leading-[0.95] tracking-tight text-stone-950">
                История заказов
              </h2>
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-stone-600">
            Все ваши online-заказы, статусы и номера находятся на отдельном экране.
          </p>

          <Link
            href="/orders"
            className="mt-5 flex w-full items-center justify-center rounded-full bg-stone-950 px-5 py-4 text-sm font-semibold text-white"
          >
            Открыть историю
          </Link>
        </section>

        <section className="customer-soft-card-strong px-5 py-5">
          <p className="kicker text-stone-400">Сессия</p>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Если нужно переключиться на другой demo-аккаунт, можно выйти здесь.
          </p>
          <SignOutButton className="mt-5 flex w-full items-center justify-center rounded-full bg-stone-100 px-5 py-4 text-sm font-semibold text-stone-800 disabled:cursor-wait disabled:opacity-60" />
        </section>
      </div>
    </CustomerMobileShell>
  );
}
