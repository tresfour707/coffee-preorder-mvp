import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="surface p-6 text-center md:p-8">
      <h2 className="text-2xl font-semibold text-stone-900">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-stone-600">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
