"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { getCartSummary } from "@/lib/cart";
import {
  getCartOwnerKey,
  selectCartByOwner,
  useCustomerCartStore,
} from "@/lib/cart-store";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/money";
import { getProductMedia } from "@/lib/product-media";
import type { CartLine, ProductSummary, PublicQueueSummary, ViewerSummary } from "@/lib/types";

type CartClientProps = {
  viewer: ViewerSummary | null;
  initialQueueSummary: PublicQueueSummary;
  queueHeadline: string;
};

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[21px] w-[21px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
    >
      <path d="M4 7h16" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="m10 11 .35 6" />
      <path d="m14 11-.35 6" />
      <path d="M6.8 7.5 7.6 20h8.8l.8-12.5" />
    </svg>
  );
}

function getCartDisplayName(item: CartLine) {
  if (!item.sizeLabel) {
    return item.name;
  }

  const suffix = ` ${item.sizeLabel}`;

  return item.name.endsWith(suffix) ? item.name.slice(0, -suffix.length) : item.name;
}

function getCartLineProduct(item: CartLine): ProductSummary {
  return {
    id: item.productId,
    name: getCartDisplayName(item),
    displayName: item.name,
    description: item.description,
    price: item.price,
    available: true,
    kind: item.category === "Напитки" ? "DRINK" : "FOOD",
    category: item.category,
    groupKey: item.productId,
    sizeLabel: item.sizeLabel,
    sizeSort: null,
  };
}

function CartItemImage({ item }: { item: CartLine }) {
  const media = getProductMedia(getCartDisplayName(item));

  return (
    <div className="relative h-[78px] w-[78px] shrink-0 overflow-hidden rounded-[21px] bg-[#f5f2ed]">
      {media ? (
        <Image
          src={media.src}
          alt={media.alt}
          fill
          sizes="78px"
          className="object-cover"
          style={{ objectPosition: media.objectPosition ?? "center center" }}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.9),transparent_36%),linear-gradient(180deg,#f5eee6,#eee2d7)]" />
      )}
    </div>
  );
}

