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
};

function CartStamp({ label }: { label: string }) {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#f3d7b5] text-lg font-semibold tracking-tight text-stone-900">
      {label.slice(0, 2).toUpperCase()}
    </div>
  );
}

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
      <CustomerMobileShell
        viewer={viewer}
        queueSummary={initialQueueSummary}
        header={
          <div>
            <p className="kicker">Корзина</p>
            <h1 className="mt-2 text-[36px] font-semibold leading-[0.94] tracking-tight text-stone-950">
              Загружаем ваш заказ
            </h1>
          </div>
        }
      >
        <div className="app-card p-6 text-sm text-stone-600">Загрузка корзины…</div>
      </CustomerMobileShell>
    );
  }

  if (items.length === 0) {
    return (
      <CustomerMobileShell
        viewer={viewer}
        queueSummary={initialQueueSummary}
        header={
          <div>
            <p className="kicker">Корзина</p>
            <h1 className="mt-2 text-[36px] font-semibold leading-[0.94] tracking-tight text-stone-950">
              Пока пусто
            </h1>
            <p className="mt-3 max-w-[320px] text-sm leading-6 text-stone-600">
              Вернитесь в меню, откройте нужный товар и добавьте его через product
              sheet.
            </p>
          </div>
        }
      >
        <EmptyState
          title="Заказ ещё не собран"
          description="Как только в корзине появятся позиции, здесь можно будет удобно поменять количество и перейти к оформлению."
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
      header={
        <div>
          <p className="kicker">Корзина</p>
          <h1 className="mt-2 text-[36px] font-semibold leading-[0.94] tracking-tight text-stone-950">
            Проверьте заказ
          </h1>
          <p className="mt-3 max-w-[320px] text-sm leading-6 text-stone-600">
            Здесь удобно менять количество, удалять позиции и переходить к
            оформлению.
          </p>
        </div>
      }
    >
      <div className="space-y-4">
        {items.map((item) => (
          <article key={item.productId} className="app-card p-4">
            <div className="flex items-start gap-4">
              <CartStamp label={item.name} />

              <div className="min-w-0 flex-1">
                {item.category ? (
                  <p className="kicker">{item.category}</p>
                ) : null}
                <h2 className="mt-2 text-[24px] font-semibold leading-[0.98] tracking-tight text-stone-950">
                  {item.name}
                </h2>
                {item.description ? (
                  <p className="mt-2 text-sm leading-6 text-stone-500">
                    {item.description}
                  </p>
                ) : null}

                <div className="mt-4 flex items-center justify-between gap-4">
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
                    className="rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-stone-600"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[24px] bg-stone-50 p-3">
              <div className="flex items-center justify-between gap-3">
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
                      kind: "FOOD",
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
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5 app-soft-card p-4">
        <p className="kicker">Дальше по шагам</p>
        <div className="mt-4 grid gap-3">
          <div className="rounded-[24px] bg-white px-4 py-3 text-sm text-stone-600 shadow-sm">
            1. Подтверждаете заказ и выбираете demo-способ оплаты.
          </div>
          <div className="rounded-[24px] bg-white px-4 py-3 text-sm text-stone-600 shadow-sm">
            2. После `Success` заказ получает номер и попадает в общую очередь.
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 px-4">
        <div className="floating-bar pointer-events-auto mx-auto flex w-full max-w-[398px] items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-sm text-stone-500">{summary.itemsCount} позиций</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-stone-950">
              {formatMoney(summary.totalPrice)}
            </p>
          </div>
          <Link
            href="/checkout"
            className="rounded-full bg-stone-950 px-4 py-3 text-sm font-semibold text-white"
          >
            К оформлению
          </Link>
        </div>
      </div>
    </CustomerMobileShell>
  );
}
