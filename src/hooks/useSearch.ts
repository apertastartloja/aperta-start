import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { queryKeys } from "@/lib/query-keys";
import { ProductService } from "@/services";
import { useDebouncedValue } from "./useDebouncedValue";

export function useSearch(initialTerm = "") {
  const [term, setTerm] = useState(initialTerm);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedTerm = useDebouncedValue(term, 300);

  const suggestions = useQuery({
    queryKey: queryKeys.products.search(debouncedTerm),
    queryFn: () => ProductService.search(debouncedTerm),
    enabled: debouncedTerm.trim().length >= 2,
  });

  const reset = useCallback(() => {
    setTerm("");
    setIsOpen(false);
  }, []);

  return {
    term,
    setTerm,
    debouncedTerm,
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    reset,
    results: suggestions.data ?? [],
    isLoading: suggestions.isFetching,
  };
}
