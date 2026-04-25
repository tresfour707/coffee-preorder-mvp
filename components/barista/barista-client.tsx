"use client";

import { useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { StaffSignOutButton } from "@/components/staff/staff-sign-out-button";
import { STAFF_POLL_INTERVAL_MS } from "@/lib/constants";
import { formatTime } from "@/lib/business-day";
import { formatOrderNumber } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { usePolling } from "@/lib/use-polling";
import type { QueueSnapshot } from "@/lib/types";

type BaristaClientProps = {
  initialQueue: QueueSnapshot;
};

export function BaristaClient({ initialQueue }: BaristaClientProps) {
  const [queue, setQueue] = useState(initialQueue);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function refreshQueue() {
    try {
      const response = await fetch("/api/queue", { cache: "no-store" });
      const data = (await response.json()) as QueueSnapshot | { error?: string };

      if (!response.ok || !("activeOrders" in data)) {
        throw new Error(
          "error" in data && data.error ? data.error : "Не удалось обновить очередь.",
        );
      }

      setQueue(data);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось обновить очередь.",
      );
    }
  }

  usePolling(refreshQueue, STAFF_POLL_INTERVAL_MS);

  async function handleMarkReady() {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/queue/ready", {
        method: "POST",
      });
      const data = (await response.json()) as QueueSnapshot | { error?: string };

      if (!response.ok || !("activeOrders" in data)) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Не удалось перевести заказ в Ready.",
        );
      }

      setQueue(data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось перевести заказ в Ready.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentOrder = queue.currentOrder;

  return (
    <PageShell
      eyebrow="Бариста"
      title="Единая очередь заказов"
      description="Один экран для общей очереди. Бариста видит текущий заказ сверху и следующие подтверждённые заказы ниже, без разделения на online и offline."
      actions={
        <StaffSignOutButton className="inline-flex rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 disabled:cursor-wait disabled:opacity-60" />
      }
    >
      {error ? (
        <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {currentOrder ? (
        <section className="surface p-6 md:p-8">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <p className="label-muted">Текущий заказ</p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <h2 className="text-6xl font-semibold tracking-tight text-stone-900 md:text-8xl">
                  {formatOrderNumber(currentOrder.publicOrderNumber)}
                </h2>
                <StatusBadge status={currentOrder.status} className="text-sm" />
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {currentOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl bg-stone-100 p-5 text-stone-900"
                  >
                    <p className="text-2xl font-semibold">
                      {item.quantity} × {item.productName}
                    </p>
                    <p className="mt-2 text-sm text-stone-500">
                      {formatMoney(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full max-w-sm rounded-[2rem] bg-stone-900 p-6 text-white">
              <p className="label-muted text-stone-300">Состояние очереди</p>
              <dl className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <dt>Активных заказов</dt>
                  <dd className="text-2xl font-semibold">{queue.activeOrders.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Следующих в очереди</dt>
                  <dd className="text-2xl font-semibold">{queue.nextOrders.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Подтверждён</dt>
                  <dd className="text-lg font-semibold">
                    {formatTime(currentOrder.confirmedAt)}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={handleMarkReady}
                disabled={isSubmitting}
                className="mt-8 w-full rounded-full bg-brand-500 px-5 py-4 text-base font-semibold text-white transition hover:bg-brand-600 disabled:cursor-wait disabled:bg-brand-300"
              >
                {isSubmitting ? "Обновляем…" : "Отметить текущий заказ как Ready"}
              </button>
            </div>
          </div>
        </section>
      ) : (
        <EmptyState
          title="Сейчас нет активных заказов"
          description="Как только кассир или онлайн-покупатель подтвердит заказ, он появится здесь первым в общей очереди."
        />
      )}

      <section className="mt-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="label-muted">Дальше по очереди</p>
            <h2 className="mt-1 text-2xl font-semibold text-stone-900">
              Следующие заказы
            </h2>
          </div>
          <p className="text-sm text-stone-500">Показываем ближайшие позиции из очереди</p>
        </div>

        {queue.nextOrders.length === 0 ? (
          <div className="surface p-6 text-sm text-stone-600">
            После текущего заказа подтверждённых ожиданий нет.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {queue.nextOrders.map((order) => (
              <article key={order.id} className="surface p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-3xl font-semibold text-stone-900">
                      {formatOrderNumber(order.publicOrderNumber)}
                    </p>
                    <p className="mt-2 text-sm text-stone-500">
                      Подтверждён в {formatTime(order.confirmedAt)}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="mt-5 space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700"
                    >
                      {item.quantity} × {item.productName}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
