"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { FloatingCartLink } from "@/components/customer/floating-cart-link";
import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { ProductGridCard } from "@/components/customer/product-grid-card";
import { ProductSheet } from "@/components/customer/product-sheet";
import { getCartSummary } from "@/lib/cart";
import {
  getCartOwnerKey,
  selectCartByOwner,
  useCustomerCartStore,
} from "@/lib/cart-store";
import {
  buildMenuCategoryEntries,
  getMenuCategoryHref,
} from "@/lib/menu-catalog";
import { formatOrderNumber } from "@/lib/format";
import { statusLabels } from "@/lib/labels";
import { cn } from "@/lib/cn";
import type {
  MenuProductSummary,
  ProductSummary,
  PublicQueueSummary,
  UserOrderSummary,
  ViewerSummary,
} from "@/lib/types";

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 text-stone-400"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.7"
    >
      <circle cx="10.75" cy="10.75" r="6.75" />
      <path d="M15.75 15.75 20.5 20.5" />
    </svg>
  );
}

type MenuClientProps = {
  products: MenuProductSummary[];
  purchasedProducts: MenuProductSummary[];
  trackableOrders: UserOrderSummary[];
  viewer: ViewerSummary | null;
  initialQueueSummary: PublicQueueSummary;
  queueHeadline: string;
};

function getOrderStatusTone(status: UserOrderSummary["status"]) {
  switch (status) {
    case "READY":
      return {
        dotClassName: "bg-[#6f9a61]",
        textClassName: "text-[#456f42]",
        chipClassName: "bg-[#e4f1df] text-[#456f42]",
      };
    case "PREPARING":
      return {
        dotClassName: "bg-[#8fa878]",
        textClassName: "text-[#5f754f]",
        chipClassName: "bg-[#e7efdd] text-[#5f754f]",
      };
    case "WAITING":
      return {
        dotClassName: "bg-[#c9a378]",
        textClassName: "text-[#8a613a]",
        chipClassName: "bg-[#f4e5d2] text-[#8a613a]",
      };
    case "CANCELLED":
      return {
        dotClassName: "bg-stone-400",
        textClassName: "text-stone-500",
        chipClassName: "bg-stone-200 text-stone-600",
      };
    default:
      return {
        dotClassName: "bg-stone-400",
        textClassName: "text-stone-500",
        chipClassName: "bg-[#f8f2ec] text-stone-600",
      };
  }
}

