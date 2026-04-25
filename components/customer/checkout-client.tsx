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

  if (!isMounted) {
    return (
      <CustomerMobileShell
        viewer={viewer}
        queueSummary={initialQueueSummary}
        showBottomNav={false}
        className="pb-40"
        header={
          <div>
            <p className="kicker">Checkout</p>
            <h1 className="mt-2 text-[36px] font-semibold leading-[0.94] tracking-tight text-stone-950">
              Подготавливаем оплату
            </h1>
          </div>
        }
      >
        <div className="app-card p-6 text-sm text-stone-600">Загружаем корзину…</div>
      </CustomerMobileShell>
    );
  }

  if (items.length === 0) {
    return (
      <CustomerMobileShell
        viewer={viewer}
        queueSummary={initialQueueSummary}
        showBottomNav={false}
        header={
          <div>
            <p className="kicker">Checkout</p>
            <h1 className="mt-2 text-[36px] font-semibold leading-[0.94] tracking-tight text-stone-950">
              Нечего оформлять
            </h1>
          </div>
        }
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
      showBottomNav={false}
      className="pb-44"
      header={
        <div>
          <p className="kicker">Checkout</p>
          <h1 className="mt-2 text-[36px] font-semibold leading-[0.94] tracking-tight text-stone-950">
            Подтвердите заказ
          </h1>
          <p className="mt-3 max-w-[320px] text-sm leading-6 text-stone-600">
            Это финальный шаг перед очередью: проверьте состав, выберите способ оплаты
            и переходите к подтверждению.
          </p>
        </div>
      }
    >
      <div className="space-y-4">
        <section className="app-card p-5">
          <p className="kicker">Аккаунт</p>
          <div className="mt-3 rounded-[24px] bg-stone-50 p-4">
            <p className="text-xl font-semibold tracking-tight text-stone-950">
              {viewer.name}
            </p>
            <p className="mt-1 text-sm text-stone-500">{viewer.email}</p>
          </div>
        </section>

        <section className="app-card p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="kicker">Оплата</p>
              <h2 className="mt-2 text-[30px] font-semibold leading-[0.98] tracking-tight text-stone-950">
                Выберите сценарий
              </h2>
            </div>
            <p className="text-sm text-stone-500">Сумма {formatMoney(summary.totalPrice)}</p>
          </div>

          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => setMethod("DEMO_CARD")}
              className={`w-full rounded-[28px] border p-4 text-left transition ${
                method === "DEMO_CARD"
                  ? "border-stone-950 bg-stone-950 text-white"
                  : "border-stone-200 bg-stone-50 text-stone-900"
              }`}
            >
              <p className="text-lg font-semibold">Демо-карта</p>
              <p className={`mt-2 text-sm leading-6 ${method === "DEMO_CARD" ? "text-stone-300" : "text-stone-600"}`}>
                Похоже на обычную оплату банковской картой через отдельный экран.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMethod("DEMO_SBP")}
              className={`w-full rounded-[28px] border p-4 text-left transition ${
                method === "DEMO_SBP"
                  ? "border-stone-950 bg-stone-950 text-white"
                  : "border-stone-200 bg-stone-50 text-stone-900"
              }`}
            >
              <p className="text-lg font-semibold">Демо-СБП</p>
              <p className={`mt-2 text-sm leading-6 ${method === "DEMO_SBP" ? "text-stone-300" : "text-stone-600"}`}>
                Похоже на мобильную оплату через СБП. Используется только для demo.
              </p>
            </button>
          </div>
        </section>

        <section className="app-card p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="kicker">Состав заказа</p>
              <h2 className="mt-2 text-[30px] font-semibold leading-[0.98] tracking-tight text-stone-950">
                Что вы берёте
              </h2>
            </div>
            <p className="text-sm text-stone-500">{summary.itemsCount} позиций</p>
          </div>

          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="rounded-[24px] bg-stone-50 px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">
                      {item.quantity} × {item.name}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
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
          <div className="rounded-[28px] bg-red-50 p-4 text-sm leading-6 text-red-700">
            Демо-оплата завершилась с ошибкой. Корзина сохранена, можно попробовать ещё раз.
          </div>
        ) : null}

        {paymentNotice === "CANCELLED" ? (
          <div className="rounded-[28px] bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            Демо-оплата была отменена. Состав заказа остался в корзине.
          </div>
        ) : null}

        {error ? (
          <div className="rounded-[28px] bg-red-50 p-4 text-sm leading-6 text-red-700">
            {error}
          </div>
        ) : null}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 px-4">
        <div className="floating-bar pointer-events-auto mx-auto w-full max-w-[398px] p-3">
          <div className="flex items-center justify-between gap-4 px-1 pb-3">
            <div>
              <p className="text-sm text-stone-500">К оплате</p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-stone-950">
                {formatMoney(summary.totalPrice)}
              </p>
            </div>
            <Link
              href="/cart"
              className="rounded-full border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700"
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
