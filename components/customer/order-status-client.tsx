"use client";

import Link from "next/link";
import { useState } from "react";

import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime } from "@/lib/business-day";
import { ORDER_STATUS_POLL_INTERVAL_MS } from "@/lib/constants";
import { formatOrderNumber } from "@/lib/format";
import { sourceLabels } from "@/lib/labels";
import { formatMoney } from "@/lib/money";
import { usePolling } from "@/lib/use-polling";
import type { OrderDetails, ViewerSummary } from "@/lib/types";

type OrderStatusClientProps = {
  initialOrder: OrderDetails;
  viewer: ViewerSummary;
};

const progressSteps = [
  {
    id: "paid",
    title: "Оплата подтверждена",
    description: "Заказ создан и получил публичный номер.",
  },
  {
    id: "queue",
    title: "В очереди",
    description: "Заказ ждёт своей очереди в общем потоке.",
  },
  {
    id: "preparing",
    title: "Готовится",
    description: "Бариста работает над ним прямо сейчас.",
  },
  {
    id: "ready",
    title: "Готов",
    description: "Можно подходить за выдачей.",
  },
] as const;

function getProgressStage(status: OrderDetails["status"]) {
  switch (status) {
    case "WAITING":
      return 1;
    case "PREPARING":
      return 2;
    case "READY":
      return 3;
    case "CANCELLED":
      return -1;
    default:
      return 0;
  }
}

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

function getQueueMessage(order: OrderDetails) {
  if (order.status === "READY") {
    return "Заказ готов к выдаче";
  }

  if (order.status === "PREPARING") {
    return "Бариста готовит заказ прямо сейчас";
  }

  if (order.status === "CANCELLED") {
    return "Заказ отменён и больше не участвует в очереди";
  }

  if (order.ordersAhead === 0) {
    return "Вы следующий в очереди";
  }

  return `Перед вами ${order.ordersAhead} ${getOrdersWord(order.ordersAhead)}`;
}

export function OrderStatusClient({
  initialOrder,
  viewer,
}: OrderStatusClientProps) {
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

  const progressStage = getProgressStage(order.status);

  return (
    <CustomerMobileShell
      viewer={viewer}
      showBottomNav={false}
      className="pb-12"
      header={
        <div>
          <p className="kicker">Статус заказа</p>
          <h1 className="mt-2 text-[36px] font-semibold leading-[0.94] tracking-tight text-stone-950">
            Следите за выдачей
          </h1>
          <p className="mt-3 max-w-[320px] text-sm leading-6 text-stone-600">
            Экран обновляется автоматически и показывает только ваш заказ.
          </p>
        </div>
      }
    >
      <section className="app-card overflow-hidden">
        <div className="bg-[linear-gradient(180deg,#f7e0bf_0%,#f3c98f_100%)] px-5 py-6">
          <p className="kicker text-stone-700">Номер заказа</p>
          <h2 className="mt-2 text-[56px] font-semibold leading-none tracking-tight text-stone-950">
            {formatOrderNumber(order.publicOrderNumber)}
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone-700">{getQueueMessage(order)}</p>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-4">
            <StatusBadge status={order.status} className="text-sm" />
            <div className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-600">
              {sourceLabels[order.source]}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-[22px] bg-stone-50 px-3 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
                Перед вами
              </p>
              <p className="mt-2 text-lg font-semibold text-stone-950">
                {order.status === "CANCELLED" ? "—" : order.ordersAhead}
              </p>
            </div>
            <div className="rounded-[22px] bg-stone-50 px-3 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
                Подтверждён
              </p>
              <p className="mt-2 text-sm font-semibold text-stone-950">
                {formatDateTime(order.confirmedAt)}
              </p>
            </div>
            <div className="rounded-[22px] bg-stone-50 px-3 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
                Сумма
              </p>
              <p className="mt-2 text-sm font-semibold text-stone-950">
                {formatMoney(order.totalPrice)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {order.status !== "CANCELLED" ? (
        <section className="mt-4 app-card p-5">
          <p className="kicker">Прогресс</p>
          <div className="mt-4 space-y-3">
            {progressSteps.map((step, index) => {
              const isDone = progressStage > index;
              const isActive = progressStage === index;

              return (
                <div
                  key={step.id}
                  className={`rounded-[24px] border p-4 ${
                    isActive
                      ? "border-stone-950 bg-stone-950 text-white"
                      : isDone
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "border-stone-200 bg-stone-50 text-stone-700"
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isActive
                          ? "bg-white text-stone-950"
                          : isDone
                            ? "bg-emerald-600 text-white"
                            : "bg-white text-stone-500"
                      }`}
                    >
                      {isDone ? "✓" : index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{step.title}</p>
                      <p
                        className={`mt-1 text-sm leading-6 ${
                          isActive
                            ? "text-stone-300"
                            : isDone
                              ? "text-emerald-800"
                              : "text-stone-500"
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="mt-4 rounded-[28px] bg-stone-100 p-5 text-sm leading-6 text-stone-700">
          Заказ отменён и больше не участвует в очереди.
        </section>
      )}

      <section className="mt-4 app-card p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="kicker">Состав заказа</p>
            <h2 className="mt-2 text-[30px] font-semibold leading-[0.98] tracking-tight text-stone-950">
              Что входит
            </h2>
          </div>
          <p className="text-sm text-stone-500">{formatMoney(order.totalPrice)}</p>
        </div>

        <div className="mt-4 space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="rounded-[24px] bg-stone-50 px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-stone-900">{item.productName}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    {item.quantity} × {formatMoney(item.unitPrice)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-stone-900">
                  {formatMoney(item.subtotal)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {order.canCancel ? (
        <section className="mt-4 rounded-[28px] bg-amber-50 p-5">
          <p className="text-sm leading-6 text-amber-900">
            Пока заказ находится в ожидании, его можно отменить. После перехода в
            активное приготовление отмена уже недоступна.
          </p>
          <button
            type="button"
            onClick={handleCancelOrder}
            disabled={isCancelling}
            className="mt-4 rounded-full bg-amber-600 px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-wait disabled:bg-amber-300"
          >
            {isCancelling ? "Отменяем…" : "Отменить заказ"}
          </button>
        </section>
      ) : null}

      {error ? (
        <section className="mt-4 rounded-[28px] bg-red-50 p-4 text-sm leading-6 text-red-700">
          {error}
        </section>
      ) : null}

      <div className="mt-6">
        <Link
          href="/menu"
          className="flex w-full items-center justify-center rounded-full bg-stone-950 px-5 py-4 text-sm font-semibold text-white"
        >
          Сделать новый заказ
        </Link>
      </div>
    </CustomerMobileShell>
  );
}
