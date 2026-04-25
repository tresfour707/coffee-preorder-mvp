"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { CustomerBottomNav } from "@/components/customer/customer-bottom-nav";
import { cn } from "@/lib/cn";
import { formatOrderNumber } from "@/lib/format";
import type { PublicQueueSummary, ViewerSummary } from "@/lib/types";

type CustomerMobileShellProps = {
  viewer: ViewerSummary | null;
  header?: ReactNode;
  queueSummary?: PublicQueueSummary | null;
  showBottomNav?: boolean;
  className?: string;
  children: ReactNode;
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

export function CustomerMobileShell({
  viewer,
  header,
  queueSummary,
  showBottomNav = true,
  className,
  children,
}: CustomerMobileShellProps) {
  const viewerName = viewer?.name?.trim() || null;
  const viewerInitial = viewerName ? viewerName.charAt(0).toUpperCase() : null;

  return (
    <main className="min-h-screen">
      <div className={cn("mobile-page", className)}>
        <div className="flex items-center justify-between gap-3">
          <Link href="/menu" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#f3a71b] text-sm font-black uppercase tracking-[0.18em] text-white">
              CQ
            </div>
            <div>
              <p className="text-[18px] font-black tracking-tight text-stone-950">
                coffee queue
              </p>
              <p className="text-xs text-stone-500">mobile order demo</p>
            </div>
          </Link>

          {viewer ? (
            <Link
              href="/orders"
              className="flex h-11 min-w-11 items-center justify-center rounded-full border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 shadow-sm"
            >
              {viewerInitial}
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="rounded-full border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm"
            >
              Войти
            </Link>
          )}
        </div>

        {queueSummary ? (
          <div className="app-soft-card mt-4 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="kicker text-stone-400">Общая очередь</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-stone-900">
                  {queueSummary.activeOrdersCount > 0
                    ? `Сейчас перед новым заказом ${queueSummary.activeOrdersCount} ${getOrdersWord(
                        queueSummary.activeOrdersCount,
                      )}`
                    : "Сейчас можно заказать без ожидания перед вами"}
                </p>
              </div>

              <div className="rounded-[22px] bg-white px-4 py-3 text-right shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
                  В работе
                </p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-stone-950">
                  {queueSummary.currentOrderPublicNumber
                    ? formatOrderNumber(queueSummary.currentOrderPublicNumber)
                    : "Свободно"}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {header ? <div className="mt-5">{header}</div> : null}

        <div className="mt-5">{children}</div>
      </div>

      {showBottomNav ? <CustomerBottomNav viewer={viewer} /> : null}
    </main>
  );
}
