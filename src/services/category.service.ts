import { supabase } from "@/lib/supabase";
import { mockCategories, mockCollections, mockKits } from "@/mocks";
import type { Category, Collection, Kit } from "@/types";
import { NotFoundError, clone, delay } from "./base.service";

let localCategoriesStore: Category[] = clone(mockCategories);
let localCollectionsStore: Collection[] = clone(mockCollections);

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
        const fetched = data.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description ?? undefined,
          image: item.image ?? undefined,
          parentId: item.parent_id ?? null,
          order: item.order ?? 0,
          featured: item.featured ?? false,
        }));
        localCategoriesStore = fetched;
        return fetched;
      }
    } catch (err) {
      console.warn("Aviso ao buscar categorias do Supabase:", err);
    }
    return delay(clone(localCategoriesStore));
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

  async create(input: Omit<Category, "id">): Promise<Category> {
    const id = `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newCategory: Category = { ...input, id };

    try {
      const payload = {
        id: newCategory.id,
        name: newCategory.name,
        slug: newCategory.slug,
        description: newCategory.description ?? null,
        image: newCategory.image ?? null,
        parent_id: newCategory.parentId ?? null,
        order: newCategory.order ?? 0,
        featured: newCategory.featured ?? false,
      };
      await supabase.from("categories").insert(payload);
    } catch (err) {
      console.warn("Erro ao salvar categoria no Supabase:", err);
    }

    localCategoriesStore.push(newCategory);
    return delay(clone(newCategory));
  },

  async update(id: string, patch: Partial<Category>): Promise<Category> {
    const idx = localCategoriesStore.findIndex((c) => c.id === id);
    const baseCat = localCategoriesStore[idx] ?? { id, name: "", slug: "" };
    const updated: Category = { ...baseCat, ...patch, id };

    try {
      const payload: Record<string, any> = {};
      if (patch.name !== undefined) payload["name"] = patch.name;
      if (patch.slug !== undefined) payload["slug"] = patch.slug;
      if (patch.description !== undefined) payload["description"] = patch.description;
      if (patch.image !== undefined) payload["image"] = patch.image;
      if (patch.parentId !== undefined) payload["parent_id"] = patch.parentId;
      if (patch.order !== undefined) payload["order"] = patch.order;
      if (patch.featured !== undefined) payload["featured"] = patch.featured;

      await supabase.from("categories").update(payload).eq("id", id);
    } catch (err) {
      console.warn("Erro ao atualizar categoria no Supabase:", err);
    }

    if (idx >= 0) localCategoriesStore[idx] = updated;
    return delay(clone(updated));
  },

  async delete(id: string): Promise<boolean> {
    try {
      await supabase.from("categories").delete().eq("id", id);
    } catch (err) {
      console.warn("Erro ao excluir categoria no Supabase:", err);
    }

    localCategoriesStore = localCategoriesStore.filter((c) => c.id !== id);
    return delay(true);
  },
};

export const CollectionService = {
  async list(): Promise<Collection[]> {
    try {
      const { data, error } = await supabase.from("collections").select("*");
      if (!error && data && data.length > 0) {
        const fetched = data.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description ?? undefined,
          image: item.image ?? undefined,
          productIds: item.product_ids ?? [],
        }));
        localCollectionsStore = fetched;
        return fetched;
      }
    } catch (err) {
      console.warn("Aviso ao buscar coleções do Supabase:", err);
    }
    return delay(clone(localCollectionsStore));
  },

  async getBySlug(slug: string): Promise<Collection> {
    const all = await this.list();
    const collection = all.find((c) => c.slug === slug);
    if (!collection) throw new NotFoundError("Coleção", slug);
    return collection;
  },

  async create(input: Omit<Collection, "id">): Promise<Collection> {
    const id = `col-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newCollection: Collection = { ...input, id };

    try {
      const payload = {
        id: newCollection.id,
        name: newCollection.name,
        slug: newCollection.slug,
        description: newCollection.description ?? null,
        image: newCollection.image ?? null,
        product_ids: newCollection.productIds ?? [],
      };
      await supabase.from("collections").insert(payload);
    } catch (err) {
      console.warn("Erro ao cadastrar coleção no Supabase:", err);
    }

    localCollectionsStore.push(newCollection);
    return delay(clone(newCollection));
  },

  async update(id: string, patch: Partial<Collection>): Promise<Collection> {
    const idx = localCollectionsStore.findIndex((c) => c.id === id);
    const baseCol = localCollectionsStore[idx] ?? { id, name: "", slug: "", productIds: [] };
    const updated: Collection = { ...baseCol, ...patch, id };

    try {
      const payload: Record<string, any> = {};
      if (patch.name !== undefined) payload["name"] = patch.name;
      if (patch.slug !== undefined) payload["slug"] = patch.slug;
      if (patch.description !== undefined) payload["description"] = patch.description;
      if (patch.image !== undefined) payload["image"] = patch.image;
      if (patch.productIds !== undefined) payload["product_ids"] = patch.productIds;

      await supabase.from("collections").update(payload).eq("id", id);
    } catch (err) {
      console.warn("Erro ao atualizar coleção no Supabase:", err);
    }

    if (idx >= 0) localCollectionsStore[idx] = updated;
    return delay(clone(updated));
  },

  async delete(id: string): Promise<boolean> {
    try {
      await supabase.from("collections").delete().eq("id", id);
    } catch (err) {
      console.warn("Erro ao excluir coleção no Supabase:", err);
    }

    localCollectionsStore = localCollectionsStore.filter((c) => c.id !== id);
    return delay(true);
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
