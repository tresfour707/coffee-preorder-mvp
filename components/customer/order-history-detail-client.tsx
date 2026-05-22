"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { BackLink } from "@/components/customer/back-link";
import { CustomerMobileShell } from "@/components/customer/customer-mobile-shell";
import { BUSINESS_TIME_ZONE } from "@/lib/constants";
import {
  getCartOwnerKey,
  useCustomerCartStore,
} from "@/lib/cart-store";
import { formatOrderNumber } from "@/lib/format";
import { formatMoney } from "@/lib/money";
import { getProductMedia } from "@/lib/product-media";
import type {
  OrderDetails,
  OrderItemSummary,
  ProductSummary,
  ViewerSummary,
} from "@/lib/types";

type OrderHistoryDetailClientProps = {
  order: OrderDetails;
  viewer: ViewerSummary;
};

const detailDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  timeZone: BUSINESS_TIME_ZONE,
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDetailDate(date: string) {
  return detailDateFormatter.format(new Date(date));
}

function getHistoryStatusLabel(order: OrderDetails) {
  if (order.status === "READY") {
    return "Заказ завершён";
  }

  if (order.status === "CANCELLED") {
    return "Заказ отменён";
  }

  return "Заказ в процессе";
}

function getHistoryStatusTone(order: OrderDetails) {
  if (order.status === "READY") {
    return "bg-[#dfeada] text-[#456f42]";
  }

  if (order.status === "CANCELLED") {
    return "bg-[#ebe6e1] text-stone-500";
  }

  return "bg-[#f4e5d2] text-[#8a613a]";
}

function getProductMediaName(name: string) {
  return name
    .replace(/\s+\d+\s*мл$/i, "")
    .replace(/\s+\d+\s*г$/i, "")
    .trim();
}

function getProductSizeLabel(name: string) {
  const match = name.match(/(\d+\s*мл)$/i);

  return match?.[1].replace(/\s+/, " ") ?? null;
}

function getRepeatProduct(item: OrderItemSummary): ProductSummary | null {
  if (!item.productId) {
    return null;
  }

  const sizeLabel = getProductSizeLabel(item.productName);

  return {
    id: item.productId,
    name: getProductMediaName(item.productName),
    displayName: item.productName,
    description: null,
    price: item.unitPrice,
    available: true,
    kind: sizeLabel ? "DRINK" : "FOOD",
    category: sizeLabel ? "Напитки" : null,
    groupKey: item.productId,
    sizeLabel,
    sizeSort: null,
  };
}

function OrderItemImage({ item }: { item: OrderItemSummary }) {
  const mediaName = getProductMediaName(item.productName);
  const media = getProductMedia(mediaName);

  return (
    <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[20px] bg-[#f5f2ed]">
      {media ? (
        <Image
          src={media.src}
          alt={media.alt}
          fill
          sizes="72px"
          className="object-cover"
          style={{ objectPosition: media.objectPosition ?? "center center" }}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.9),transparent_36%),linear-gradient(180deg,#f5eee6,#eee2d7)]" />
      )}
    </div>
  );
}

function SupportIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      <path d="M7.5 15.5h-.7A3.8 3.8 0 0 1 3 11.7V8.8A3.8 3.8 0 0 1 6.8 5h6.4A3.8 3.8 0 0 1 17 8.8v2.9a3.8 3.8 0 0 1-3.8 3.8h-2.6L7 18.5l.5-3Z" />
      <path d="M16.7 10.2h.5A3.8 3.8 0 0 1 21 14v.5a3.8 3.8 0 0 1-3.8 3.8h-.5l.3 1.7-2.2-1.7h-2" />
      <path d="M7.5 10h.01" />
      <path d="M10 10h.01" />
      <path d="M12.5 10h.01" />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
    >
      <path d="M20 12a8 8 0 0 1-13.6 5.7" />
      <path d="M4 12A8 8 0 0 1 17.6 6.3" />
      <path d="M17.6 3.8v2.5h-2.5" />
      <path d="M6.4 20.2v-2.5h2.5" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      <path d="M7 3.8h10a1.8 1.8 0 0 1 1.8 1.8v14.2l-2.3-1.2-2.3 1.2-2.2-1.2-2.2 1.2-2.3-1.2-2.3 1.2V5.6A1.8 1.8 0 0 1 7 3.8Z" />
      <path d="M8.5 8h7" />
      <path d="M8.5 11.5h7" />
      <path d="M8.5 15h4.2" />
    </svg>
  );
}

