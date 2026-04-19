"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { PageShell } from "@/components/ui/page-shell";
import { getCartSummary } from "@/lib/cart";
import { useCustomerCartStore } from "@/lib/cart-store";
import { groupProductsByCategory } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import type { ProductSummary } from "@/lib/types";

type MenuClientProps = {
  products: ProductSummary[];
};

export function MenuClient({ products }: MenuClientProps) {
  const addProduct = useCustomerCartStore((state) => state.addProduct);
  const items = useCustomerCartStore((state) => state.items);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const categories = useMemo(
    () => Object.entries(groupProductsByCategory(products)),
    [products],
  );
  const cartSummary = getCartSummary(items);

  return (
    <PageShell
      eyebrow="Гость"
      title="Coffee pre-order"
      description="Выберите напитки и закуски, подтвердите заказ и отслеживайте его место в общей очереди вместе с офлайн-заказами на кассе."
      actions={
        <Link
          href="/cart"
          className="inline-flex rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          Открыть корзину
        </Link>
      }
    >
      <div className="grid gap-8">
        {categories.map(([category, categoryProducts]) => (
          <section key={category}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="label-muted">{category}</p>
                <h2 className="mt-1 text-2xl font-semibold text-stone-900">
                  {category}
                </h2>
              </div>
              <p className="hidden text-sm text-stone-500 md:block">
                Нажмите на товар, чтобы сразу добавить его в корзину.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {categoryProducts.map((product) => (
                <article
                  key={product.id}
                  className="surface flex min-h-56 flex-col p-5 transition hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-stone-900">
                        {product.name}
                      </h3>
                      {product.description ? (
                        <p className="mt-2 text-sm leading-6 text-stone-600">
                          {product.description}
                        </p>
                      ) : null}
                    </div>
                    {!product.available ? (
                      <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
                        Нет
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-auto flex items-end justify-between gap-3 pt-8">
                    <div>
                      <p className="label-muted">Цена</p>
                      <p className="mt-1 text-2xl font-semibold text-stone-900">
                        {formatMoney(product.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={!product.available}
                      onClick={() => addProduct(product)}
                      className="rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
                    >
                      Добавить
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      {isMounted && cartSummary.itemsCount > 0 ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 px-4">
          <div className="mx-auto flex max-w-xl items-center justify-between rounded-full bg-stone-900 px-5 py-4 text-white shadow-2xl pointer-events-auto">
            <div>
              <p className="text-sm text-stone-300">
                {cartSummary.itemsCount} позиций в корзине
              </p>
              <p className="text-lg font-semibold">
                {formatMoney(cartSummary.totalPrice)}
              </p>
            </div>
            <Link
              href="/cart"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-900"
            >
              Перейти
            </Link>
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
