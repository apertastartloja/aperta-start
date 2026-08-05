import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Check, X } from "lucide-react";
import { ProductService } from "@/services/product.service";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface RelatedProductsPickerProps {
  selectedIds: string[];
  onToggle: (id: string) => void;
  currentProductId?: string;
}

export function RelatedProductsPicker({
  selectedIds,
  onToggle,
  currentProductId,
}: RelatedProductsPickerProps) {
  const [search, setSearch] = useState("");

  const { data } = useQuery({
    queryKey: ["products", "all-for-related"],
    queryFn: () => ProductService.list({ perPage: 200, includeInactive: true }),
  });

  const allProducts = (data?.data ?? []).filter((p) => p.id !== currentProductId);

  const term = search.toLowerCase().trim();
  const filtered = term
    ? allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term)
      )
    : allProducts;

  const selectedProducts = allProducts.filter((p) => selectedIds.includes(p.id));

  return (
    <div className="space-y-4">
      {/* Selected chips */}
      {selectedProducts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedProducts.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 rounded-xl border border-info/30 bg-info/10 px-3 py-1.5 text-small font-bold text-info"
            >
              <img
                src={p.images[0]?.url}
                alt={p.name}
                className="h-6 w-6 rounded-lg object-contain bg-white border border-border"
              />
              <span className="max-w-[160px] truncate">{p.name}</span>
              <button
                type="button"
                onClick={() => onToggle(p.id)}
                className="rounded-full hover:bg-danger/20 p-0.5 text-danger"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedIds.length >= 6 && (
        <p className="text-[11px] text-amber-600 font-bold">
          Limite de 6 produtos relacionados atingido.
        </p>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar produto por nome ou SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-input bg-background pl-9 pr-4 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
        />
      </div>

      {/* Product list */}
      <div className="rounded-xl border border-border bg-background divide-y divide-border max-h-72 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-4 py-4 text-caption text-muted-foreground text-center italic">
            Nenhum produto encontrado.
          </p>
        ) : (
          filtered.slice(0, 30).map((p) => {
            const isSelected = selectedIds.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onToggle(p.id)}
                disabled={!isSelected && selectedIds.length >= 6}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed",
                  isSelected && "bg-info/5"
                )}
              >
                <img
                  src={p.images[0]?.url}
                  alt={p.name}
                  className="h-10 w-10 shrink-0 rounded-xl border border-border bg-white object-contain p-1"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-small font-bold text-foreground truncate">{p.name}</p>
                  <p className="text-caption text-muted-foreground">SKU: {p.sku}</p>
                </div>
                <span className="text-small font-bold text-foreground shrink-0">
                  R$ {p.price.toFixed(2).replace(".", ",")}
                </span>
                <div
                  className={cn(
                    "h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                    isSelected
                      ? "bg-info border-info text-white"
                      : "border-border"
                  )}
                >
                  {isSelected && <Check className="size-3" />}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
