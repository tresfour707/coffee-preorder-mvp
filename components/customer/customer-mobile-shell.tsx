"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandMark } from "@/components/customer/brand-mark";
import { cn } from "@/lib/cn";
import type { PublicQueueSummary, ViewerSummary } from "@/lib/types";

type CustomerMobileShellProps = {
  viewer: ViewerSummary | null;
  header?: ReactNode;
  queueSummary?: PublicQueueSummary | null;
  queueHeadline?: string;
  queueClassName?: string;
  contentClassName?: string;
  className?: string;
  children: ReactNode;
};
function QueueStrip({
  queueSummary,
  queueHeadline,
  className,
}: {
  queueSummary: PublicQueueSummary;
  queueHeadline?: string;
  className?: string;
}) {
  const fallbackHeadline =
    queueSummary.activeOrdersCount === 0
      ? "Нет заказов"
      : `Перед вами ${queueSummary.activeOrdersCount} заказов`;
  const headline = queueHeadline ?? fallbackHeadline;

  return (
    <section className={cn("mt-5 flex justify-center px-1", className)}>
      <p className="text-center text-[24px] font-medium tracking-tight text-stone-900">
        {headline}
      </p>
    </section>
  );
}

function MenuIcon() {
  return (
    <span className="relative block h-[18px] w-[28px]">
      <span className="absolute left-0 top-0 h-[3px] w-[28px] rounded-full bg-stone-950" />
      <span className="absolute left-0 top-[7px] h-[3px] w-[28px] rounded-full bg-stone-950" />
      <span className="absolute left-0 top-[14px] h-[3px] w-[28px] rounded-full bg-stone-950" />
    </span>
  );
}

function AccountIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[28px] w-[28px] text-stone-950"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
    >
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19.5c1.4-3 4-4.7 7-4.7s5.6 1.7 7 4.7" />
    </svg>
  );
}

