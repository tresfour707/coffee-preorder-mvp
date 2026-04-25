"use client";

import { useState } from "react";

import { ORDER_STATUS_POLL_INTERVAL_MS } from "@/lib/constants";
import { formatOrderNumber } from "@/lib/format";
import type { PublicQueueSummary } from "@/lib/types";
import { usePolling } from "@/lib/use-polling";

type PublicQueueBannerProps = {
  initialSummary: PublicQueueSummary;
};

function getOrdersWord(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "заказ";
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "заказа";
  }

  return "заказов";
}

export function PublicQueueBanner({
  initialSummary,
}: PublicQueueBannerProps) {
  const [summary, setSummary] = useState(initialSummary);

  async function refreshSummary() {
    try {
      const response = await fetch("/api/queue/public", {
        cache: "no-store",
      });

      const data = (await response.json()) as PublicQueueSummary;

      if (!response.ok || typeof data.activeOrdersCount !== "number") {
        return;
      }

      setSummary(data);
    } catch {
      // Silently keep the last known value for the demo banner.
    }
  }

  usePolling(refreshSummary, ORDER_STATUS_POLL_INTERVAL_MS);

  const hasActiveQueue = summary.activeOrdersCount > 0;

  return (
    <section className="surface border border-brand-100 bg-brand-50/70 p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="label-muted text-brand-700">Общая очередь прямо сейчас</p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-900 md:text-3xl">
            {hasActiveQueue
              ? `Перед новым заказом сейчас ${summary.activeOrdersCount} ${getOrdersWord(summary.activeOrdersCount)}`
              : "Сейчас очередь свободна"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone-700 md:text-base">
            {hasActiveQueue
              ? "Если оформить заказ прямо сейчас, перед ним будет столько же активных заказов."
              : "Новый заказ можно отправить в работу без ожидания перед ним."}
          </p>
        </div>

        <div className="rounded-3xl bg-white px-5 py-4 shadow-sm md:min-w-56">
          <p className="label-muted">Сейчас готовят</p>
          <p className="mt-2 text-xl font-semibold text-stone-900 md:text-2xl">
            {summary.currentOrderPublicNumber
              ? formatOrderNumber(summary.currentOrderPublicNumber)
              : "Никого"}
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Баннер обновляется автоматически.
          </p>
        </div>
      </div>
    </section>
  );
}
