import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { CollectionService, ProductService } from "@/services";
import type { Product } from "@/types";

/** Produtos de uma coleção (Destaques, Lançamentos, Mais vendidos). */
export function useCollectionProducts(slug: string) {
  return useQuery<Product[]>({
    queryKey: [...queryKeys.collections.all, slug, "products"],
    queryFn: async () => {
      const collection = await CollectionService.getBySlug(slug);
      return ProductService.getManyByIds(collection.productIds);
    },
    enabled: Boolean(slug),
  });
}
