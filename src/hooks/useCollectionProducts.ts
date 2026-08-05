import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { CollectionService, ProductService } from "@/services";
import type { Product } from "@/types";

/** Produtos de uma coleção (Destaques, Lançamentos, Mais vendidos). */
export function useCollectionProducts(slug: string) {
  return useQuery<Product[]>({
    queryKey: [...queryKeys.collections.all, slug, "products"],
    queryFn: async () => {
      const res = await ProductService.list({ collectionSlug: slug, perPage: 100 });
      return res.data;
    },
    enabled: Boolean(slug),
  });
}
