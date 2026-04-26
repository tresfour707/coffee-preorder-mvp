import Image from "next/image";

import { cn } from "@/lib/cn";

type BrandMarkProps = {
  tone?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "w-[102px]",
  md: "w-[122px]",
  lg: "w-[144px]",
} as const;

export function BrandMark({
  tone = "dark",
  size = "md",
  className,
}: BrandMarkProps) {
  return (
    <Image
      src={tone === "light" ? "/brand/grlsha-light.png" : "/brand/grlsha-dark.png"}
      alt="грЛша"
      width={1040}
      height={292}
      priority
      unoptimized
      className={cn("h-auto select-none", sizeClasses[size], className)}
    />
  );
}
