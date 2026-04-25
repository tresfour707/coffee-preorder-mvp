import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/cn";
import { statusLabels } from "@/lib/labels";

const toneClasses: Record<OrderStatus, string> = {
  DRAFT: "bg-stone-100 text-stone-700 border-stone-200",
  WAITING: "bg-amber-100 text-amber-800 border-amber-200",
  PREPARING: "bg-sky-100 text-sky-800 border-sky-200",
  READY: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELLED: "bg-stone-200 text-stone-700 border-stone-300",
};

type StatusBadgeProps = {
  status: OrderStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
        toneClasses[status],
        className,
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
