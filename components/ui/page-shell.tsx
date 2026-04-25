import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type PageShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  subnav?: ReactNode;
  banner?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  subnav,
  banner,
  children,
  className,
}: PageShellProps) {
  return (
    <main className={cn("page-grid", className)}>
      <header className="hero-surface">
        <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            {eyebrow ? <p className="kicker">{eyebrow}</p> : null}
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl md:text-6xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-600 md:text-base md:leading-7">
                {description}
              </p>
            ) : null}
          </div>

          {actions ? (
            <div className="flex w-full flex-col gap-3 [&>*]:w-full [&>*]:justify-center sm:flex-row sm:flex-wrap sm:[&>*]:w-auto xl:max-w-md xl:justify-end">
              {actions}
            </div>
          ) : null}
        </div>
      </header>

      {subnav ? <div className="sticky top-3 z-30 mt-4">{subnav}</div> : null}

      {banner ? <div className="mt-4">{banner}</div> : null}

      <div className="mt-6">{children}</div>
    </main>
  );
}