export function CustomerMobileShell({
  viewer,
  header,
  queueSummary,
  queueHeadline,
  queueClassName,
  contentClassName,
  className,
  children,
}: CustomerMobileShellProps) {
  const pathname = usePathname();
  const [activePanel, setActivePanel] = useState<"menu" | "account" | null>(null);
  const myOrdersHref = useMemo(
    () => (viewer ? "/orders" : `/sign-in?next=${encodeURIComponent("/orders")}`),
    [viewer],
  );

  useEffect(() => {
    setActivePanel(null);
  }, [pathname]);

  useEffect(() => {
    if (!activePanel) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActivePanel(null);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activePanel]);

  const isMenuOpen = activePanel === "menu";
  const isAccountOpen = activePanel === "account";

  return (
    <main className="min-h-screen overflow-x-hidden">
      <div className="fixed inset-x-0 top-0 z-40 w-full">
        <div className="customer-top-island">
          <div className="customer-top-island-inner">
            <button
              type="button"
              onClick={() => setActivePanel("menu")}
              aria-label="Открыть меню"
              className="flex h-11 w-11 items-center justify-center justify-self-start rounded-full transition active:scale-[0.96]"
            >
              <MenuIcon />
            </button>

            <Link
              href="/menu"
              aria-label="Открыть главный экран"
              className="justify-self-center"
            >
              <BrandMark tone="coffee" size="md" />
            </Link>

            <button
              type="button"
              onClick={() => setActivePanel("account")}
              aria-label={viewer ? "Открыть профиль" : "Открыть вход и регистрацию"}
              className="flex h-11 w-11 items-center justify-center justify-self-end rounded-full transition active:scale-[0.96]"
            >
              <AccountIcon />
            </button>
          </div>
        </div>
      </div>

      <div className="customer-page pt-[98px]">
        <div className={cn("pb-10 pt-4", className)}>
          {header ? <div>{header}</div> : null}
          {queueSummary ? (
            <QueueStrip
              queueSummary={queueSummary}
              queueHeadline={queueHeadline}
              className={queueClassName}
            />
          ) : null}
          <div className={cn("mt-5", contentClassName)}>{children}</div>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 transition",
          activePanel ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!activePanel}
      >
        <div
          className={cn(
            "absolute inset-0 bg-white/6 transition-opacity duration-300",
            activePanel ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setActivePanel(null)}
        />

        <aside
          className={cn(
            "customer-matte-overlay absolute inset-y-0 left-0 isolate flex w-full max-w-[430px] flex-col overflow-hidden px-5 pb-8 pt-6 transition-transform duration-300",
            isMenuOpen ? "translate-x-0" : "-translate-x-full",
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
            <Link href="/menu" onClick={() => setActivePanel(null)}>
              <BrandMark tone="dark" size="md" />
            </Link>

            <button
              type="button"
              onClick={() => setActivePanel(null)}
              aria-label="Закрыть меню"
              className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-[34px] font-light leading-none text-stone-700"
            >
              ×
            </button>
          </div>

          <div className="relative z-10 flex flex-1 flex-col justify-center pb-6 pt-12">
            <nav className="space-y-5 text-center">
              <Link
                href="/menu#quick-search"
                onClick={() => setActivePanel(null)}
                className="block text-[28px] font-normal tracking-tight text-stone-950"
              >
                Меню
              </Link>
              <Link
                href={myOrdersHref}
                onClick={() => setActivePanel(null)}
                className="block text-[28px] font-normal tracking-tight text-stone-950"
              >
                История заказов
              </Link>
            </nav>
          </div>
        </aside>

        <aside
          className={cn(
            "customer-matte-overlay absolute inset-y-0 right-0 isolate flex w-full max-w-[430px] flex-col overflow-hidden px-5 pb-8 pt-6 transition-transform duration-300",
            isAccountOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-white/42" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-12%] top-[12%] h-[290px] w-[290px] rounded-full bg-[#d7c5ba]/38 blur-[95px]" />
            <div className="absolute right-[-18%] top-[24%] h-[270px] w-[270px] rounded-full bg-[#f1dfce]/30 blur-[110px]" />
            <div className="absolute left-[6%] bottom-[8%] h-[240px] w-[240px] rounded-full bg-[#efe0bf]/24 blur-[90px]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.34)_0%,rgba(255,255,255,0.16)_18%,rgba(255,255,255,0.22)_100%)]" />
          </div>

          <div className="relative z-10 flex items-center justify-center pt-14">
            <BrandMark tone="dark" size="md" />

            <button
              type="button"
              onClick={() => setActivePanel(null)}
              aria-label="Закрыть аккаунт"
              className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-[34px] font-light leading-none text-stone-700"
            >
              ×
            </button>
          </div>

          {!viewer ? (
            <div className="relative z-10 flex flex-1 flex-col justify-center pb-8 pt-10 text-center">
              <div className="mx-auto max-w-[290px]">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-stone-400">
                  Аккаунт
                </p>
                <h2 className="mt-4 text-[38px] font-semibold leading-[0.96] tracking-tight text-stone-950">
                  Вход и регистрация
                </h2>
                <p className="mt-4 text-sm leading-6 text-stone-600">
                  Для online-заказов используем ваш demo-аккаунт: у него свои корзина,
                  история и доступ к статусам заказов.
                </p>
              </div>

              <div className="mx-auto mt-8 flex w-full max-w-[282px] flex-col gap-3">
                <Link
                  href="/sign-in?next=%2Fmenu"
                  onClick={() => setActivePanel(null)}
                  className="flex min-h-14 items-center justify-center rounded-full bg-stone-950 px-6 py-4 text-[17px] font-black tracking-tight text-white shadow-[0_20px_50px_rgba(31,23,18,0.22)]"
                >
                  Войти
                </Link>
                <Link
                  href="/sign-up?next=%2Fmenu"
                  onClick={() => setActivePanel(null)}
                  className="flex min-h-14 items-center justify-center rounded-full border border-white/80 bg-white/70 px-6 py-4 text-[17px] font-bold tracking-tight text-stone-950 shadow-[0_18px_42px_rgba(31,23,18,0.08)] backdrop-blur-xl"
                >
                  Создать аккаунт
                </Link>
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex flex-1 flex-col justify-center pb-8 pt-10">
              <div className="mx-auto w-full max-w-[300px] space-y-4">
                <div className="text-center">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-stone-400">
                    Профиль
                  </p>
                  <h2 className="mt-4 text-[38px] font-semibold leading-[0.96] tracking-tight text-stone-950">
                    Аккаунт
                  </h2>
                </div>

                <section className="rounded-[28px] border border-white/80 bg-white/74 px-5 py-5 shadow-[0_18px_42px_rgba(31,23,18,0.08)] backdrop-blur-xl">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                    Имя
                  </p>
                  <p className="mt-2 text-[28px] font-semibold leading-none tracking-tight text-stone-950">
                    {viewer.name}
                  </p>

                  <p className="mt-5 text-[11px] uppercase tracking-[0.16em] text-stone-400">
                    Email
                  </p>
                  <p className="mt-2 text-sm font-semibold text-stone-900">{viewer.email}</p>
                </section>

                <section className="rounded-[28px] border border-white/80 bg-white/74 px-5 py-5 shadow-[0_18px_42px_rgba(31,23,18,0.08)] backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                        Карты
                      </p>
                      <p className="mt-2 text-[24px] font-semibold leading-none tracking-tight text-stone-950">
                        Подключим позже
                      </p>
                    </div>
                    <span className="rounded-full bg-[#f6efe8] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-stone-500">
                      demo
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-stone-600">
                    Пока оплата выбирается на checkout, а сохранённые карты добавим
                    следующим этапом.
                  </p>
                </section>

                <SignOutButton className="flex min-h-14 w-full items-center justify-center rounded-full bg-stone-950 px-6 py-4 text-[17px] font-black tracking-tight text-white shadow-[0_20px_50px_rgba(31,23,18,0.22)] disabled:cursor-wait disabled:opacity-60" />
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
