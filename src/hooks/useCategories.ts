import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { CategoryService, CollectionService, KitService } from "@/services";

export function useCategories() {
  return useQuery({ queryKey: queryKeys.categories.all, queryFn: () => CategoryService.list() });
}

export function useCategoryTree() {
  return useQuery({ queryKey: queryKeys.categories.tree, queryFn: () => CategoryService.tree() });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(slug),
    queryFn: () => CategoryService.getBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useCollections() {
  return useQuery({ queryKey: queryKeys.collections.all, queryFn: () => CollectionService.list() });
}

export function useKits() {
  return useQuery({ queryKey: queryKeys.kits.all, queryFn: () => KitService.list() });
}
