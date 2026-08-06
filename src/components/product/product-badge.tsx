import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProductBadgeType } from "@/types";

const CONFIG: Record<ProductBadgeType, { label: string; className: string }> = {
  new: {
    label: "Novo",
    className:
      "bg-gradient-to-r from-[#000B1F] to-[#081838] text-white border border-white/20 shadow-xs font-extrabold tracking-wide",
  },
  sale: { label: "Oferta", className: "bg-danger text-danger-foreground border-transparent" },
  bestseller: {
    label: "Mais vendido",
    className: "bg-accent text-accent-foreground border-transparent font-bold",
  },
  exclusive: { label: "Exclusivo", className: "bg-primary text-primary-foreground border-transparent" },
  outOfStock: { label: "Esgotado", className: "bg-muted text-muted-foreground border-transparent" },
};

export function ProductBadge({
  type,
  className,
}: {
  type: ProductBadgeType;
  className?: string | undefined;
}) {
  const config = CONFIG[type];
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-3 py-1 text-[11px] font-bold", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

export function ProductBadgeList({
  types,
  max = 2,
  className,
}: {
  types: ProductBadgeType[];
  max?: number | undefined;
  className?: string | undefined;
}) {
  if (!types.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {types.slice(0, max).map((type) => (
        <ProductBadge key={type} type={type} />
      ))}
    </div>
  );
}