function OrderAction({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-0 flex-col items-center gap-2 text-center transition active:scale-[0.97]"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#efe2d8] text-[#6b4a38] shadow-[0_10px_24px_rgba(91,64,45,0.08)]">
        {icon}
      </span>
      <span className="min-h-9 text-[14px] font-medium leading-[1.12] tracking-tight text-stone-900">
        {label}
      </span>
    </button>
  );
}

export function OrderHistoryDetailClient({
  order,
  viewer,
}: OrderHistoryDetailClientProps) {
  const router = useRouter();
  const ownerKey = getCartOwnerKey(viewer.id);
  const addProduct = useCustomerCartStore((state) => state.addProduct);
  const clearCart = useCustomerCartStore((state) => state.clear);

  function handleRepeatOrder() {
    const repeatProducts = order.items.flatMap((item) => {
      const product = getRepeatProduct(item);

      return product ? [{ item, product }] : [];
    });

    if (repeatProducts.length === 0) {
      return;
    }

    clearCart(ownerKey);

    for (const { item, product } of repeatProducts) {
      for (let index = 0; index < item.quantity; index += 1) {
        addProduct(ownerKey, product);
      }
    }

    router.push("/cart");
  }

  const header = (
    <section className="relative flex min-h-10 items-center justify-center">
      <BackLink
        href="/orders"
        className="absolute left-0 h-9 w-8 [&_svg]:!h-7 [&_svg]:!w-7"
      />
      <h1 className="text-[26px] font-medium leading-none tracking-tight text-stone-950">
        Заказ
      </h1>
    </section>
  );

  return (
    <CustomerMobileShell
      viewer={viewer}
      className="pb-28 pt-0"
      contentClassName="mt-8"
      header={header}
    >
      <section className="rounded-[30px] bg-white/62 px-5 py-5 shadow-[0_16px_36px_rgba(31,23,18,0.07)] backdrop-blur-[20px]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-medium leading-none tracking-tight text-stone-950">
              Заказ {formatOrderNumber(order.publicOrderNumber)}
            </h2>
            <p className="mt-3 text-[16px] font-normal leading-none text-stone-500">
              {formatDetailDate(order.confirmedAt)}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium leading-none ${getHistoryStatusTone(order)}`}
          >
            {getHistoryStatusLabel(order)}
          </span>
        </div>

        <p className="mt-5 text-[18px] font-medium leading-none tracking-tight text-stone-950">
          {formatMoney(order.totalPrice)}
        </p>

        <div className="mt-7 grid grid-cols-3 gap-4">
          <OrderAction icon={<SupportIcon />} label="Поддержка" />
          <OrderAction
            icon={<RepeatIcon />}
            label="Повторить заказ"
            onClick={handleRepeatOrder}
          />
          <OrderAction icon={<ReceiptIcon />} label="Чеки по заказу" />
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-[28px] bg-white/58 shadow-[0_14px_34px_rgba(31,23,18,0.06)] backdrop-blur-[18px]">
        <h2 className="px-5 pt-5 text-[22px] font-medium leading-none tracking-tight text-stone-950">
          Товары из заказа
        </h2>
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 border-b border-stone-200/70 px-4 py-3 first:mt-2 last:border-b-0"
          >
            <OrderItemImage item={item} />

            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-[17px] font-normal leading-[1.15] tracking-tight text-stone-950">
                {item.productName}
              </p>
              <p className="mt-2 text-[14px] font-normal leading-none text-stone-500">
                {item.quantity} шт.
              </p>
            </div>

            <p className="shrink-0 text-[15px] font-normal leading-none tracking-tight text-stone-950">
              {formatMoney(item.subtotal)}
            </p>
          </div>
        ))}
      </section>
    </CustomerMobileShell>
  );
}
