"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { EmptyState } from "@/components/ui/empty-state";
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
  queueHeadline: string;
};

function CartEmoji({ category }: { category: string | null }) {
  if (category === "Напитки") {
    return "☕";
  }

  if (category === "Завтрак") {
    return "🥐";
  }

  if (category === "Холодные закуски") {
    return "🥪";
  }

  if (category === "Вторые блюда") {
    return "🍳";
  }

  return "🍰";
}

export function CartClient({
  viewer,
  initialQueueSummary,
  queueHeadline,
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

  const header = (
    <section className="customer-soft-card px-5 py-5">
      <p className="kicker text-stone-400">Корзина</p>
      <h1 className="mt-3 text-[36px] font-semibold leading-[0.94] tracking-tight text-stone-950">
        Проверьте заказ
      </h1>
      <p className="mt-3 text-sm leading-6 text-stone-600">
        Здесь можно быстро изменить количество, удалить позицию и перейти к
        оформлению.
      </p>
    </section>
  );

  if (!isMounted) {
    return (
      <CustomerMobileShell
        viewer={viewer}
        queueSummary={initialQueueSummary}
        queueHeadline={queueHeadline}
        className="pb-28"
        header={header}
      >
        <div className="customer-soft-card px-5 py-6 text-sm text-stone-600">
          Загружаем корзину…
        </div>
      </CustomerMobileShell>
    );
  }

  if (items.length === 0) {
    return (
      <CustomerMobileShell
        viewer={viewer}
        queueSummary={initialQueueSummary}
        queueHeadline={queueHeadline}
        className="pb-28"
        header={header}
      >
        <EmptyState
          title="Пока пусто"
          description="Вернитесь в меню, откройте нужную позицию и добавьте её через карточку товара."
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
      queueHeadline={queueHeadline}
      className="pb-32"
      header={header}
    >
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.productId} className="customer-soft-card-strong px-4 py-4">
            <div className="flex items-start gap-4">
              <div className="flex h-[84px] w-[84px] shrink-0 items-center justify-center rounded-[26px] bg-[#f7e6d9] text-[34px]">
                <span role="img" aria-hidden="true">
                  <CartEmoji category={item.category} />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                {item.category ? (
                  <p className="text-xs uppercase tracking-[0.16em] text-stone-400">
                    {item.category}
                  </p>
                ) : null}
                <h2 className="mt-2 text-[24px] font-semibold leading-[0.96] tracking-tight text-stone-950">
                  {item.name}
                </h2>
                {item.sizeLabel ? (
                  <p className="mt-2 text-sm text-stone-500">{item.sizeLabel}</p>
                ) : null}
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-stone-500">
                      {formatMoney(item.price)} за единицу
                    </p>
                    <p className="mt-1 text-lg font-semibold tracking-tight text-stone-950">
                      {formatMoney(item.price * item.quantity)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeProduct(ownerKey, item.productId)}
                    className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-[24px] bg-[#fbf5ef] px-4 py-3">
              <p className="text-sm font-medium text-stone-500">Количество</p>
              <QuantityControl
                quantity={item.quantity}
                onIncrement={() =>
                  addProduct(ownerKey, {
                    id: item.productId,
                    name: item.name,
                    displayName: item.name,
                    description: item.description,
                    price: item.price,
                    kind: item.category === "Напитки" ? "DRINK" : "FOOD",
                    category: item.category,
                    groupKey: item.productId,
                    sizeLabel: item.sizeLabel,
                    sizeSort: null,
                    available: true,
                  })
                }
                onDecrement={() => decrementProduct(ownerKey, item.productId)}
              />
            </div>
          </article>
        ))}
      </div>

      <section className="mt-5 customer-soft-card px-5 py-5">
        <p className="kicker text-stone-400">Что дальше</p>
        <div className="mt-4 space-y-3">
          <div className="rounded-[24px] bg-white px-4 py-3 text-sm leading-6 text-stone-600 shadow-sm">
            1. Подтверждаете состав и выбираете demo-оплату.
          </div>
          <div className="rounded-[24px] bg-white px-4 py-3 text-sm leading-6 text-stone-600 shadow-sm">
            2. После `Success` заказ получает номер и попадает в общую очередь.
          </div>
        </div>
      </section>

      <div className="customer-action-bar">
        <div className="customer-action-bar-inner flex items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-sm text-stone-500">{summary.itemsCount} позиций</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-stone-950">
              {formatMoney(summary.totalPrice)}
            </p>
          </div>
          <Link
            href="/checkout"
            className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white"
          >
            К оформлению
          </Link>
        </div>
      </div>
    </CustomerMobileShell>
  );
}
