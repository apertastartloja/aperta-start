import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "full";

/**
 * Container Global da Aperta Start — Padrão unificado de largura e respiro (1200px).
 */
const sizes: Record<Size, string> = {
  sm: "max-w-3xl",
  md: "max-w-4xl",
  lg: "max-w-[1200px]",
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
  return <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizes[size], className)}>{children}</div>;
}
