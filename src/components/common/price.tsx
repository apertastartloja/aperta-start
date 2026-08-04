import { cn } from "@/lib/utils";
import { bestInstallment, discountPercent, formatCurrency } from "@/utils/format";

interface PriceProps {
  value: number;
  compareAtValue?: number | null | undefined;
  size?: "sm" | "md" | "lg";
  showDiscount?: boolean | undefined;
  className?: string | undefined;
}

const sizes = {
  sm: { current: "text-small font-bold", compare: "text-caption" },
  md: { current: "text-h4 font-extrabold", compare: "text-small" },
  lg: { current: "text-h2", compare: "text-body" },
} as const;

export function Price({
  value,
  compareAtValue,
  size = "md",
  showDiscount = false,
  className,
}: PriceProps) {
  const off = discountPercent(value, compareAtValue);

  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      {compareAtValue && off > 0 ? (
        <span className={cn("text-muted-foreground line-through", sizes[size].compare)}>
          {formatCurrency(compareAtValue)}
        </span>
      ) : null}
      <span className={cn("text-foreground", sizes[size].current)}>{formatCurrency(value)}</span>
      {showDiscount && off > 0 ? (
        <span className="text-caption rounded-sm bg-success/12 px-2 py-1 text-success">
          -{Math.round(off)}%
        </span>
      ) : null}
    </div>
  );
}

export function Installments({ total, className }: { total: number; className?: string | undefined }) {
  const { count, value, interestFree } = bestInstallment(total);
  if (count <= 1) return null;

  return (
    <p className={cn("text-small text-muted-foreground", className)}>
      ou {count}x de {formatCurrency(value)}
      {interestFree ? "" : ""}
    </p>
  );
}
