"use client";

import Link from "next/link";

import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime } from "@/lib/business-day";
import { formatOrderNumber } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import type {
  PublicQueueSummary,
  UserOrderSummary,
  ViewerSummary,
} from "@/lib/types";

type MyOrdersClientProps = {
  viewer: ViewerSummary;
  orders: UserOrderSummary[];
  initialQueueSummary: PublicQueueSummary;
  queueHeadline: string;
};

export function MyOrdersClient({
  viewer,
  orders,
  initialQueueSummary,
  queueHeadline,
}: MyOrdersClientProps) {
  return (
    <CustomerMobileShell
      viewer={viewer}
      queueSummary={initialQueueSummary}
      queueHeadline={queueHeadline}
      className="pb-24"
      header={
        <section className="customer-soft-card px-5 py-5">
          <p className="kicker text-stone-400">История заказов</p>
          <h1 className="mt-3 text-[36px] font-semibold leading-[0.94] tracking-tight text-stone-950">
            История и статусы
          </h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Здесь видны только ваши online-заказы. Чужие номера и статусы не
            показываются.
          </p>
        </section>
      }
    >
      {orders.length === 0 ? (
        <EmptyState
          title="Пока нет заказов"
          description="Сделайте первый online-заказ, и после успешной оплаты он появится здесь."
          action={
            <Link href="/menu" className="btn-primary">
              Перейти в меню
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="customer-soft-card-strong px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="kicker text-stone-400">Заказ</p>
                  <h2 className="mt-3 text-[34px] font-semibold leading-[0.95] tracking-tight text-stone-950">
                    {formatOrderNumber(order.publicOrderNumber)}
                  </h2>
                  <p className="mt-2 text-sm text-stone-500">
                    Подтверждён {formatDateTime(order.confirmedAt)}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-[22px] bg-[#fbf5ef] px-3 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
                    Сумма
                  </p>
                  <p className="mt-2 text-sm font-semibold text-stone-900">
                    {formatMoney(order.totalPrice)}
                  </p>
                </div>
                <div className="rounded-[22px] bg-[#fbf5ef] px-3 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
                    Источник
                  </p>
                  <p className="mt-2 text-sm font-semibold text-stone-900">Онлайн</p>
                </div>
                <div className="rounded-[22px] bg-[#fbf5ef] px-3 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
                    Перед вами
                  </p>
                  <p className="mt-2 text-sm font-semibold text-stone-900">
                    {order.status === "CANCELLED" ? "—" : order.ordersAhead}
                  </p>
                </div>
              </div>

              <Link
                href={`/order/${order.id}`}
                className="mt-4 flex w-full items-center justify-center rounded-full bg-stone-950 px-4 py-3 text-sm font-semibold text-white"
              >
                Открыть заказ
              </Link>
            </article>
          ))}
        </div>
      )}
    </CustomerMobileShell>
  );
}
