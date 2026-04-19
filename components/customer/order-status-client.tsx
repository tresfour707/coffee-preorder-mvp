"use client";

import Link from "next/link";
import { useState } from "react";

import { PageShell } from "@/components/ui/page-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatOrderNumber } from "@/lib/format";
import { formatDateTime } from "@/lib/business-day";
import { formatMoney } from "@/lib/money";
import { sourceLabels } from "@/lib/labels";
import { ORDER_STATUS_POLL_INTERVAL_MS } from "@/lib/constants";
import { usePolling } from "@/lib/use-polling";
import type { OrderDetails } from "@/lib/types";

type OrderStatusClientProps = {
  initialOrder: OrderDetails;
};

export function OrderStatusClient({ initialOrder }: OrderStatusClientProps) {
  const [order, setOrder] = useState(initialOrder);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  async function refreshOrder() {
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as OrderDetails | { error?: string };

      if (!response.ok || !("id" in data)) {
        throw new Error(
          "error" in data && data.error ? data.error : "Не удалось обновить заказ.",
        );
      }

      setOrder(data);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось обновить заказ.",
      );
    }
  }

  usePolling(refreshOrder, ORDER_STATUS_POLL_INTERVAL_MS);

  async function handleCancelOrder() {
    setIsCancelling(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = (await response.json()) as OrderDetails | { error?: string };

      if (!response.ok || !("id" in data)) {
        throw new Error(
          "error" in data && data.error ? data.error : "Не удалось отменить заказ.",
        );
      }

      setOrder(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось отменить заказ.",
      );
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <PageShell
      eyebrow="Статус заказа"
      title={formatOrderNumber(order.publicOrderNumber)}
      description="Статус обновляется автоматически каждые несколько секунд. Очередь общая для онлайн-заказов и заказов, оформленных на кассе."
      actions={
        <Link
          href="/menu"
          className="inline-flex rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
        >
          Новый заказ
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-6">
          <div className="surface p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="label-muted">Статус</p>
                <div className="mt-3">
                  <StatusBadge status={order.status} className="text-sm" />
                </div>
              </div>
              <div className="text-right">
                <p className="label-muted">Источник</p>
                <p className="mt-2 text-lg font-semibold text-stone-900">
                  {sourceLabels[order.source]}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-stone-900 p-5 text-white">
                <p className="label-muted text-stone-300">Перед вами</p>
                <p className="mt-3 text-5xl font-semibold">
                  {order.status === "CANCELLED" ? "-" : order.ordersAhead}
                </p>
              </div>
              <div className="rounded-3xl bg-stone-100 p-5">
                <p className="label-muted">Подтверждён</p>
                <p className="mt-3 text-xl font-semibold text-stone-900">
                  {formatDateTime(order.confirmedAt)}
                </p>
                <p className="mt-2 text-sm text-stone-600">
                  Публичный номер заказа используется и гостем, и сотрудниками.
                </p>
              </div>
            </div>

            {order.canCancel ? (
              <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm leading-6 text-amber-900">
                  Пока заказ в статусе Waiting, его можно отменить. После перехода
                  в Preparing отмена пользователем уже недоступна.
                </p>
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="mt-4 rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-wait disabled:bg-amber-300"
                >
                  {isCancelling ? "Отменяем…" : "Отменить заказ"}
                </button>
              </div>
            ) : null}

            {error ? (
              <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                {error}
              </p>
            ) : null}
          </div>

          <div className="surface p-6 md:p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="label-muted">Состав</p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-900">
                  Состав заказа
                </h2>
              </div>
              <p className="text-lg font-semibold text-stone-900">
                {formatMoney(order.totalPrice)}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-stone-50 p-4"
                >
                  <div>
                    <p className="text-base font-semibold text-stone-900">
                      {item.productName}
                    </p>
                    <p className="text-sm text-stone-500">
                      {item.quantity} × {formatMoney(item.unitPrice)}
                    </p>
                  </div>
                  <p className="text-base font-semibold text-stone-900">
                    {formatMoney(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="surface p-6">
            <p className="label-muted">Как работает очередь</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-600">
              <li>Waiting: заказ подтверждён и ждёт своей очереди.</li>
              <li>Preparing: бариста готовит ваш заказ прямо сейчас.</li>
              <li>Ready: заказ готов к выдаче.</li>
              <li>Cancelled: заказ снят и больше не участвует в очереди.</li>
            </ul>
          </div>

          <div className="surface p-6">
            <p className="label-muted">Ссылка заказа</p>
            <p className="mt-3 break-all text-sm text-stone-600">
              Технический идентификатор ссылки:
            </p>
            <p className="mt-2 text-sm font-medium text-stone-900">{order.id}</p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
