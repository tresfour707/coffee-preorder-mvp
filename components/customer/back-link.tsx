import Link from "next/link";

import { cn } from "@/lib/cn";

type BackLinkProps = {
  href?: string;
  className?: string;
};

function ArrowLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className="h-9 w-9"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.6"
    >
      <path d="M19.5 8.5 12 16l7.5 7.5" />
      <path d="M12.5 16h17" />
    </svg>
  );
}

export function BackLink({
  href = "/menu",
  className,
}: BackLinkProps) {
  return (
    <Link
      href={href}
      aria-label="Назад к меню"
      className={cn(
        "flex h-12 w-10 shrink-0 items-center justify-center text-stone-950 transition active:scale-[0.94]",
        className,
      )}
    >
      <ArrowLeftIcon />
    </Link>
  );
}
