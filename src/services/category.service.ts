import { supabase } from "@/lib/supabase";
import { mockCategories, mockCollections, mockKits } from "@/mocks";
import type { Category, Collection, Kit } from "@/types";
import { NotFoundError, clone, delay } from "./base.service";

export interface CategoryTree extends Category {
  children: Category[];
}

export const CategoryService = {
  async list(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("order", { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description ?? undefined,
          image: item.image ?? undefined,
          parentId: item.parent_id ?? null,
          order: item.order ?? 0,
          featured: item.featured ?? false,
        }));
      }
    } catch {
      // Fallback para mock em caso de erro de conexão
    }
    return delay(clone(mockCategories));
  },

  async roots(): Promise<Category[]> {
    const all = await this.list();
    return all.filter((c) => !c.parentId);
  },

  async tree(): Promise<CategoryTree[]> {
    const all = await this.list();
    return all
      .filter((c) => !c.parentId)
      .map((root) => ({
        ...root,
        children: all.filter((c) => c.parentId === root.id),
      }));
  },

  async getBySlug(slug: string): Promise<Category> {
    const all = await this.list();
    const category = all.find((c) => c.slug === slug);
    if (!category) throw new NotFoundError("Categoria", slug);
    return category;
  },
};

export const CollectionService = {
  async list(): Promise<Collection[]> {
    return delay(clone(mockCollections));
  },
  async getBySlug(slug: string): Promise<Collection> {
    const collection = mockCollections.find((c) => c.slug === slug);
    if (!collection) throw new NotFoundError("Coleção", slug);
    return delay(clone(collection));
  },
};

export const KitService = {
  async list(): Promise<Kit[]> {
    return delay(clone(mockKits));
  },
  async getBySlug(slug: string): Promise<Kit> {
    const kit = mockKits.find((k) => k.slug === slug);
    if (!kit) throw new NotFoundError("Kit", slug);
    return delay(clone(kit));
  },
};
