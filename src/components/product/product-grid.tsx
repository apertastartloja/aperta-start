import { EmptyState } from "@/components/common/empty-state";
import { ListSkeleton } from "@/components/common/loading";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean | undefined;
  columns?: 2 | 3 | 4;
  compact?: boolean | undefined;
  emptyTitle?: string | undefined;
  emptyDescription?: string | undefined;
  className?: string | undefined;
}

const columnsMap = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const;

export function ProductGrid({
  products,
  isLoading = false,
  columns = 4,
  compact = false,
  emptyTitle = "Nenhum produto encontrado",
  emptyDescription = "Ajuste os filtros ou tente outra busca.",
  className,
}: ProductGridProps) {
  if (isLoading) return <ListSkeleton count={columns * 2} className={className} />;

  if (!products.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} className={className} />;
  }

  return (
    <div className={cn("grid grid-cols-1 gap-6", columnsMap[columns], className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} compact={compact} />
      ))}
    </div>
  );
}