function getActiveOrdersLabel(count: number) {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${count} активных`;
  }

  if (lastDigit === 1) {
    return `${count} активный`;
  }

  return `${count} активных`;
}

function getOrderPriority(order: UserOrderSummary) {
  if (order.status === "READY") {
    return 0;
  }

  if (order.status === "PREPARING") {
    return 1;
  }

  return 2;
}

function ActiveOrderTracker({
  orders,
}: {
  orders: UserOrderSummary[];
}) {
  if (orders.length === 0) {
    return null;
  }

  const sortedOrders = [...orders].sort((first, second) => {
    const priorityDiff = getOrderPriority(first) - getOrderPriority(second);

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    const queueDiff = first.ordersAhead - second.ordersAhead;

    if (queueDiff !== 0) {
      return queueDiff;
    }

    return (
      new Date(second.confirmedAt).getTime() - new Date(first.confirmedAt).getTime()
    );
  });
  const [primaryOrder, ...otherOrders] = sortedOrders;
  const statusTone = getOrderStatusTone(primaryOrder.status);
  const hasMultipleOrders = otherOrders.length > 0;
  const href = hasMultipleOrders ? "/orders/current" : `/order/${primaryOrder.id}`;

  return (
    <section className="mb-3 px-1">
      <Link
        href={href}
        className="group flex min-h-[70px] items-center gap-4 rounded-full bg-[rgba(255,255,255,0.58)] px-5 py-3 text-stone-950 no-underline shadow-[0_14px_30px_rgba(31,23,18,0.065)] backdrop-blur-[22px] transition active:scale-[0.99]"
      >
        <span className="shrink-0 text-[23px] font-semibold leading-none tracking-tight text-stone-950">
          {formatOrderNumber(primaryOrder.publicOrderNumber)}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={cn("h-2 w-2 shrink-0 rounded-full", statusTone.dotClassName)}
            />
            <span
              className={cn(
                "truncate text-[17px] font-medium leading-none tracking-tight",
                statusTone.textClassName,
              )}
            >
              {statusLabels[primaryOrder.status]}
            </span>
          </span>
        </span>

        <span
          className={cn(
            "inline-flex shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium leading-none",
            hasMultipleOrders ? "bg-[#f5eee8] text-stone-700" : statusTone.chipClassName,
          )}
        >
          {hasMultipleOrders ? getActiveOrdersLabel(sortedOrders.length) : "Открыть"}
        </span>

        <span className="shrink-0 text-[26px] font-light leading-none text-stone-400 transition group-active:translate-x-0.5">
          ›
        </span>
      </Link>
    </section>
  );
}

export function MenuClient({
  products,
  purchasedProducts,
  trackableOrders,
  viewer,
  initialQueueSummary,
  queueHeadline,
}: MenuClientProps) {
  const ownerKey = getCartOwnerKey(viewer?.id);
  const addProduct = useCustomerCartStore((state) => state.addProduct);
  const items = useCustomerCartStore(selectCartByOwner(ownerKey));
  const hasHydrated = useCustomerCartStore((state) => state.hasHydrated);
  const [isMounted, setIsMounted] = useState(false);
  const [activeProduct, setActiveProduct] = useState<MenuProductSummary | null>(null);
  const categoryEntries = useMemo(() => buildMenuCategoryEntries(products), [products]);

  useEffect(() => {
    if (hasHydrated) {
      setIsMounted(true);
    }
  }, [hasHydrated]);

  const cartSummary = getCartSummary(items);

  function handleAddProduct(variant: ProductSummary, quantity: number) {
    for (let index = 0; index < quantity; index += 1) {
      addProduct(ownerKey, variant);
    }
  }

  return (
    <CustomerMobileShell
      viewer={viewer}
      queueSummary={initialQueueSummary}
      queueHeadline={queueHeadline}
      queueClassName="mt-0 pb-7 pt-1"
      contentClassName="mt-0"
      className="pb-28 pt-0"
      header={<ActiveOrderTracker orders={trackableOrders} />}
    >
      {purchasedProducts.length > 0 ? (
        <section className="mb-14">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-[28px] font-medium leading-none tracking-tight text-stone-950">
              Вы покупали
            </h2>

            <Link
              href="/menu/purchased"
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[rgba(255,255,255,0.72)] px-4 text-sm font-semibold text-stone-800 shadow-[0_12px_26px_rgba(31,23,18,0.08)] backdrop-blur-[22px] transition active:scale-[0.97]"
            >
              Все
              <span className="text-[22px] font-light leading-none">›</span>
            </Link>
          </div>

          <div className="-mx-4 overflow-x-auto px-4 pb-1">
            <div className="flex items-stretch gap-3">
              {purchasedProducts.map((product) => (
                <ProductGridCard
                  key={product.id}
                  product={product}
                  onOpen={setActiveProduct}
                  stableLayout
                  compact
                  className="w-[146px] shrink-0"
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section id="quick-search" className="mb-5 scroll-mt-[112px]">
        <Link
          href="/menu/search"
          className="flex min-h-[62px] items-center gap-4 rounded-[22px] border border-white/70 bg-[rgba(255,255,255,0.72)] px-5 text-[19px] font-medium tracking-tight text-stone-500 shadow-[0_16px_34px_rgba(31,23,18,0.08)] backdrop-blur-[22px] transition active:scale-[0.99]"
          aria-label="Открыть быстрый поиск"
        >
          <SearchIcon />
          <span>Быстрый поиск</span>
        </Link>
      </section>

      <section id="categories" className="grid grid-cols-2 gap-3">
        {categoryEntries.map((entry) => (
          <Link
            key={entry.category}
            href={getMenuCategoryHref(entry.category)}
            className="group relative min-h-[176px] overflow-hidden rounded-[24px] bg-[#f3f2ee] shadow-[inset_0_1px_0_rgba(255,255,255,0.88)]"
          >
            <Image
              src={entry.definition.imageSrc}
              alt={entry.definition.imageAlt}
              fill
              sizes="(max-width: 430px) 50vw, 210px"
              className="pointer-events-none object-cover transition duration-300 group-active:scale-[1.01]"
              style={{ objectPosition: entry.definition.imagePosition }}
            />

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0)_100%)]" />

            <div className="relative z-10 h-full p-4">
              <p className="max-w-[136px] text-[17px] font-medium leading-[1.14] tracking-tight text-stone-950">
                {entry.definition.label}
              </p>
            </div>
          </Link>
        ))}
      </section>

      {isMounted && cartSummary.itemsCount > 0 ? (
        <FloatingCartLink
          itemsCount={cartSummary.itemsCount}
          totalPrice={cartSummary.totalPrice}
        />
      ) : null}

      {activeProduct ? (
        <ProductSheet
          product={activeProduct}
          onClose={() => setActiveProduct(null)}
          onAdd={handleAddProduct}
        />
      ) : null}
    </CustomerMobileShell>
  );
}
