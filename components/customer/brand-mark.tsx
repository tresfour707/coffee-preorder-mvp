import Image from "next/image";

import { cn } from "@/lib/cn";

type BrandMarkProps = {
  tone?: "light" | "dark" | "coffee";
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
  const src = tone === "light" ? "/brand/grlsha-light.png" : "/brand/grlsha-dark.png";
  const filter =
    tone === "coffee"
      ? "brightness(0) saturate(100%) invert(23%) sepia(15%) saturate(1036%) hue-rotate(342deg) brightness(92%) contrast(89%)"
      : undefined;

  return (
    <Image
      src={src}
      alt="грЛша"
      width={1040}
      height={292}
      priority
      unoptimized
      style={filter ? { filter } : undefined}
      className={cn("h-auto select-none", sizeClasses[size], className)}
    />
  );
}
