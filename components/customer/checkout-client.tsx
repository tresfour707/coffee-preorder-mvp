"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthActions } from "@/components/auth/auth-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import {
  getCartOwnerKey,
  selectCartByOwner,
  useCustomerCartStore,
} from "@/lib/cart-store";
import { getCartSummary, toOrderRequestItems } from "@/lib/cart";
import { formatMoney } from "@/lib/money";
import type { DemoPaymentDetails, PaymentMethod, ViewerSummary } from "@/lib/types";

type CheckoutClientProps = {
  viewer: ViewerSummary;
  paymentNotice?: "FAILED" | "CANCELLED" | null;
};

export function CheckoutClient({
  viewer,
  paymentNotice = null,
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
      <PageShell
        eyebrow="Оформление"
        title="Подготовка оплаты"
        description="Подгружаем корзину текущего аккаунта перед демо-оплатой."
        actions={<AuthActions viewer={viewer} />}
      >
        <div className="surface p-8 text-sm text-stone-600">
          Загружаем корзину пользователя {viewer.name}…
        </div>
      </PageShell>
    );
  }

  if (items.length === 0) {
    return (
      <PageShell
        eyebrow="Оформление"
        title="Оформление"
        description="Сначала соберите заказ в меню, а потом вернитесь к демо-оплате."
        actions={<AuthActions viewer={viewer} />}
      >
        <EmptyState
          title="Корзина пустая"
          description="В оформлении пока нечего оплачивать. Добавьте напитки и закуски в меню."
          action={
            <Link
              href="/menu"
              className="inline-flex rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              Вернуться в меню
            </Link>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      className="pb-28 md:pb-32 lg:pb-8"
      eyebrow="Оформление"
      title="Демо-оплата"
      description="Здесь мы честно показываем будущий шаг оплаты. В рабочей версии вместо него будет реальный сервис оплаты."
      actions={<AuthActions viewer={viewer} />}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          <div className="surface p-6">
            <p className="label-muted">Аккаунт</p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-900">
              Плательщик
            </h2>
            <div className="mt-5 rounded-3xl bg-stone-50 p-5">
              <p className="text-lg font-semibold text-stone-900">{viewer.name}</p>
              <p className="mt-1 text-sm text-stone-600">{viewer.email}</p>
            </div>
          </div>

          <div className="surface p-6">
            <p className="label-muted">Способ оплаты</p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-900">
              Выберите сценарий оплаты
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="rounded-3xl border border-stone-200 bg-white p-5 transition hover:border-stone-400">
                <input
                  type="radio"
                  name="payment-method"
                  value="DEMO_CARD"
                  checked={method === "DEMO_CARD"}
                  onChange={() => setMethod("DEMO_CARD")}
                  className="sr-only"
                />
                <p className="text-lg font-semibold text-stone-900">Демо-карта</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Имитирует обычную оплату банковской картой через отдельный экран оплаты.
                </p>
              </label>

              <label className="rounded-3xl border border-stone-200 bg-white p-5 transition hover:border-stone-400">
                <input
                  type="radio"
                  name="payment-method"
                  value="DEMO_SBP"
                  checked={method === "DEMO_SBP"}
                  onChange={() => setMethod("DEMO_SBP")}
                  className="sr-only"
                />
                <p className="text-lg font-semibold text-stone-900">Демо-СБП</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Имитирует оплату через СБП. Нужна только для показа будущего сценария.
                </p>
              </label>
            </div>
          </div>

          {paymentNotice === "FAILED" ? (
            <div className="rounded-3xl bg-red-50 p-5 text-sm leading-6 text-red-700">
              Демо-оплата завершилась с ошибкой. Заказ не попал в очередь, корзина сохранена. Можно попробовать ещё раз.
            </div>
          ) : null}

          {paymentNotice === "CANCELLED" ? (
            <div className="rounded-3xl bg-amber-50 p-5 text-sm leading-6 text-amber-800">
              Демо-оплата была отменена. Заказ не попал в очередь, корзина сохранена.
            </div>
          ) : null}
        </section>

        <aside className="surface h-fit p-6 lg:sticky lg:top-6">
          <p className="label-muted">Итог</p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-900">
            Перед оплатой
          </h2>

          <dl className="mt-6 space-y-3 text-sm text-stone-600">
            <div className="flex items-center justify-between">
              <dt>Позиции</dt>
              <dd className="font-semibold text-stone-900">{summary.itemsCount}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Источник</dt>
              <dd className="font-semibold text-stone-900">Онлайн</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Аккаунт</dt>
              <dd className="font-semibold text-stone-900">{viewer.name}</dd>
            </div>
            <div className="flex items-center justify-between text-base">
              <dt className="font-medium text-stone-700">Итого</dt>
              <dd className="text-xl font-semibold text-stone-900">
                {formatMoney(summary.totalPrice)}
              </dd>
            </div>
          </dl>

          <p className="mt-6 rounded-2xl bg-brand-50 p-4 text-sm leading-6 text-brand-900">
            В очередь заказ попадёт только после `Success` на следующем экране.
          </p>

          {error ? (
            <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleStartDemoPayment}
            disabled={isSubmitting}
            className="mt-6 w-full rounded-full bg-stone-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-wait disabled:bg-stone-400"
          >
            {isSubmitting ? "Открываем…" : paymentNotice ? "Попробовать оплатить ещё раз" : "Открыть демо-оплату"}
          </button>

          <Link
            href="/cart"
            className="mt-3 inline-flex w-full justify-center rounded-full border border-stone-300 bg-white px-5 py-4 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
          >
            Вернуться в корзину
          </Link>
        </aside>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 px-4 lg:hidden">
        <div className="pointer-events-auto mx-auto flex max-w-xl items-center justify-between rounded-[1.75rem] bg-stone-900 px-4 py-3 text-white shadow-2xl">
          <div>
            <p className="text-sm text-stone-300">К оплате</p>
            <p className="text-base font-semibold">{formatMoney(summary.totalPrice)}</p>
          </div>
          <button
            type="button"
            onClick={handleStartDemoPayment}
            disabled={isSubmitting}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-900 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? "Открываем…" : "Оплатить"}
          </button>
        </div>
      </div>
    </PageShell>
  );
}
