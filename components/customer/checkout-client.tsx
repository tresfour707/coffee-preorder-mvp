"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getCartOwnerKey,
  selectCartByOwner,
  useCustomerCartStore,
} from "@/lib/cart-store";
import { getCartSummary, toOrderRequestItems } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import type {
  DemoPaymentDetails,
  PaymentMethod,
  PublicQueueSummary,
  ViewerSummary,
} from "@/lib/types";

type CheckoutClientProps = {
  viewer: ViewerSummary;
  paymentNotice?: "FAILED" | "CANCELLED" | null;
  initialQueueSummary: PublicQueueSummary;
};

export function CheckoutClient({
  viewer,
  paymentNotice = null,
  initialQueueSummary,
}: CheckoutClientProps) {
  const router = useRouter();
  const ownerKey = getCartOwnerKey(viewer.id);
  const items = useCustomerCartStore(selectCartByOwner(ownerKey));
  const hasHydrated = useCustomerCartStore((state) => state.hasHydrated);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("DEMO_CARD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (hasHydrated) {
      setIsMounted(true);
    }
  }, [hasHydrated]);

  const summary = getCartSummary(items);

  async function handleStartDemoPayment() {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/payments/demo/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method,
          items: toOrderRequestItems(items),
        }),
      });

      const data = (await response.json()) as DemoPaymentDetails | { error?: string };

      if (!response.ok || !("paymentId" in data)) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Не удалось открыть демо-оплату.",
        );
      }

      router.push(`/checkout/payment/${data.paymentId}`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось открыть демо-оплату.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const header = (
    <section className="customer-soft-card px-5 py-5">
      <p className="kicker text-stone-400">Checkout</p>
      <h1 className="mt-3 text-[36px] font-semibold leading-[0.94] tracking-tight text-stone-950">
        Финальный шаг
      </h1>
      <p className="mt-3 text-sm leading-6 text-stone-600">
        Проверьте состав заказа и выберите demo-сценарий оплаты. Только после
        успешного подтверждения заказ попадёт в общую очередь.
      </p>
    </section>
  );

  if (!isMounted) {
    return (
      <CustomerMobileShell
        viewer={viewer}
        queueSummary={initialQueueSummary}
        className="pb-32"
        header={header}
      >
        <div className="customer-soft-card px-5 py-6 text-sm text-stone-600">
          Подготавливаем checkout…
        </div>
      </CustomerMobileShell>
    );
  }

  if (items.length === 0) {
    return (
      <CustomerMobileShell
        viewer={viewer}
        queueSummary={initialQueueSummary}
        className="pb-32"
        header={header}
      >
        <EmptyState
          title="Корзина пустая"
          description="Сначала соберите заказ в меню, а потом возвращайтесь к оплате."
          action={
            <Link href="/menu" className="btn-primary">
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
      queueSummary={initialQueueSummary}
      className="pb-40"
      header={header}
    >
      <div className="space-y-3">
        <section className="customer-soft-card-strong px-5 py-5">
          <p className="kicker text-stone-400">Аккаунт</p>
          <div className="mt-3 rounded-[26px] bg-[#fbf5ef] px-4 py-4">
            <p className="text-[26px] font-semibold leading-none tracking-tight text-stone-950">
              {viewer.name}
            </p>
            <p className="mt-2 text-sm text-stone-500">{viewer.email}</p>
          </div>
        </section>

        <section className="customer-soft-card-strong px-5 py-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="kicker text-stone-400">Оплата</p>
              <h2 className="mt-3 text-[30px] font-semibold leading-[0.95] tracking-tight text-stone-950">
                Выберите сценарий
              </h2>
            </div>
            <p className="text-sm text-stone-500">{formatMoney(summary.totalPrice)}</p>
          </div>

          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => setMethod("DEMO_CARD")}
              className={`w-full rounded-[28px] px-4 py-4 text-left transition ${
                method === "DEMO_CARD"
                  ? "bg-stone-950 text-white"
                  : "bg-[#fbf5ef] text-stone-900"
              }`}
            >
              <p className="text-lg font-semibold">Демо-карта</p>
              <p
                className={`mt-2 text-sm leading-6 ${
                  method === "DEMO_CARD" ? "text-stone-300" : "text-stone-600"
                }`}
              >
                Отдельный экран, который имитирует банковскую оплату.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMethod("DEMO_SBP")}
              className={`w-full rounded-[28px] px-4 py-4 text-left transition ${
                method === "DEMO_SBP"
                  ? "bg-stone-950 text-white"
                  : "bg-[#fbf5ef] text-stone-900"
              }`}
            >
              <p className="text-lg font-semibold">Демо-СБП</p>
              <p
                className={`mt-2 text-sm leading-6 ${
                  method === "DEMO_SBP" ? "text-stone-300" : "text-stone-600"
                }`}
              >
                Mobile-паттерн быстрой оплаты, оставленный в demo-режиме.
              </p>
            </button>
          </div>
        </section>

        <section className="customer-soft-card-strong px-5 py-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="kicker text-stone-400">Ваш заказ</p>
              <h2 className="mt-3 text-[30px] font-semibold leading-[0.95] tracking-tight text-stone-950">
                Что оплачиваем
              </h2>
            </div>
            <p className="text-sm text-stone-500">{summary.itemsCount} позиций</p>
          </div>

          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="rounded-[24px] bg-[#fbf5ef] px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">
                      {item.quantity} × {item.name}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
                      {item.sizeLabel ? `${item.sizeLabel} • ` : ""}
                      {formatMoney(item.price)} за единицу
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-stone-900">
                    {formatMoney(item.quantity * item.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {paymentNotice === "FAILED" ? (
          <div className="rounded-[28px] bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
            Демо-оплата завершилась с ошибкой. Корзина сохранена, можно попробовать
            ещё раз.
          </div>
        ) : null}

        {paymentNotice === "CANCELLED" ? (
          <div className="rounded-[28px] bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-800">
            Демо-оплата была отменена. Состав заказа остался в корзине.
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[28px] bg-red-50 px-4 py-4 text-sm leading-6 text-red-700">
            {error}
          </div>
        ) : null}
      </div>

      <div className="customer-action-bar">
        <div className="customer-action-bar-inner space-y-3 px-3 py-3">
          <div className="flex items-center justify-between gap-4 px-1">
            <div>
              <p className="text-sm text-stone-500">К оплате</p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-stone-950">
                {formatMoney(summary.totalPrice)}
              </p>
            </div>
            <Link
              href="/cart"
              className="rounded-full bg-stone-100 px-4 py-2.5 text-sm font-semibold text-stone-700"
            >
              Назад
            </Link>
          </div>

          <button
            type="button"
            onClick={handleStartDemoPayment}
            disabled={isSubmitting}
            className="w-full rounded-full bg-stone-950 px-5 py-4 text-sm font-semibold text-white transition disabled:cursor-wait disabled:bg-stone-300"
          >
            {isSubmitting
              ? "Открываем оплату…"
              : paymentNotice
                ? "Попробовать ещё раз"
                : "Перейти к оплате"}
          </button>
        </div>
      </div>
    </CustomerMobileShell>
  );
}
