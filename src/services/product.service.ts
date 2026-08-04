import { PAGINATION } from "@/constants";
import { supabase } from "@/lib/supabase";
import { mockCategories, mockCollections, mockProducts } from "@/mocks";
import type { Paginated, Product, ProductQuery } from "@/types";
import { NotFoundError, clone, delay, paginate } from "./base.service";

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const descendantCategoryIds = (slug: string): string[] => {
  const root = mockCategories.find((c) => c.slug === slug);
  if (!root) return [];
  const children = mockCategories.filter((c) => c.parentId === root.id).map((c) => c.id);
  return [root.id, ...children];
};

const applyQuery = (query: ProductQuery): Product[] => {
  let items = clone(mockProducts);

  if (query.search) {
    const term = normalize(query.search);
    items = items.filter(
      (p) =>
        normalize(p.name).includes(term) ||
        normalize(p.description).includes(term) ||
        p.tags.some((tag) => normalize(tag).includes(term)),
    );
  }

  if (query.categorySlug) {
    const ids = descendantCategoryIds(query.categorySlug);
    items = items.filter((p) => ids.includes(p.categoryId));
  }

  if (query.collectionSlug) {
    const collection = mockCollections.find((c) => c.slug === query.collectionSlug);
    items = collection ? items.filter((p) => collection.productIds.includes(p.id)) : [];
  }

  if (query.tags?.length) {
    items = items.filter((p) => query.tags!.some((tag) => p.tags.includes(tag)));
  }

  if (typeof query.minPrice === "number") {
    items = items.filter((p) => p.price >= query.minPrice!);
  }
  if (typeof query.maxPrice === "number") {
    items = items.filter((p) => p.price <= query.maxPrice!);
  }

  switch (query.sort) {
    case "priceAsc":
      items.sort((a, b) => a.price - b.price);
      break;
    case "priceDesc":
      items.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "rating":
      items.sort((a, b) => b.rating - a.rating);
      break;
    default:
      items.sort((a, b) => b.reviewsCount - a.reviewsCount);
  }

  return items;
};

export const ProductService = {
  async fetchFromSupabase(): Promise<Product[] | null> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          sku: item.sku ?? "",
          description: item.description,
          shortDescription: item.short_description ?? undefined,
          price: Number(item.price),
          compareAtPrice: item.compare_at_price ? Number(item.compare_at_price) : null,
          categoryId: item.category_id,
          collectionIds: item.collection_ids ?? [],
          images: item.images ?? [],
          badges: item.badges ?? [],
          rating: Number(item.rating ?? 5.0),
          reviewsCount: item.reviews_count ?? 0,
          stock: item.stock ?? 0,
          variants: item.variants ?? [],
          tags: item.tags ?? [],
          createdAt: item.created_at,
        }));
      }
    } catch {
      // Fallback
    }
    return null;
  },

  async list(query: ProductQuery = {}): Promise<Paginated<Product>> {
    const supabaseProducts = await this.fetchFromSupabase();
    const sourceProducts = supabaseProducts ?? mockProducts;
    
    // Aplicar query em memória
    let items = clone(sourceProducts);

    if (query.search) {
      const term = normalize(query.search);
      items = items.filter(
        (p) =>
          normalize(p.name).includes(term) ||
          normalize(p.description).includes(term) ||
          p.tags.some((tag) => normalize(tag).includes(term)),
      );
    }

    if (query.categorySlug) {
      const ids = descendantCategoryIds(query.categorySlug);
      items = items.filter((p) => ids.includes(p.categoryId));
    }

    if (query.collectionSlug) {
      const collection = mockCollections.find((c) => c.slug === query.collectionSlug);
      items = collection ? items.filter((p) => collection.productIds.includes(p.id)) : [];
    }

    if (query.tags?.length) {
      items = items.filter((p) => query.tags!.some((tag) => p.tags.includes(tag)));
    }

    if (typeof query.minPrice === "number") {
      items = items.filter((p) => p.price >= query.minPrice!);
    }
    if (typeof query.maxPrice === "number") {
      items = items.filter((p) => p.price <= query.maxPrice!);
    }

    switch (query.sort) {
      case "priceAsc":
        items.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        items.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      case "rating":
        items.sort((a, b) => b.rating - a.rating);
        break;
      default:
        items.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    return delay(paginate(items, query.page ?? 1, query.perPage ?? PAGINATION.perPage));
  },

  async getBySlug(slug: string): Promise<Product> {
    const res = await this.list({ perPage: 1000 });
    const product = res.data.find((p) => p.slug === slug);
    if (!product) throw new NotFoundError("Produto", slug);
    return product;
  },

  async getById(id: string): Promise<Product> {
    const res = await this.list({ perPage: 1000 });
    const product = res.data.find((p) => p.id === id);
    if (!product) throw new NotFoundError("Produto", id);
    return product;
  },

  async getManyByIds(ids: string[]): Promise<Product[]> {
    const res = await this.list({ perPage: 1000 });
    return res.data.filter((p) => ids.includes(p.id));
  },

  async featured(limit = 8): Promise<Product[]> {
    const res = await this.list({ perPage: 1000 });
    return res.data
      .filter((p) => p.badges.includes("bestseller") || p.rating >= 4.6)
      .slice(0, limit);
  },

  async related(productId: string, limit = 4): Promise<Product[]> {
    const res = await this.list({ perPage: 1000 });
    const product = res.data.find((p) => p.id === productId);
    return res.data
      .filter((p) => p.id !== productId && p.categoryId === product?.categoryId)
      .slice(0, limit);
  },

  async search(term: string, limit = 6): Promise<Product[]> {
    if (!term.trim()) return delay([], 0);
    const res = await this.list({ search: term, perPage: limit });
    return res.data;
  },
};
