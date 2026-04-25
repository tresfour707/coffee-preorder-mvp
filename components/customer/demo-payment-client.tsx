"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthActions } from "@/components/auth/auth-actions";
import { CustomerTopNav } from "@/components/customer/customer-top-nav";
import { PageShell } from "@/components/ui/page-shell";
import { getCartOwnerKey, useCustomerCartStore } from "@/lib/cart-store";
import { formatMoney } from "@/lib/money";
import type { DemoPaymentDetails, DemoPaymentResolution, ViewerSummary } from "@/lib/types";

type DemoPaymentClientProps = {
  payment: DemoPaymentDetails;
  viewer: ViewerSummary;
};

export function DemoPaymentClient({
  payment,
  viewer,
}: DemoPaymentClientProps) {
  const router = useRouter();
  const ownerKey = getCartOwnerKey(viewer.id);
  const clearCart = useCustomerCartStore((state) => state.clear);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<null | "SUCCESS" | "FAIL" | "CANCEL">(null);

  async function handleResolve(result: "SUCCESS" | "FAIL" | "CANCEL") {
    setError(null);
    setIsSubmitting(result);

    try {
      const response = await fetch(`/api/payments/${payment.paymentId}/result`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ result }),
      });

      const data = (await response.json()) as DemoPaymentResolution | { error?: string };

      if (!response.ok || !("paymentId" in data)) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Не удалось завершить демо-оплату.",
        );
      }

      if (result === "SUCCESS" && data.order) {
        clearCart(ownerKey);
        router.push(`/order/${data.order.id}`);
        router.refresh();
        return;
      }

      const nextNotice = result === "FAIL" ? "failed" : "cancelled";
      router.push(`/checkout?payment=${nextNotice}`);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось завершить демо-оплату.",
      );
    } finally {
      setIsSubmitting(null);
    }
  }

  return (
    <PageShell
      eyebrow="Демо-оплата"
      title="Экран демо-оплаты"
      description="Это имитация внешнего сервиса оплаты. Только после `Success` заказ получит публичный номер и попадёт в общую очередь."
      subnav={<CustomerTopNav viewer={viewer} />}
      actions={<AuthActions viewer={viewer} />}
    >
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="order-2 surface p-6 md:p-8 lg:order-1">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="label-muted">Плательщик</p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-900">
                {payment.customerName ?? viewer.name}
              </h2>
              <p className="mt-2 text-sm text-stone-600">
                {payment.customerEmail ?? viewer.email}
              </p>
            </div>
            <div className="rounded-3xl bg-stone-100 px-5 py-4 text-right">
              <p className="label-muted">Способ оплаты</p>
              <p className="mt-2 text-lg font-semibold text-stone-900">
                {payment.method === "DEMO_SBP" ? "Демо-СБП" : "Демо-карта"}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {payment.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-2xl bg-stone-50 p-4"
              >
                <div>
                  <p className="text-base font-semibold text-stone-900">
                    {item.quantity} × {item.productName}
                  </p>
                  <p className="text-sm text-stone-500">
                    {formatMoney(item.unitPrice)} за единицу
                  </p>
                </div>
                <p className="text-base font-semibold text-stone-900">
                  {formatMoney(item.subtotal)}
                </p>
              </div>
            ))}
          </div>

          {error ? (
            <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </p>
          ) : null}
        </section>

        <aside className="order-1 surface h-fit p-6 lg:order-2 lg:sticky lg:top-6">
          <p className="label-muted">Сумма</p>
          <h2 className="mt-2 text-4xl font-semibold text-stone-900">
            {formatMoney(payment.amount)}
          </h2>

          <p className="mt-6 rounded-2xl bg-brand-50 p-4 text-sm leading-6 text-brand-900">
            Это демо-экран для встречи с владельцем. Он показывает логику оплаты,
            но не делает вид, что уже интегрирован с банком или кассой кофейни.
          </p>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => handleResolve("SUCCESS")}
              disabled={isSubmitting !== null}
              className="w-full rounded-full bg-emerald-600 px-5 py-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:bg-emerald-300"
            >
              {isSubmitting === "SUCCESS" ? "Подтверждаем…" : "Успешная оплата"}
            </button>

            <button
              type="button"
              onClick={() => handleResolve("FAIL")}
              disabled={isSubmitting !== null}
              className="w-full rounded-full bg-red-600 px-5 py-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:bg-red-300"
            >
              {isSubmitting === "FAIL" ? "Фиксируем…" : "Ошибка оплаты"}
            </button>

            <button
              type="button"
              onClick={() => handleResolve("CANCEL")}
              disabled={isSubmitting !== null}
              className="w-full rounded-full border border-stone-300 bg-white px-5 py-4 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting === "CANCEL" ? "Отменяем…" : "Отмена"}
            </button>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
