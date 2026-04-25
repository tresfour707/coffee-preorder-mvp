"use client";

import Link from "next/link";

import { AuthActions } from "@/components/auth/auth-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime } from "@/lib/business-day";
import { formatOrderNumber } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import type { UserOrderSummary, ViewerSummary } from "@/lib/types";

type MyOrdersClientProps = {
  viewer: ViewerSummary;
  orders: UserOrderSummary[];
};

export function MyOrdersClient({ viewer, orders }: MyOrdersClientProps) {
  return (
    <PageShell
      eyebrow="Аккаунт"
      title="Мои заказы"
      description="Здесь собраны только ваши онлайн-заказы. Чужие заказы в этом списке не видны."
      actions={<AuthActions viewer={viewer} />}
    >
      {orders.length === 0 ? (
        <EmptyState
          title="Заказов пока нет"
          description="Сделайте первый онлайн-заказ, и он появится здесь после успешной демо-оплаты."
          action={
            <Link
              href="/menu"
              className="inline-flex rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              Перейти в меню
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map((order) => (
            <article key={order.id} className="surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold text-stone-900">
                    {formatOrderNumber(order.publicOrderNumber)}
                  </p>
                  <p className="mt-2 text-sm text-stone-500">
                    Подтверждён {formatDateTime(order.confirmedAt)}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="label-muted">Источник</p>
                  <p className="mt-2 text-sm font-semibold text-stone-900">
                    Онлайн
                  </p>
                </div>
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="label-muted">Сумма</p>
                  <p className="mt-2 text-sm font-semibold text-stone-900">
                    {formatMoney(order.totalPrice)}
                  </p>
                </div>
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="label-muted">Перед вами</p>
                  <p className="mt-2 text-sm font-semibold text-stone-900">
                    {order.status === "CANCELLED" ? "-" : order.ordersAhead}
                  </p>
                </div>
              </div>

              <Link
                href={`/order/${order.id}`}
                className="mt-5 inline-flex rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
              >
                Открыть заказ
              </Link>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
