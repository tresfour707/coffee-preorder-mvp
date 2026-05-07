"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getCartOwnerKey,
  selectCartByOwner,
  useCustomerCartStore,
} from "@/lib/cart-store";
import { getCartSummary, toOrderRequestItems } from "@/lib/cart";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/money";
import type {
  DemoPaymentDetails,
  DemoPaymentResolution,
  PaymentMethod,
  ViewerSummary,
} from "@/lib/types";

type CheckoutClientProps = {
  viewer: ViewerSummary;
};

type PaymentChoice = PaymentMethod | "SBERPAY";

function InfoIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7 text-stone-500"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11.5v5" />
      <path d="M12 7.5h.01" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7 text-[#2d5b45]"
      fill="currentColor"
    >
      <path d="M4.75 6.25h14.5A2.75 2.75 0 0 1 22 9v1H2V9a2.75 2.75 0 0 1 2.75-2.75Z" />
      <path d="M2 11.75h20V15a2.75 2.75 0 0 1-2.75 2.75H4.75A2.75 2.75 0 0 1 2 15v-3.25Zm4.25 2.75a.9.9 0 0 0 0 1.8h3.2a.9.9 0 0 0 0-1.8h-3.2Z" />
    </svg>
  );
}

function SbpMark() {
  return (
    <div className="relative h-9 w-9">
      <span className="absolute left-[2px] top-[4px] h-0 w-0 border-y-[8px] border-l-[13px] border-y-transparent border-l-[#6fbf44]" />
      <span className="absolute left-[12px] top-[1px] h-0 w-0 border-y-[8px] border-l-[13px] border-y-transparent border-l-[#f0b32f]" />
      <span className="absolute left-[12px] top-[17px] h-0 w-0 border-y-[8px] border-l-[13px] border-y-transparent border-l-[#33a3dc]" />
      <span className="absolute left-[22px] top-[9px] h-0 w-0 border-y-[8px] border-l-[13px] border-y-transparent border-l-[#553f91]" />
    </div>
  );
}

function SberPayBadge() {
  return (
    <span className="inline-flex h-9 items-center rounded-full bg-[linear-gradient(90deg,#68c936,#27c6b7)] px-3 text-sm font-bold text-white">
      Pay
    </span>
  );
}

function RadioCircle({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[2.5px] transition",
        checked ? "border-[#7ea174] bg-[#7ea174]" : "border-stone-300 bg-white",
      )}
    >
      {checked ? <span className="h-2.5 w-2.5 rounded-full bg-white" /> : null}
    </span>
  );
}

function PaymentOption({
  checked,
  title,
  description,
  icon,
  onClick,
}: {
  checked: boolean;
  title: string;
  description?: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-[24px] px-1 py-4 text-left transition active:scale-[0.99]"
    >
      <RadioCircle checked={checked} />
      <span className="min-w-0 flex-1">
        <span className="block text-[22px] font-semibold leading-none tracking-tight text-stone-950">
          {title}
        </span>
        {description ? (
          <span className="mt-2 block text-sm leading-5 text-stone-500">{description}</span>
        ) : null}
      </span>
      {icon}
    </button>
  );
}

function getPaymentMethod(choice: PaymentChoice): PaymentMethod {
  return choice === "DEMO_CARD" ? "DEMO_CARD" : "DEMO_SBP";
}

