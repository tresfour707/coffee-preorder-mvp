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
    <section className="surface overflow-hidden p-5 md:p-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_300px]">
        <div className="rounded-[24px] bg-brand-50 p-5">
          <p className="kicker text-brand-700">Общая очередь</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
            {hasActiveQueue
              ? `Сейчас перед новым заказом ${summary.activeOrdersCount} ${getOrdersWord(summary.activeOrdersCount)}`
              : "Сейчас можно заказать без ожидания перед вами"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone-700 md:text-base">
            {hasActiveQueue
              ? "Онлайн и офлайн идут в один поток, поэтому баннер сразу показывает реальную нагрузку очереди."
              : "После успешной оплаты заказ попадет в работу сразу, без ожидания перед ним."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="metric-card">
            <p className="label-muted">В работе</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
              {summary.activeOrdersCount}
            </p>
            <p className="mt-2 text-sm text-stone-500">Активных заказов в живой очереди</p>
          </div>

          <div className="metric-card">
            <p className="label-muted">Сейчас готовят</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
              {summary.currentOrderPublicNumber
                ? formatOrderNumber(summary.currentOrderPublicNumber)
                : "Свободно"}
            </p>
            <p className="mt-2 text-sm text-stone-500">Баннер обновляется автоматически</p>
          </div>
        </div>
      </div>
    </section>
  );
}
