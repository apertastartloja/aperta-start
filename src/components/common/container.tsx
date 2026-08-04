import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "full";

const sizes: Record<Size, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  full: "max-w-none",
};

export function Container({
  children,
  size = "lg",
  className,
}: {
  children: ReactNode;
  size?: Size;
  className?: string | undefined;
}) {
  return <div className={cn("mx-auto w-full px-6", sizes[size], className)}>{children}</div>;
}
