"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandMark } from "@/components/customer/brand-mark";
import { cn } from "@/lib/cn";
import { formatOrderNumber } from "@/lib/format";
import type { PublicQueueSummary, ViewerSummary } from "@/lib/types";

type CustomerMobileShellProps = {
  viewer: ViewerSummary | null;
  header?: ReactNode;
  queueSummary?: PublicQueueSummary | null;
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

function QueueStrip({ queueSummary }: { queueSummary: PublicQueueSummary }) {
  const waitingText =
    queueSummary.activeOrdersCount > 0
      ? `Перед новым заказом ${queueSummary.activeOrdersCount} ${getOrdersWord(
          queueSummary.activeOrdersCount,
        )}`
      : "Сейчас очередь свободна";

  return (
    <section className="customer-soft-card mt-4 px-4 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="kicker text-stone-400">Общая очередь</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-stone-900">
            {waitingText}
          </p>
        </div>

        <div className="shrink-0 rounded-full bg-white px-4 py-3 text-right shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
            Сейчас
          </p>
          <p className="mt-1 text-sm font-semibold text-stone-950">
            {queueSummary.currentOrderPublicNumber
              ? formatOrderNumber(queueSummary.currentOrderPublicNumber)
              : "Свободно"}
          </p>
        </div>
      </div>
    </section>
  );
}

export function CustomerMobileShell({
  viewer,
  header,
  queueSummary,
  className,
  children,
}: CustomerMobileShellProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const myOrdersHref = useMemo(
    () => (viewer ? "/orders" : `/sign-in?next=${encodeURIComponent("/orders")}`),
    [viewer],
  );
  const profileHref = useMemo(
    () => (viewer ? "/profile" : `/sign-in?next=${encodeURIComponent("/profile")}`),
    [viewer],
  );

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <main className="min-h-screen overflow-x-hidden">
      <div className="fixed inset-x-0 top-0 z-40 w-full">
        <div className="customer-top-island">
          <div className="customer-top-island-inner">
            <Link href="/menu" aria-label="Открыть главный экран">
              <BrandMark tone="light" size="md" />
            </Link>

            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Открыть меню"
              className="flex h-12 w-12 items-center justify-center transition hover:bg-white/10"
            >
              <span className="relative block h-5 w-8">
                <span className="absolute left-0 top-0 h-[6px] w-8 rounded-full bg-white" />
                <span className="absolute left-0 top-[12px] h-[6px] w-8 rounded-full bg-white" />
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="customer-page pt-[94px]">
        <div className={cn("pb-10 pt-4", className)}>
          {header ? <div>{header}</div> : null}
          {queueSummary ? <QueueStrip queueSummary={queueSummary} /> : null}
          <div className="mt-5">{children}</div>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 transition",
          isMenuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!isMenuOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-white/6 transition-opacity duration-300",
            isMenuOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setIsMenuOpen(false)}
        />

        <aside
          className={cn(
            "customer-matte-overlay absolute inset-y-0 right-0 isolate flex w-full max-w-[430px] flex-col overflow-hidden px-5 pb-8 pt-6 transition-transform duration-300",
            isMenuOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-white/42" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-12%] top-[16%] h-[290px] w-[290px] rounded-full bg-[#b6ab97]/42 blur-[95px]" />
            <div className="absolute right-[-18%] top-[22%] h-[280px] w-[280px] rounded-full bg-[#d5c7be]/34 blur-[110px]" />
            <div className="absolute left-[2%] bottom-[4%] h-[230px] w-[240px] rounded-full bg-[#eed7a3]/22 blur-[90px]" />
            <div className="absolute right-[-8%] bottom-[18%] h-[260px] w-[250px] rounded-full bg-[#b8b2ad]/28 blur-[105px]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.34)_0%,rgba(255,255,255,0.16)_18%,rgba(255,255,255,0.22)_100%)]" />
          </div>

          <div className="relative z-10 flex items-center justify-center pt-16">
            <Link href="/menu" onClick={() => setIsMenuOpen(false)}>
              <BrandMark tone="dark" size="md" />
            </Link>

            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Закрыть меню"
              className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-[34px] font-light leading-none text-stone-700"
            >
              ×
            </button>
          </div>

          <div className="relative z-10 flex flex-1 flex-col justify-center pb-6 pt-12">
            <nav className="space-y-5 text-center">
              <Link
                href="/menu#categories"
                onClick={() => setIsMenuOpen(false)}
                className="block text-[28px] font-normal tracking-tight text-stone-950"
              >
                Меню
              </Link>
              <Link
                href={myOrdersHref}
                onClick={() => setIsMenuOpen(false)}
                className="block text-[28px] font-normal tracking-tight text-stone-950"
              >
                История заказов
              </Link>
              {viewer ? (
                <Link
                  href={profileHref}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-[28px] font-normal tracking-tight text-stone-950"
                >
                  Профиль
                </Link>
              ) : null}
            </nav>
          </div>

          {!viewer ? (
            <div className="relative z-10 pt-4 text-center">
              <Link
                href="/sign-in?next=%2Forders"
                onClick={() => setIsMenuOpen(false)}
                className="mx-auto flex min-h-14 w-full max-w-[272px] items-center justify-center rounded-full bg-stone-950 px-6 py-4 text-[18px] font-black tracking-tight text-white shadow-[0_20px_50px_rgba(31,23,18,0.22)]"
              >
                Войти
              </Link>
            </div>
          ) : (
            <div className="relative z-10 pt-4">
              <SignOutButton className="mx-auto flex min-h-14 w-full max-w-[272px] items-center justify-center rounded-full bg-stone-950 px-6 py-4 text-[18px] font-black tracking-tight text-white shadow-[0_20px_50px_rgba(31,23,18,0.22)] disabled:cursor-wait disabled:opacity-60" />
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