function CartStepper({
  quantity,
  onIncrement,
  onDecrement,
  disabled,
}: {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex h-9 w-[108px] shrink-0 items-center justify-between rounded-[16px] bg-[#efe9e2] px-3 text-stone-950">
      <button
        type="button"
        onClick={onDecrement}
        disabled={disabled}
        className="flex h-7 w-7 items-center justify-center transition active:scale-90 disabled:opacity-40"
      >
        <span className="h-[2.5px] w-[15px] rounded-full bg-stone-800" />
      </button>
      <span className="min-w-5 text-center text-[16px] font-medium leading-none text-stone-800">
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={disabled}
        className="relative flex h-7 w-7 items-center justify-center transition active:scale-90 disabled:opacity-40"
      >
        <span className="absolute h-[2.5px] w-[15px] rounded-full bg-stone-800" />
        <span className="absolute h-[15px] w-[2.5px] rounded-full bg-stone-800" />
      </button>
    </div>
  );
}

function getPositionsLabel(count: number) {
  const lastTwo = count % 100;
  const last = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return `${count} позиций`;
  }

  if (last === 1) {
    return `${count} позиция`;
  }

  if (last >= 2 && last <= 4) {
    return `${count} позиции`;
  }

  return `${count} позиций`;
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
  const clearCart = useCustomerCartStore((state) => state.clear);
  const [isMounted, setIsMounted] = useState(false);
  const [showClearAction, setShowClearAction] = useState(false);
  const [removingIds, setRemovingIds] = useState<Set<string>>(() => new Set());
  const summary = getCartSummary(items);

  useEffect(() => {
    if (hasHydrated) {
      setIsMounted(true);
    }
  }, [hasHydrated]);

  useEffect(() => {
    if (items.length === 0) {
      setShowClearAction(false);
    }
  }, [items.length]);

  const header = useMemo(
    () => (
      <section className="relative flex min-h-12 items-center justify-center">
        <h1 className="text-[30px] font-medium leading-none tracking-tight text-stone-950">
          Корзина
        </h1>

        {isMounted && items.length > 0 ? (
          <button
            type="button"
            onClick={() => setShowClearAction((current) => !current)}
            aria-label="Показать очистку корзины"
            className="absolute right-1 flex h-10 w-10 items-center justify-center rounded-full text-stone-600 transition active:scale-[0.94]"
          >
            <TrashIcon />
          </button>
        ) : null}
      </section>
    ),
    [isMounted, items.length],
  );

  function handleDecrement(item: CartLine) {
    if (item.quantity > 1) {
      decrementProduct(ownerKey, item.productId);
      return;
    }

    setRemovingIds((current) => new Set(current).add(item.productId));
    window.setTimeout(() => {
      decrementProduct(ownerKey, item.productId);
      setRemovingIds((current) => {
        const next = new Set(current);
        next.delete(item.productId);

        return next;
      });
    }, 180);
  }

  if (!isMounted) {
    return (
      <CustomerMobileShell
        viewer={viewer}
        queueSummary={initialQueueSummary}
        queueHeadline={queueHeadline}
        queueClassName="mt-2 pb-5 pt-1"
        contentClassName="mt-0"
        className="pb-28 pt-0"
        header={header}
      >
        <div className="customer-soft-card px-5 py-6 text-sm text-stone-600">
          Загружаем корзину...
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
        queueClassName="mt-2 pb-5 pt-1"
        contentClassName="mt-0"
        className="pb-28 pt-0"
        header={header}
      >
        <EmptyState
          title="Пока пусто"
          description="Добавьте позицию из меню, и она появится здесь."
          action={
            <Link href="/menu#quick-search" className="btn-primary">
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
      queueClassName="mt-2 pb-5 pt-1"
      contentClassName="mt-0"
      className="pb-36 pt-0"
      header={header}
    >
      <section className="overflow-hidden rounded-[28px] bg-[rgba(255,255,255,0.76)] px-3 py-1 shadow-[0_16px_34px_rgba(31,23,18,0.08)] backdrop-blur-[22px]">
        {items.map((item, index) => {
          const isRemoving = removingIds.has(item.productId);
          const product = getCartLineProduct(item);

          return (
            <article
              key={item.productId}
              className={cn(
                "overflow-hidden transition-all duration-200 ease-out",
                isRemoving
                  ? "max-h-0 -translate-y-2 opacity-0"
                  : "max-h-[112px] translate-y-0 opacity-100",
              )}
            >
              <div
                className={cn(
                  "grid grid-cols-[78px_minmax(0,1fr)_auto] items-center gap-3 py-3",
                  index > 0 ? "border-t border-stone-200/80" : "",
                )}
              >
                <CartItemImage item={item} />

                <div className="min-w-0">
                  <h2 className="line-clamp-2 text-[16px] font-medium leading-[1.14] tracking-tight text-stone-950">
                    {getCartDisplayName(item)}
                  </h2>
                  <p className="mt-2 text-[14px] font-semibold leading-none text-stone-950">
                    {formatMoney(item.price)}
                    {item.sizeLabel ? (
                      <span className="font-normal text-stone-400"> · {item.sizeLabel}</span>
                    ) : null}
                  </p>
                </div>

                <CartStepper
                  quantity={item.quantity}
                  disabled={isRemoving}
                  onIncrement={() => addProduct(ownerKey, product)}
                  onDecrement={() => handleDecrement(item)}
                />
              </div>
            </article>
          );
        })}
      </section>

      <Link
        href="/menu#quick-search"
        className="mt-5 flex min-h-12 items-center justify-center rounded-full border border-white/70 bg-[rgba(255,255,255,0.68)] px-5 text-[16px] font-semibold tracking-tight text-stone-800 shadow-[0_14px_28px_rgba(31,23,18,0.07)] backdrop-blur-[22px] transition active:scale-[0.98]"
      >
        Вернуться в меню
      </Link>

      {showClearAction ? (
        <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.65rem)] z-40 px-4">
          <div className="mx-auto w-full max-w-[398px]">
            <button
              type="button"
              onClick={() => {
                clearCart(ownerKey);
                setShowClearAction(false);
              }}
              className="w-full rounded-full bg-[#b74236] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(183,66,54,0.24)] transition active:scale-[0.97]"
            >
              Очистить корзину
            </button>
          </div>
        </div>
      ) : null}

      <div className="customer-action-bar">
        <div
          key={`${summary.itemsCount}-${summary.totalPrice}`}
          className="customer-action-bar-inner flex animate-[cartBarRefresh_160ms_ease-out] items-center justify-between gap-4 px-4 py-3 transition-all duration-200"
        >
          <div>
            <p className="text-sm text-stone-500">{getPositionsLabel(summary.itemsCount)}</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-stone-950">
              {formatMoney(summary.totalPrice)}
            </p>
          </div>
          <Link
            href="/checkout"
            className="rounded-full bg-[#3f2a1d] px-5 py-3 text-sm font-semibold text-white transition active:scale-[0.97]"
          >
            К оформлению
          </Link>
        </div>
      </div>
    </CustomerMobileShell>
  );
}
