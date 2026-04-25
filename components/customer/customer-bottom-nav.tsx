"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getCartSummary } from "@/lib/cart";
import {
  getCartOwnerKey,
  selectCartByOwner,
  useCustomerCartStore,
} from "@/lib/cart-store";
import { cn } from "@/lib/cn";
import type { ViewerSummary } from "@/lib/types";

type CustomerBottomNavProps = {
  viewer: ViewerSummary | null;
};

type NavItem = {
  href: string;
  label: string;
  active: boolean;
  badge?: number | null;
};

export function CustomerBottomNav({ viewer }: CustomerBottomNavProps) {
  const pathname = usePathname();
  const ownerKey = getCartOwnerKey(viewer?.id);
  const hasHydrated = useCustomerCartStore((state) => state.hasHydrated);
  const cartItems = useCustomerCartStore(selectCartByOwner(ownerKey));
  const cartSummary = getCartSummary(cartItems);

  const items: NavItem[] = [
    {
      href: "/menu",
      label: "Меню",
      active: pathname === "/menu",
    },
    {
      href: "/cart",
      label: "Корзина",
      active:
        pathname === "/cart" ||
        pathname === "/checkout" ||
        pathname.startsWith("/checkout/"),
      badge: hasHydrated && cartSummary.itemsCount > 0 ? cartSummary.itemsCount : null,
    },
    {
      href: viewer ? "/orders" : "/sign-in?next=/orders",
      label: "Заказы",
      active: pathname === "/orders" || pathname.startsWith("/order/"),
    },
  ];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4">
      <nav
        aria-label="Навигация клиента"
        className="floating-bar pointer-events-auto mx-auto grid w-full max-w-[398px] grid-cols-3 gap-1 p-1.5"
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "relative flex min-h-14 items-center justify-center rounded-[24px] px-3 text-sm font-semibold transition",
              item.active
                ? "bg-stone-950 text-white"
                : "bg-transparent text-stone-600 hover:bg-stone-50",
            )}
          >
            <span>{item.label}</span>
            {item.badge ? (
              <span
                className={cn(
                  "absolute right-3 top-2 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  item.active
                    ? "bg-white/20 text-white"
                    : "bg-brand-500 text-white",
                )}
              >
                {item.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>
    </div>
  );
}
