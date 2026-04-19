"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { QuantityControl } from "@/components/ui/quantity-control";
import { getCartSummary, toOrderRequestItems } from "@/lib/cart";
import { useCustomerCartStore } from "@/lib/cart-store";
import { formatMoney } from "@/lib/money";
import type { OrderDetails } from "@/lib/types";

export function CartClient() {
  const router = useRouter();
  const items = useCustomerCartStore((state) => state.items);
  const addProduct = useCustomerCartStore((state) => state.addProduct);
  const decrementProduct = useCustomerCartStore((state) => state.decrementProduct);
  const removeProduct = useCustomerCartStore((state) => state.removeProduct);
  const clear = useCustomerCartStore((state) => state.clear);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const summary = getCartSummary(items);

  async function handleConfirmOrder() {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders/online", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: toOrderRequestItems(items),
        }),
      });

      const data = (await response.json()) as OrderDetails | { error?: string };

      if (!response.ok || !("id" in data)) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Не удалось подтвердить заказ.",
        );
      }

      clear();
      startTransition(() => {
        router.push(`/order/${data.id}`);
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось подтвердить заказ.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isMounted) {
    return (
      <PageShell
        eyebrow="Гость"
        title="Корзина"
        description="Проверяем локальную корзину перед подтверждением заказа."
      >
        <div className="surface p-8 text-sm text-stone-600">Загрузка корзины…</div>
      </PageShell>
    );
  }

  if (items.length === 0) {
    return (
      <PageShell
        eyebrow="Гость"
        title="Корзина"
        description="Добавьте напитки или выпечку в заказ, а затем подтвердите его одним действием."
      >
        <EmptyState
          title="Корзина пока пустая"
          description="Вернитесь в меню, выберите позиции и после подтверждения заказ попадёт в общую очередь кофейни."
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
      eyebrow="Гость"
      title="Корзина"
      description="После нажатия Confirm order заказ сразу получает публичный номер и попадает в ту же очередь, что и заказы с кассы."
      actions={
        <Link
          href="/menu"
          className="inline-flex rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
        >
          Продолжить выбор
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-4">
          {items.map((item) => (
            <article
              key={item.productId}
              className="surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
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
                    addProduct({
                      id: item.productId,
                      name: item.name,
                      description: item.description,
                      price: item.price,
                      category: item.category,
                      available: true,
                    })
                  }
                  onDecrement={() => decrementProduct(item.productId)}
                />
                <div className="text-right">
                  <p className="text-lg font-semibold text-stone-900">
                    {formatMoney(item.price * item.quantity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeProduct(item.productId)}
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
            Подтверждение заказа
          </h2>

          <dl className="mt-6 space-y-3 text-sm text-stone-600">
            <div className="flex items-center justify-between">
              <dt>Позиции</dt>
              <dd className="font-semibold text-stone-900">{summary.itemsCount}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Источник</dt>
              <dd className="font-semibold text-stone-900">Online</dd>
            </div>
            <div className="flex items-center justify-between text-base">
              <dt className="font-medium text-stone-700">Итого</dt>
              <dd className="text-xl font-semibold text-stone-900">
                {formatMoney(summary.totalPrice)}
              </dd>
            </div>
          </dl>

          <p className="mt-6 rounded-2xl bg-brand-50 p-4 text-sm leading-6 text-brand-900">
            Для MVP оплата не подключена. Заказ попадёт в общую очередь сразу после
            нажатия кнопки ниже.
          </p>

          {error ? (
            <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleConfirmOrder}
            disabled={isSubmitting || isPending}
            className="mt-6 w-full rounded-full bg-stone-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-wait disabled:bg-stone-400"
          >
            {isSubmitting || isPending ? "Подтверждаем…" : "Confirm order"}
          </button>
        </aside>
      </div>
    </PageShell>
  );
}
