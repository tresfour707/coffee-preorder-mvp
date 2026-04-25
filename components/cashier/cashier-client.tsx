"use client";

import { useMemo, useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { QuantityControl } from "@/components/ui/quantity-control";
import { StatusBadge } from "@/components/ui/status-badge";
import { StaffSignOutButton } from "@/components/staff/staff-sign-out-button";
import {
  addProductToCart,
  decrementCartItem,
  getCartSummary,
  removeCartItem,
  toOrderRequestItems,
} from "@/lib/cart";
import { STAFF_POLL_INTERVAL_MS } from "@/lib/constants";
import { formatOrderNumber, groupProductsByCategory } from "@/lib/format";
import { sourceLabels } from "@/lib/labels";
import { formatMoney } from "@/lib/money";
import { usePolling } from "@/lib/use-polling";
import type { CartLine, OrderDetails, ProductSummary, QueueSnapshot } from "@/lib/types";

type CashierClientProps = {
  products: ProductSummary[];
  initialQueue: QueueSnapshot;
};

export function CashierClient({ products, initialQueue }: CashierClientProps) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [queue, setQueue] = useState(initialQueue);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<OrderDetails | null>(null);

  const groupedProducts = useMemo(
    () => Object.entries(groupProductsByCategory(products)),
    [products],
  );
  const summary = getCartSummary(cart);

  async function refreshQueue() {
    try {
      const response = await fetch("/api/queue", { cache: "no-store" });
      const data = (await response.json()) as QueueSnapshot | { error?: string };

      if (!response.ok || !("activeOrders" in data)) {
        throw new Error(
          "error" in data && data.error ? data.error : "Не удалось обновить очередь.",
        );
      }

      setQueue(data);
    } catch {
      // Не прерываем работу cashier demo из-за временного сбоя polling.
    }
  }

  usePolling(refreshQueue, STAFF_POLL_INTERVAL_MS);

  async function handleConfirmOfflineOrder() {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/orders/offline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: toOrderRequestItems(cart),
        }),
      });

      const data = (await response.json()) as OrderDetails | { error?: string };

      if (!response.ok || !("id" in data)) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Не удалось добавить очный заказ в общую очередь.",
        );
      }

      setCart([]);
      setLastCreatedOrder(data);
      await refreshQueue();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось добавить очный заказ в общую очередь.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancelOfflineOrder(orderId: string) {
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ actor: "STAFF" }),
      });

      const data = (await response.json()) as OrderDetails | { error?: string };

      if (!response.ok || !("id" in data)) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Не удалось отменить офлайн-заказ.",
        );
      }

      await refreshQueue();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось отменить офлайн-заказ.",
      );
    }
  }

  return (
    <PageShell
      eyebrow="Cashier demo"
      title="Очный заказ"
      description="Это не POS и не реальная касса кофейни. Экран показывает demo-сценарий: уже принятый офлайн-заказ тоже попадает в ту же производственную очередь."
      actions={
        <StaffSignOutButton className="btn-secondary disabled:cursor-wait disabled:opacity-60" />
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
        <section className="space-y-8">
          {groupedProducts.map(([category, categoryProducts]) => (
            <section key={category}>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="kicker">{category}</p>
                  <h2 className="mt-2 section-title">{category}</h2>
                </div>
                <p className="text-sm text-stone-500">{categoryProducts.length} позиций</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categoryProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    disabled={!product.available}
                    onClick={() =>
                      setCart((currentCart) => addProductToCart(currentCart, product))
                    }
                    className="surface min-h-[170px] p-5 text-left transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="flex h-full flex-col justify-between">
                      <div>
                        {product.category ? (
                          <p className="label-muted">{product.category}</p>
                        ) : null}
                        <p className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
                          {product.displayName}
                        </p>
                        {product.description ? (
                          <p className="mt-2 text-sm leading-6 text-stone-600">
                            {product.description}
                          </p>
                        ) : null}
                      </div>
                      <p className="mt-4 text-lg font-semibold text-brand-700">
                        {formatMoney(product.price)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </section>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:h-fit">
          <section className="surface p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="kicker">Текущая корзина</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
                  Очный заказ
                </h2>
              </div>
              <p className="text-xl font-semibold text-stone-950">
                {formatMoney(summary.totalPrice)}
              </p>
            </div>

            {cart.length === 0 ? (
              <p className="mt-6 rounded-[24px] bg-stone-50 p-4 text-sm leading-6 text-stone-600">
                Корзина пуста. Выберите позиции слева, чтобы сымитировать уже принятый
                заказ со стойки.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {cart.map((item) => (
                  <div key={item.productId} className="rounded-[24px] bg-stone-50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-stone-900">{item.name}</p>
                        <p className="mt-1 text-sm text-stone-500">
                          {formatMoney(item.price)} за единицу
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setCart((currentCart) =>
                            removeCartItem(currentCart, item.productId),
                          )
                        }
                        className="text-sm font-semibold text-stone-500 transition hover:text-stone-900"
                      >
                        Удалить
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <QuantityControl
                        quantity={item.quantity}
                        onIncrement={() =>
                          setCart((currentCart) =>
                            addProductToCart(currentCart, {
                              id: item.productId,
                              name: item.name,
                              displayName: item.name,
                              description: item.description,
                              kind: "FOOD",
                              category: item.category,
                              groupKey: item.productId,
                              sizeLabel: item.sizeLabel,
                              sizeSort: null,
                              price: item.price,
                              available: true,
                            }),
                          )
                        }
                        onDecrement={() =>
                          setCart((currentCart) =>
                            decrementCartItem(currentCart, item.productId),
                          )
                        }
                      />
                      <p className="text-lg font-semibold text-stone-900">
                        {formatMoney(item.quantity * item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error ? (
              <p className="mt-4 rounded-[24px] bg-red-50 p-4 text-sm leading-6 text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              onClick={handleConfirmOfflineOrder}
              disabled={cart.length === 0 || isSubmitting}
              className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              {isSubmitting ? "Добавляем…" : "Добавить очный заказ в очередь"}
            </button>

            {lastCreatedOrder ? (
              <div className="mt-4 rounded-[24px] bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
                Очный заказ {formatOrderNumber(lastCreatedOrder.publicOrderNumber)} добавлен
                в общую очередь.
              </div>
            ) : null}
          </section>

          <section className="surface p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="kicker">Активная очередь</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
                  Что сейчас в работе
                </h2>
              </div>
              <p className="text-sm text-stone-500">{queue.activeOrders.length} активных</p>
            </div>

            {queue.activeOrders.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  title="Очередь пока пуста"
                  description="Новых подтвержденных заказов сейчас нет."
                />
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {queue.activeOrders.map((order, index) => (
                  <article
                    key={order.id}
                    className={`rounded-[24px] border p-4 ${
                      index === 0
                        ? "border-brand-200 bg-brand-50"
                        : "border-stone-200 bg-stone-50"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold tracking-tight text-stone-900">
                          {formatOrderNumber(order.publicOrderNumber)}
                        </p>
                        <p className="mt-1 text-sm text-stone-500">
                          {sourceLabels[order.source]} · {order.items.length} поз.
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {order.items.map((item) => (
                        <span
                          key={item.id}
                          className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700"
                        >
                          {item.quantity} × {item.productName}
                        </span>
                      ))}
                    </div>

                    {order.source === "OFFLINE" ? (
                      <button
                        type="button"
                        onClick={() => handleCancelOfflineOrder(order.id)}
                        className="mt-4 text-sm font-semibold text-stone-600 transition hover:text-stone-900"
                      >
                        Отменить офлайн-заказ
                      </button>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </PageShell>
  );
}
