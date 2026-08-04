import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  reviewsCount?: number | undefined;
  size?: "sm" | "md";
  className?: string | undefined;
}

export function Rating({ value, reviewsCount, size = "sm", className }: RatingProps) {
  const iconSize = size === "sm" ? "size-3.5" : "size-4.5";

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              iconSize,
              index < Math.round(value)
                ? "fill-accent text-accent"
                : "fill-transparent text-border",
            )}
            aria-hidden
          />
        ))}
      </div>
      <span className="text-small text-muted-foreground">
        {value.toFixed(1)}
        {typeof reviewsCount === "number" ? ` (${reviewsCount})` : ""}
      </span>
    </div>
  );
}
