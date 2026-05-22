"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { BackLink } from "@/components/customer/back-link";
import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { BUSINESS_TIME_ZONE } from "@/lib/constants";
import { formatOrderNumber } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import type { UserOrderSummary, ViewerSummary } from "@/lib/types";

type MyOrdersClientProps = {
  viewer: ViewerSummary;
  orders: UserOrderSummary[];
  mode?: "history" | "current";
};

const historyDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  timeZone: BUSINESS_TIME_ZONE,
  day: "numeric",
  month: "long",
});

const historyTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  timeZone: BUSINESS_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

function formatHistoryDate(date: string) {
  const value = new Date(date);

  return `${historyDateFormatter.format(value)} · ${historyTimeFormatter.format(value)}`;
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 text-stone-500"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
    >
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

function CheckStatusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="m8.4 12.1 2.3 2.3 5-5.1" />
    </svg>
  );
}

function ClockStatusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.8v4.5l3.1 1.9" />
    </svg>
  );
}

function CancelStatusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="m9.4 9.4 5.2 5.2" />
      <path d="m14.6 9.4-5.2 5.2" />
    </svg>
  );
}

function PreparingStatusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M8 4h8" />
      <path d="M9 4v3.2a3 3 0 0 1-.9 2.1L6.8 10.6a5.2 5.2 0 1 0 7.4 0l-1.3-1.3a3 3 0 0 1-.9-2.1V4" />
      <path d="M8.2 15h7.6" />
    </svg>
  );
}

function getOrderStatusCopy(order: UserOrderSummary, mode: "history" | "current") {
  if (order.status === "READY") {
    return {
      icon: <CheckStatusIcon />,
      label: mode === "current" ? "Готов к выдаче" : "Заказ завершён",
      labelClassName: "text-[#456f42]",
      iconClassName: "bg-[#dfeada] text-[#456f42]",
    };
  }

  if (order.status === "CANCELLED") {
    return {
      icon: <CancelStatusIcon />,
      label: "Заказ отменён",
      labelClassName: "text-stone-500",
      iconClassName: "bg-[#ebe6e1] text-stone-500",
    };
  }

  if (order.status === "PREPARING") {
    return {
      icon: <PreparingStatusIcon />,
      label: "Готовится",
      labelClassName: "text-[#5f754f]",
      iconClassName: "bg-[#e7efdd] text-[#5f754f]",
    };
  }

  return {
    icon: <ClockStatusIcon />,
    label: mode === "current" ? "В очереди" : "Заказ в процессе",
    labelClassName: "text-[#8a613a]",
    iconClassName: "bg-[#f4e5d2] text-[#8a613a]",
  };
}

function StatusLine({
  icon,
  label,
  labelClassName,
  iconClassName,
}: {
  icon: ReactNode;
  label: string;
  labelClassName: string;
  iconClassName: string;
}) {
  return (
    <p
      className={`flex items-center gap-3 text-[17px] font-medium leading-none tracking-tight ${labelClassName}`}
    >
      <span
        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
      >
        {icon}
      </span>
      {label}
    </p>
  );
}

export function MyOrdersClient({
  viewer,
  orders,
  mode = "history",
}: MyOrdersClientProps) {
  const isCurrentMode = mode === "current";
  const header = (
    <section className="relative flex min-h-10 items-center justify-center">
      <BackLink
        href={isCurrentMode ? "/menu" : "/menu?panel=account"}
        className="absolute left-0 h-9 w-8 [&_svg]:!h-7 [&_svg]:!w-7"
      />
      <h1 className="text-[26px] font-medium leading-none tracking-tight text-stone-950">
        {isCurrentMode ? "Текущие заказы" : "История заказов"}
      </h1>
    </section>
  );

  return (
    <CustomerMobileShell
      viewer={viewer}
      className="pb-28 pt-0"
      contentClassName="mt-8"
      header={header}
    >
      {orders.length === 0 ? (
        <EmptyState
          title={isCurrentMode ? "Нет текущих заказов" : "Пока нет заказов"}
          description={
            isCurrentMode
              ? "Когда у вас появится заказ в очереди, он будет отображаться здесь."
              : "Сделайте первый online-заказ, и после успешной оплаты он появится здесь."
          }
          action={
            <Link href="/menu" className="btn-primary">
              Перейти в меню
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-[26px] bg-white/62 shadow-[0_16px_36px_rgba(31,23,18,0.065)] backdrop-blur-[18px]">
          {orders.map((order) => {
            const status = getOrderStatusCopy(order, mode);

            return (
              <Link
                key={order.id}
                href={isCurrentMode ? `/order/${order.id}` : `/order/${order.id}?view=history`}
                className="block border-b border-stone-200/70 px-5 py-[18px] transition last:border-b-0 active:bg-white/55"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <StatusLine
                      icon={status.icon}
                      label={status.label}
                      labelClassName={status.labelClassName}
                      iconClassName={status.iconClassName}
                    />

                    <p className="mt-4 text-[19px] font-medium leading-none tracking-tight text-stone-950">
                      Заказ {formatOrderNumber(order.publicOrderNumber)}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-4">
                      <p className="text-[15px] font-normal leading-none text-stone-500">
                        {formatHistoryDate(order.confirmedAt)}
                      </p>
                      <p className="shrink-0 text-[17px] font-medium leading-none tracking-tight text-stone-950">
                        {formatMoney(order.totalPrice)}
                      </p>
                    </div>
                  </div>

                  <ChevronIcon />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </CustomerMobileShell>
  );
}
