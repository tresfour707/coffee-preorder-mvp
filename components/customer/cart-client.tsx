"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AuthActions } from "@/components/auth/auth-actions";
import { CustomerTopNav } from "@/components/customer/customer-top-nav";
import { PublicQueueBanner } from "@/components/customer/public-queue-banner";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { QuantityControl } from "@/components/ui/quantity-control";
import { getCartSummary } from "@/lib/cart";
import {
  getCartOwnerKey,
  selectCartByOwner,
  useCustomerCartStore,
} from "@/lib/cart-store";
import { formatMoney } from "@/lib/money";
import type { PublicQueueSummary, ViewerSummary } from "@/lib/types";

type CartClientProps = {
  viewer: ViewerSummary | null;
  initialQueueSummary: PublicQueueSummary;
};

export function CartClient({
  viewer,
  initialQueueSummary,
}: CartClientProps) {
  const ownerKey = getCartOwnerKey(viewer?.id);
  const items = useCustomerCartStore(selectCartByOwner(ownerKey));
  const hasHydrated = useCustomerCartStore((state) => state.hasHydrated);
  const addProduct = useCustomerCartStore((state) => state.addProduct);
  const decrementProduct = useCustomerCartStore((state) => state.decrementProduct);
  const removeProduct = useCustomerCartStore((state) => state.removeProduct);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (hasHydrated) {
      setIsMounted(true);
    }
  }, [hasHydrated]);

  const summary = getCartSummary(items);

  if (!isMounted) {
    return (
      <PageShell
        eyebrow={viewer ? "Клиент" : "Гость"}
        title="Корзина"
        description="Проверяем локальную корзину перед checkout."
        subnav={<CustomerTopNav viewer={viewer} />}
        banner={<PublicQueueBanner initialSummary={initialQueueSummary} />}
        actions={<AuthActions viewer={viewer} />}
      >
        <div className="surface p-8 text-sm text-stone-600">Загрузка корзины…</div>
      </PageShell>
    );
  }

  if (items.length === 0) {
    return (
      <PageShell
        eyebrow={viewer ? "Клиент" : "Гость"}
        title="Корзина"
        description="Добавьте напитки или выпечку в заказ, а затем переходите к checkout."
        subnav={<CustomerTopNav viewer={viewer} />}
        banner={<PublicQueueBanner initialSummary={initialQueueSummary} />}
        actions={<AuthActions viewer={viewer} />}
      >
        <EmptyState
          title="Корзина пока пустая"
          description="Вернитесь в меню, выберите позиции и после оплаты заказ попадёт в общую очередь кофейни."
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
      eyebrow={viewer ? "Клиент" : "Гость"}
      title="Корзина"
      description="Сначала проверьте состав заказа, затем перейдите к оформлению. В очередь заказ попадёт только после успешной демо-оплаты."
      subnav={<CustomerTopNav viewer={viewer} />}
      banner={<PublicQueueBanner initialSummary={initialQueueSummary} />}
      actions={<AuthActions viewer={viewer} />}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          {items.map((item) => (
            <article
              key={item.productId}
              className="surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between md:p-5"
            >
              <div>
                <h2 className="text-xl font-semibold text-stone-900">
                  {item.name}
                </h2>
                {item.description ? (
                  <p className="mt-1 text-sm text-stone-600">{item.description}</p>
                ) : null}
                <p className="mt-3 text-sm font-medium text-stone-500">
                  {formatMoney(item.price)} за единицу
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                <QuantityControl
                  quantity={item.quantity}
                  onIncrement={() =>
                    addProduct(ownerKey, {
                      id: item.productId,
                      name: item.name,
                      description: item.description,
                      price: item.price,
                      category: item.category,
                      available: true,
                    })
                  }
                  onDecrement={() => decrementProduct(ownerKey, item.productId)}
                />
                <div className="text-right">
                  <p className="text-lg font-semibold text-stone-900">
                    {formatMoney(item.price * item.quantity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeProduct(ownerKey, item.productId)}
                    className="mt-2 text-sm font-medium text-stone-500 transition hover:text-stone-900"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="surface h-fit p-6 lg:sticky lg:top-6">
          <p className="label-muted">Итог</p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-900">
            Перед checkout
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
            <div className="flex items-center justify-between text-base">
              <dt className="font-medium text-stone-700">Итого</dt>
              <dd className="text-xl font-semibold text-stone-900">
                {formatMoney(summary.totalPrice)}
              </dd>
            </div>
          </dl>

          <p className="mt-6 rounded-2xl bg-brand-50 p-4 text-sm leading-6 text-brand-900">
            {viewer
              ? "Вы уже вошли в аккаунт. На следующем шаге откроется оформление и демо-оплата."
              : "Для демо-оплаты нужен аккаунт. Если вы ещё не вошли, приложение переведёт вас на экран входа."}
          </p>

          <Link
            href="/checkout"
            className="mt-6 inline-flex w-full justify-center rounded-full bg-stone-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Перейти к оформлению
          </Link>
        </aside>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 px-4 lg:hidden">
        <div className="pointer-events-auto mx-auto flex max-w-xl items-center justify-between rounded-[1.75rem] bg-stone-900 px-4 py-3 text-white shadow-2xl">
          <div>
            <p className="text-sm text-stone-300">Итого</p>
            <p className="text-base font-semibold">{formatMoney(summary.totalPrice)}</p>
          </div>
          <Link
            href="/checkout"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-900"
          >
            Оформить
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
