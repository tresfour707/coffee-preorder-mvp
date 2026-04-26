import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="customer-soft-card px-6 py-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f7e5d8] text-[28px] shadow-sm">
        •
      </div>
      <h2 className="mt-5 text-[30px] font-semibold tracking-tight text-stone-900">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-stone-600">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
