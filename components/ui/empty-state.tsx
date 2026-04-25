import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="surface p-6 text-center md:p-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <span className="text-xl font-semibold">•</span>
      </div>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-stone-900">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-stone-600 md:text-base">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
