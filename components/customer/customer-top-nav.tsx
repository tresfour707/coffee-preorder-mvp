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

type CustomerTopNavProps = {
  viewer: ViewerSummary | null;
};

type NavItem = {
  href: string;
  label: string;
  active: boolean;
  badge?: number | null;
};

export function CustomerTopNav({ viewer }: CustomerTopNavProps) {
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
      active: pathname === "/cart" || pathname === "/checkout" || pathname.startsWith("/checkout/"),
      badge: hasHydrated && cartSummary.itemsCount > 0 ? cartSummary.itemsCount : null,
    },
    {
      href: viewer ? "/orders" : "/sign-in?next=/orders",
      label: "Заказы",
      active: pathname === "/orders" || pathname.startsWith("/order/"),
    },
  ];

  return (
    <nav
      aria-label="Навигация клиента"
      className="surface overflow-x-auto px-2 py-2 shadow-sm"
    >
      <div className="flex min-w-max items-center gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition",
              item.active
                ? "bg-stone-900 text-white"
                : "bg-white text-stone-700 hover:bg-stone-50",
            )}
          >
            <span>{item.label}</span>
            {item.badge ? (
              <span
                className={cn(
                  "inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold",
                  item.active
                    ? "bg-white/20 text-white"
                    : "bg-brand-100 text-brand-800",
                )}
              >
                {item.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </nav>
  );
}
