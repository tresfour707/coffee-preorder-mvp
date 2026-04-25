"use client";

import { useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { StaffSignOutButton } from "@/components/staff/staff-sign-out-button";
import { STAFF_POLL_INTERVAL_MS } from "@/lib/constants";
import { formatTime } from "@/lib/business-day";
import { formatOrderNumber } from "@/lib/format";
import { sourceLabels } from "@/lib/labels";
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
      title="Единая очередь"
      description="Один экран для общей очереди. Здесь нет разделения на online и offline: бариста видит весь подтвержденный поток в одном месте."
      actions={
        <StaffSignOutButton className="btn-secondary disabled:cursor-wait disabled:opacity-60" />
      }
    >
      {error ? (
        <div className="mb-6 rounded-[24px] bg-red-50 p-4 text-sm leading-6 text-red-700">
          {error}
        </div>
      ) : null}

      {currentOrder ? (
        <section className="surface p-6 md:p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="kicker">Текущий заказ</p>
                  <h2 className="mt-3 text-6xl font-semibold tracking-tight text-stone-950 md:text-8xl">
                    {formatOrderNumber(currentOrder.publicOrderNumber)}
                  </h2>
                </div>
                <div className="space-y-3">
                  <StatusBadge status={currentOrder.status} className="text-sm" />
                  <div className="rounded-[24px] bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-700">
                    {sourceLabels[currentOrder.source]}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {currentOrder.items.map((item) => (
                  <div key={item.id} className="rounded-[24px] bg-stone-50 p-5">
                    <p className="text-2xl font-semibold tracking-tight text-stone-900">
                      {item.quantity} × {item.productName}
                    </p>
                    <p className="mt-3 text-sm text-stone-500">
                      {formatMoney(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[28px] bg-stone-950 p-6 text-white">
                <p className="kicker text-stone-300">Состояние очереди</p>
                <dl className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <dt>Активных заказов</dt>
                    <dd className="text-2xl font-semibold">{queue.activeOrders.length}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>Следом за ним</dt>
                    <dd className="text-2xl font-semibold">{queue.nextOrders.length}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>Подтвержден</dt>
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
                  {isSubmitting ? "Обновляем…" : "Отметить как готовый"}
                </button>
              </div>

              <div className="metric-card">
                <p className="text-sm font-semibold text-stone-900">Рабочая логика</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  После `Ready` текущий заказ уходит из активной очереди, а следующий
                  автоматически становится главным.
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <EmptyState
          title="Сейчас нет активных заказов"
          description="Как только кассир или online-покупатель подтвердит заказ, он появится здесь первым в общей очереди."
        />
      )}

      <section className="mt-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="kicker">Дальше по очереди</p>
            <h2 className="mt-2 section-title">Следующие заказы</h2>
          </div>
          <p className="text-sm text-stone-500">Показываем ближайшие подтвержденные позиции</p>
        </div>

        {queue.nextOrders.length === 0 ? (
          <div className="surface p-6 text-sm text-stone-600">
            После текущего заказа подтвержденных ожиданий нет.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {queue.nextOrders.map((order) => (
              <article key={order.id} className="surface p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-3xl font-semibold tracking-tight text-stone-900">
                      {formatOrderNumber(order.publicOrderNumber)}
                    </p>
                    <p className="mt-2 text-sm text-stone-500">
                      {sourceLabels[order.source]} · {formatTime(order.confirmedAt)}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="mt-5 space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[20px] bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700"
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
