import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { ProductService } from "@/services";
import type { ProductQuery } from "@/types";

export function useProducts(query: ProductQuery = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(query),
    queryFn: () => ProductService.list(query),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(slug),
    queryFn: () => ProductService.getBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useProductsByIds(ids: string[]) {
  return useQuery({
    queryKey: queryKeys.products.byIds(ids),
    queryFn: () => ProductService.getManyByIds(ids),
    enabled: ids.length > 0,
  });
}

export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: queryKeys.products.featured(limit),
    queryFn: () => ProductService.featured(limit),
  });
}

export function useRelatedProducts(productId: string, limit = 4) {
  return useQuery({
    queryKey: queryKeys.products.related(productId),
    queryFn: () => ProductService.related(productId, limit),
    enabled: Boolean(productId),
  });
}
