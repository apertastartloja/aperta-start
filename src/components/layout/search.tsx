import { Link } from "@tanstack/react-router";
import { Loader2, Search as SearchIcon, X } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format";
import type { Product } from "@/types";

export function SearchSuggestions({
  results,
  isLoading,
  onSelect,
}: {
  results: Product[];
  isLoading: boolean;
  onSelect: () => void;
}) {
  return (
    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-large">
      {isLoading ? (
        <p className="text-small flex items-center gap-2 px-4 py-4 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Buscando...
        </p>
      ) : results.length === 0 ? (
        <p className="text-small px-4 py-4 text-muted-foreground">Nenhum resultado encontrado.</p>
      ) : (
        <ul className="max-h-96 overflow-y-auto py-2">
          {results.map((product) => (
            <li key={product.id}>
              <Link
                to="/"
                onClick={onSelect}
                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted"
              >
                <span className="size-10 shrink-0 overflow-hidden rounded-sm bg-surface">
                  {product.images[0] ? (
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].alt}
                      className="size-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-small block truncate font-medium">{product.name}</span>
                  <span className="text-caption block text-muted-foreground">
                    {formatCurrency(product.price)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Search({ className }: { className?: string | undefined }) {
  const { term, setTerm, isOpen, open, close, results, isLoading, reset } = useSearch();

  return (
    <div className={cn("relative w-full max-w-2xl", className)}>
      <div className="flex h-12 items-center overflow-hidden rounded-md bg-card pl-4 pr-1.5">
        <input
          value={term}
          onChange={(event) => {
            setTerm(event.target.value);
            open();
          }}
          onFocus={open}
          onBlur={() => window.setTimeout(close, 150)}
          placeholder="O que você está procurando?"
          aria-label="Buscar produtos"
          className="text-small h-full flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
        />
        {term ? (
          <button
            type="button"
            onClick={reset}
            aria-label="Limpar busca"
            className="mr-2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        ) : null}
        <button
          type="button"
          aria-label="Buscar"
          className="grid size-9 shrink-0 place-items-center rounded-sm bg-accent text-accent-foreground transition-opacity hover:opacity-90"
        >
          <SearchIcon className="size-4" />
        </button>
      </div>

      {isOpen && term.trim().length >= 2 ? (
        <SearchSuggestions results={results} isLoading={isLoading} onSelect={reset} />
      ) : null}
    </div>
  );
}
