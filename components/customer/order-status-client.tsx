"use client";

import Link from "next/link";
import { useState } from "react";

import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime } from "@/lib/business-day";
import { cn } from "@/lib/cn";
import { ORDER_STATUS_POLL_INTERVAL_MS } from "@/lib/constants";
import { formatOrderNumber } from "@/lib/format";
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
    title: "Оплачен",
  },
  {
    id: "queue",
    title: "В очереди",
  },
  {
    id: "preparing",
    title: "Готовится",
  },
  {
    id: "ready",
    title: "Готов",
  },
] as const;

function getProgressIndex(status: OrderDetails["status"]) {
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

function getQueueText(order: OrderDetails) {
  if (order.status === "READY") {
    return "Можно забирать";
  }

  if (order.status === "PREPARING") {
    return "Готовят сейчас";
  }

  if (order.status === "CANCELLED") {
    return "Не в очереди";
  }

  if (order.ordersAhead === 0) {
    return "Вы следующие";
  }

  return `${order.ordersAhead} ${getOrdersWord(order.ordersAhead)}`;
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
    >
      <path d="m5 12 4.2 4L19 7" />
    </svg>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] bg-[#f8f2ec] px-4 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
        {label}
      </p>
      <p className="mt-2 text-[17px] font-semibold leading-tight tracking-tight text-stone-950">
        {value}
      </p>
    </div>
  );
}

function getStatusTitle(order: OrderDetails) {
  if (order.status === "READY") {
    return "Заказ готов";
  }

  if (order.status === "PREPARING") {
    return "Заказ готовится";
  }

  if (order.status === "CANCELLED") {
    return "Заказ отменён";
  }

  return "Заказ оплачен";
}

function getStatusTone(order: OrderDetails) {
  if (order.status === "READY") {
    return "bg-[#e4f1df] text-[#315c38]";
  }

  if (order.status === "PREPARING") {
    return "bg-[#e9f2e3] text-[#3f6844]";
  }

  if (order.status === "CANCELLED") {
    return "bg-stone-200 text-stone-600";
  }

  return "bg-[#eef5e8] text-[#456b44]";
}

export function OrderStatusClient({
  initialOrder,
  viewer,
}: OrderStatusClientProps) {
  const [order, setOrder] = useState(initialOrder);
  const [error, setError] = useState<string | null>(null);

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

  const progressIndex = getProgressIndex(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <CustomerMobileShell
      viewer={viewer}
      className="pb-14 pt-0"
      contentClassName="mt-0"
      header={
        <section className="relative flex min-h-12 items-center justify-center">
          <h1 className="text-[30px] font-medium leading-none tracking-tight text-stone-950">
            Статус заказа
          </h1>
        </section>
      }
    >
      <section className="rounded-[34px] border border-white/75 bg-[rgba(255,255,255,0.78)] px-5 py-5 shadow-[0_16px_34px_rgba(31,23,18,0.08)] backdrop-blur-[22px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-stone-400">
              Номер
            </p>
            <p className="mt-3 text-[54px] font-semibold leading-none tracking-tight text-stone-950">
              {formatOrderNumber(order.publicOrderNumber)}
            </p>
          </div>

          <div className="flex min-w-[112px] flex-col items-stretch gap-2">
            <StatusBadge status={order.status} className="bg-white/82" />
            <span
              className={cn(
                "rounded-full px-3.5 py-2 text-center text-[13px] font-semibold",
                getStatusTone(order),
              )}
            >
              {getStatusTitle(order)}
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <MetricCard label="Сумма" value={formatMoney(order.totalPrice)} />
          <MetricCard label="Создан" value={formatDateTime(order.confirmedAt)} />
        </div>

        <div className="mt-3 rounded-[24px] bg-[#f8f2ec] px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                Перед вами
              </p>
              <p className="mt-2 text-[24px] font-semibold leading-none tracking-tight text-stone-950">
                {getQueueText(order)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-[34px] border border-white/75 bg-[rgba(255,255,255,0.78)] px-5 py-5 shadow-[0_16px_34px_rgba(31,23,18,0.08)] backdrop-blur-[22px]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[25px] font-medium leading-none tracking-tight text-stone-950">
            Процесс
          </h2>
          <span className="text-[13px] font-medium text-stone-400">
            {isCancelled ? "остановлен" : `${progressIndex + 1} из ${progressSteps.length}`}
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {progressSteps.map((step, index) => {
            const isDone = !isCancelled && index < progressIndex;
            const isActive = !isCancelled && index === progressIndex;
            const isReadyDone = order.status === "READY" && index === progressIndex;
            const isChecked = isDone || isReadyDone;

            return (
              <div key={step.id} className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold transition",
                    isChecked
                      ? "bg-[#5f7f58] text-white"
                      : isActive
                        ? "bg-[#dfeedd] text-[#4f784d]"
                        : "bg-[#f4eee8] text-stone-400",
                  )}
                >
                  {isChecked ? <CheckIcon /> : index + 1}
                </span>

                <div
                  className={cn(
                    "flex min-h-12 flex-1 items-center justify-between rounded-[20px] px-4 transition",
                    isActive
                      ? "bg-[#edf5e9] text-[#4f784d]"
                      : isChecked
                        ? "bg-[#dfe6d8] text-[#425c3d]"
                        : "bg-[#f8f2ec] text-stone-900",
                  )}
                >
                  <p className="text-[16px] font-semibold tracking-tight">{step.title}</p>
                  {isActive ? (
                    <span className="text-[13px] font-medium text-[#5f835e]">сейчас</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-4 rounded-[34px] border border-white/75 bg-[rgba(255,255,255,0.74)] px-5 py-5 shadow-[0_16px_34px_rgba(31,23,18,0.07)] backdrop-blur-[22px]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[25px] font-medium leading-none tracking-tight text-stone-950">
            Состав
          </h2>
          <span className="text-[15px] font-semibold text-stone-500">
            {formatMoney(order.totalPrice)}
          </span>
        </div>

        <div className="mt-4 divide-y divide-stone-200/80">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="line-clamp-2 text-[15px] font-semibold leading-[1.18] tracking-tight text-stone-950">
                  {item.productName}
                </p>
                <p className="mt-1 text-[13px] text-stone-500">
                  {item.quantity} шт.
                </p>
              </div>
              <p className="shrink-0 text-[14px] font-semibold text-stone-950">
                {formatMoney(item.subtotal)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {error ? (
        <section className="mt-4 rounded-[28px] bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
          {error}
        </section>
      ) : null}

      <Link
        href="/menu#quick-search"
        className="mt-5 flex min-h-14 w-full items-center justify-center rounded-full bg-[#6b4a38] px-5 py-4 text-[17px] font-semibold text-white shadow-[0_18px_38px_rgba(91,64,45,0.2)] transition hover:bg-[#5f4131] active:scale-[0.98]"
      >
        Сделать новый заказ
      </Link>
    </CustomerMobileShell>
  );
}
