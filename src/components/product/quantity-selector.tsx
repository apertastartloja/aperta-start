import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number | undefined;
  max?: number | undefined;
  disabled?: boolean | undefined;
  className?: string | undefined;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled,
  className,
}: QuantitySelectorProps) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-card",
        disabled && "opacity-60",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Diminuir quantidade"
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
      >
        <Minus className="size-4" />
      </Button>
      <span className="text-small w-10 text-center font-semibold tabular-nums">{value}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Aumentar quantidade"
        disabled={disabled || value >= max}
        onClick={() => onChange(clamp(value + 1))}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
