"use client";

import Link from "next/link";

import { formatMoney } from "@/lib/money";

type FloatingCartLinkProps = {
  itemsCount: number;
  totalPrice: number;
  href?: string;
};

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className="h-8 w-8 text-stone-950"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
    >
      <path d="M6 8.5h2.6l2.2 10.4h10.8l3.3-8.1H11.7" />
      <circle cx="13" cy="24" r="1.7" fill="currentColor" stroke="none" />
      <circle cx="22" cy="24" r="1.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FloatingCartLink({
  itemsCount,
  totalPrice,
  href = "/cart",
}: FloatingCartLinkProps) {
  const badgeLabel = itemsCount > 99 ? "99+" : String(itemsCount);

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-4 z-30">
      <Link
        href={href}
        aria-label={`Открыть корзину: ${itemsCount} позиций на ${formatMoney(totalPrice)}`}
        className="group flex flex-col items-center gap-2"
      >
        <span className="relative flex h-[74px] w-[74px] items-center justify-center rounded-[26px] border border-white/80 bg-[rgba(255,255,255,0.86)] shadow-[0_18px_42px_rgba(31,23,18,0.18)] backdrop-blur-[26px] transition duration-200 group-active:scale-[0.96]">
          <span className="absolute -right-1 -top-1 inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-stone-950 px-1.5 text-[11px] font-bold leading-none tracking-tight text-white shadow-[0_10px_20px_rgba(31,23,18,0.22)]">
            {badgeLabel}
          </span>

          <CartIcon />
        </span>

        <span className="inline-flex min-h-9 items-center justify-center rounded-full border border-white/75 bg-[rgba(255,255,255,0.8)] px-4 text-[13px] font-semibold tracking-tight text-stone-950 shadow-[0_14px_28px_rgba(31,23,18,0.12)] backdrop-blur-[24px]">
          {formatMoney(totalPrice)}
        </span>
      </Link>
    </div>
  );
}
