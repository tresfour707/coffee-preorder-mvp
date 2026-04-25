import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/cn";
import { statusLabels } from "@/lib/labels";

const toneClasses: Record<OrderStatus, string> = {
  DRAFT: "border-stone-200 bg-stone-100 text-stone-700",
  WAITING: "border-brand-200 bg-brand-50 text-brand-800",
  PREPARING: "border-sky-200 bg-sky-50 text-sky-800",
  READY: "border-emerald-200 bg-emerald-50 text-emerald-800",
  CANCELLED: "border-stone-300 bg-stone-200 text-stone-700",
};

type StatusBadgeProps = {
  status: OrderStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em]",
        toneClasses[status],
        className,
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