export function CheckoutClient({ viewer }: CheckoutClientProps) {
  const router = useRouter();
  const ownerKey = getCartOwnerKey(viewer.id);
  const items = useCustomerCartStore(selectCartByOwner(ownerKey));
  const hasHydrated = useCustomerCartStore((state) => state.hasHydrated);
  const clearCart = useCustomerCartStore((state) => state.clear);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentChoice>("DEMO_SBP");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (hasHydrated) {
      setIsMounted(true);
    }
  }, [hasHydrated]);

  const summary = getCartSummary(items);

  async function handlePay() {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/payments/demo/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: getPaymentMethod(method),
          items: toOrderRequestItems(items),
        }),
      });

      const data = (await response.json()) as DemoPaymentDetails | { error?: string };

      if (!response.ok || !("paymentId" in data)) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Не удалось начать оплату.",
        );
      }

      const resolutionResponse = await fetch(`/api/payments/${data.paymentId}/result`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ result: "SUCCESS" }),
      });
      const resolutionData = (await resolutionResponse.json()) as
        | DemoPaymentResolution
        | { error?: string };

      if (!resolutionResponse.ok || !("paymentId" in resolutionData)) {
        throw new Error(
          "error" in resolutionData && resolutionData.error
            ? resolutionData.error
            : "Не удалось завершить оплату.",
        );
      }

      if (!resolutionData.order) {
        throw new Error("Оплата прошла, но заказ не был создан.");
      }

      clearCart(ownerKey);
      router.push(`/order/${resolutionData.order.id}`);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось провести оплату.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const header = (
    <section className="rounded-[30px] border border-white/70 bg-[rgba(255,255,255,0.72)] px-5 py-5 shadow-[0_16px_34px_rgba(31,23,18,0.08)] backdrop-blur-[22px]">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-stone-400">
        Аккаунт
      </p>
      <h1 className="mt-3 text-[30px] font-semibold leading-none tracking-tight text-stone-950">
        {viewer.name}
      </h1>
      <p className="mt-2 text-[15px] text-stone-500">{viewer.email}</p>
    </section>
  );

  if (!isMounted) {
    return (
      <CustomerMobileShell
        viewer={viewer}
        className="pb-32 pt-0"
        contentClassName="mt-5"
        header={header}
      >
        <div className="customer-soft-card px-5 py-6 text-sm text-stone-600">
          Подготавливаем оплату...
        </div>
      </CustomerMobileShell>
    );
  }

  if (items.length === 0) {
    return (
      <CustomerMobileShell
        viewer={viewer}
        className="pb-32 pt-0"
        contentClassName="mt-5"
        header={header}
      >
        <EmptyState
          title="Корзина пустая"
          description="Сначала соберите заказ в меню, а потом возвращайтесь к оплате."
          action={
            <Link href="/menu#quick-search" className="btn-primary">
              Вернуться в меню
            </Link>
          }
        />
      </CustomerMobileShell>
    );
  }

  return (
    <CustomerMobileShell
      viewer={viewer}
      className="pb-14 pt-0"
      contentClassName="mt-5"
      header={header}
    >
      <div className="space-y-4">
        <section className="rounded-[34px] border border-white/75 bg-[rgba(255,255,255,0.78)] px-5 py-5 shadow-[0_16px_34px_rgba(31,23,18,0.08)] backdrop-blur-[22px]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[31px] font-medium leading-none tracking-tight text-stone-950">
              Способы оплаты
            </h2>
            <InfoIcon />
          </div>

          <div className="mt-4 divide-y divide-stone-200/75">
            <PaymentOption
              checked={method === "DEMO_SBP"}
              title="СБП"
              icon={<SbpMark />}
              onClick={() => setMethod("DEMO_SBP")}
            />

            <div>
              <PaymentOption
                checked={method === "DEMO_CARD"}
                title="Карта"
                icon={<CardIcon />}
                onClick={() => setMethod("DEMO_CARD")}
              />

              {method === "DEMO_CARD" ? (
                <button
                  type="button"
                  className="mb-4 mt-1 flex min-h-[118px] w-full items-center justify-center rounded-[24px] border border-stone-200 bg-[#f4f4f2] px-5 text-[24px] font-medium tracking-tight text-[#285944] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition active:scale-[0.99]"
                >
                  Новая карта
                </button>
              ) : null}
            </div>

            <PaymentOption
              checked={method === "SBERPAY"}
              title="SberPay"
              description="Быстрая оплата в приложении"
              icon={<SberPayBadge />}
              onClick={() => setMethod("SBERPAY")}
            />
          </div>
        </section>

        {error ? (
          <div className="rounded-[28px] bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
            {error}
          </div>
        ) : null}

        <section className="rounded-[34px] border border-white/75 bg-[rgba(255,255,255,0.82)] px-5 py-5 shadow-[0_16px_34px_rgba(31,23,18,0.08)] backdrop-blur-[22px]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[32px] font-medium leading-none tracking-tight text-stone-950">
              Итого
            </h2>
            <div className="flex items-center gap-2 text-right">
              <p className="text-[26px] font-semibold leading-none tracking-tight text-stone-950">
                {formatMoney(summary.totalPrice)}
              </p>
              <span className="text-[28px] leading-none text-stone-950">⌄</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePay}
            disabled={isSubmitting}
            className="mt-5 w-full rounded-full bg-[#6b4a38] px-5 py-4 text-[18px] font-semibold text-white shadow-[0_18px_36px_rgba(91,64,45,0.18)] transition hover:bg-[#5f4131] active:scale-[0.98] disabled:cursor-wait disabled:bg-stone-300 disabled:shadow-none"
          >
            {isSubmitting ? "Оплачиваем..." : "Оплатить"}
          </button>

          <p className="mt-4 text-center text-[13px] leading-5 text-stone-500">
            После оплаты заказ сразу появится в статусе и попадет в очередь.
          </p>
        </section>
      </div>
    </CustomerMobileShell>
  );
}
