"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AuthActions } from "@/components/auth/auth-actions";
import { PageShell } from "@/components/ui/page-shell";
import { getCartSummary } from "@/lib/cart";
import {
  getCartOwnerKey,
  selectCartByOwner,
  useCustomerCartStore,
} from "@/lib/cart-store";
import { groupProductsByCategory } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import type { ProductSummary, ViewerSummary } from "@/lib/types";

type MenuClientProps = {
  products: ProductSummary[];
  viewer: ViewerSummary | null;
};

export function MenuClient({ products, viewer }: MenuClientProps) {
  const ownerKey = getCartOwnerKey(viewer?.id);
  const addProduct = useCustomerCartStore((state) => state.addProduct);
  const items = useCustomerCartStore(selectCartByOwner(ownerKey));
  const hasHydrated = useCustomerCartStore((state) => state.hasHydrated);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (hasHydrated) {
      setIsMounted(true);
    }
  }, [hasHydrated]);

  const categories = useMemo(
    () => Object.entries(groupProductsByCategory(products)),
    [products],
  );
  const cartSummary = getCartSummary(items);

  return (
    <PageShell
      className={isMounted && cartSummary.itemsCount > 0 ? "pb-28 md:pb-32" : undefined}
      eyebrow={viewer ? "Клиент" : "Гость"}
      title="Предзаказ кофе"
      description="Клиент собирает заказ в телефоне, проходит демо-оплату и только после успешного результата попадает в ту же очередь, что и очные заказы."
      actions={
        <>
          <Link
            href="/cart"
            className="inline-flex rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Открыть корзину
          </Link>
          <AuthActions viewer={viewer} />
        </>
      }
    >
      <div className="grid gap-8">
        {categories.map(([category, categoryProducts]) => (
          <section key={category}>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="label-muted">{category}</p>
                <h2 className="mt-1 text-xl font-semibold text-stone-900 md:text-2xl">
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
                  className="surface flex min-h-48 flex-col p-4 transition hover:-translate-y-0.5 md:min-h-56 md:p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-stone-900 md:text-xl">
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

                  <div className="mt-auto flex items-end justify-between gap-3 pt-6 md:pt-8">
                    <div>
                      <p className="label-muted">Цена</p>
                      <p className="mt-1 text-xl font-semibold text-stone-900 md:text-2xl">
                        {formatMoney(product.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={!product.available}
                      onClick={() => addProduct(ownerKey, product)}
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
          <div className="pointer-events-auto mx-auto flex max-w-xl items-center justify-between rounded-[1.75rem] bg-stone-900 px-4 py-3 text-white shadow-2xl md:rounded-full md:px-5 md:py-4">
            <div>
              <p className="text-sm text-stone-300">
                {cartSummary.itemsCount} позиций в корзине
              </p>
              <p className="text-base font-semibold md:text-lg">
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
