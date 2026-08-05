import { PAGINATION } from "@/constants";
import { supabase } from "@/lib/supabase";
import { mockCategories, mockCollections, mockProducts } from "@/mocks";
import type { Paginated, Product, ProductQuery } from "@/types";
import { NotFoundError, clone, delay, paginate } from "./base.service";

let localProductsStore: Product[] = clone(mockProducts);

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

export const ProductService = {
  async fetchFromSupabase(): Promise<Product[] | null> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const fetched = data.map((item) => ({
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
          status: item.status ?? "active",
          seoTitle: item.seo_title ?? undefined,
          seoDescription: item.seo_description ?? undefined,
          relatedProductIds: item.related_product_ids ?? [],
          orderBumpProductId: item.order_bump_product_id ?? null,
          orderBumpMessage: item.order_bump_message ?? undefined,
          specs: item.specs ?? [],
          shippingWeight: item.shipping_weight ?? undefined,
          shippingLength: item.shipping_length ?? undefined,
          shippingWidth: item.shipping_width ?? undefined,
          shippingHeight: item.shipping_height ?? undefined,
          createdAt: item.created_at ?? new Date().toISOString(),
        }));
        localProductsStore = fetched;
        return fetched;
      }
    } catch (err) {
      console.warn("Aviso ao buscar produtos do Supabase, utilizando estado local:", err);
    }
    return localProductsStore;
  },

  async list(query: ProductQuery & { includeInactive?: boolean } = {}): Promise<Paginated<Product>> {
    const supabaseProducts = await this.fetchFromSupabase();
    const sourceProducts = supabaseProducts ?? localProductsStore;

    // Aplicar filtro de visibilidade da loja pública se includeInactive não for true
    let items = clone(sourceProducts);
    if (!query.includeInactive) {
      items = items.filter((p) => p.status === "active" || !p.status);
    }

    if (query.search) {
      const term = normalize(query.search);
      items = items.filter(
        (p) =>
          normalize(p.name).includes(term) ||
          normalize(p.description).includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          p.tags.some((tag) => normalize(tag).includes(term))
      );
    }

    if (query.categorySlug) {
      const ids = descendantCategoryIds(query.categorySlug);
      items = items.filter((p) => ids.includes(p.categoryId));
    }

    if (query.collectionSlug) {
      const slugLower = query.collectionSlug.toLowerCase();
      const collection = mockCollections.find((c) => c.slug.toLowerCase() === slugLower);
      const collectionId = collection?.id;

      items = items.filter((p) => {
        const matchByCollectionId = Boolean(collectionId && p.collectionIds?.includes(collectionId));
        const matchBySlug = p.collectionIds?.some(
          (cId) => cId.toLowerCase() === slugLower || cId.toLowerCase() === `col-${slugLower}`
        );
        const matchByStatic = Boolean(collection?.productIds?.includes(p.id));

        let matchByBadge = false;
        if (slugLower === "destaques") {
          matchByBadge = p.badges?.some((b) => ["exclusive", "bestseller", "sale"].includes(b));
        } else if (slugLower === "lancamentos" || slugLower === "novidades") {
          matchByBadge = p.badges?.includes("new");
        } else if (slugLower === "mais-vendidos") {
          matchByBadge = p.badges?.includes("bestseller");
        }

        return matchByCollectionId || matchBySlug || matchByStatic || matchByBadge;
      });
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
    const res = await this.list({ perPage: 1000, includeInactive: true });
    const product = res.data.find((p) => p.slug === slug);
    if (!product) throw new NotFoundError("Produto", slug);
    return product;
  },

  async getById(id: string): Promise<Product> {
    const res = await this.list({ perPage: 1000, includeInactive: true });
    const product = res.data.find((p) => p.id === id);
    if (!product) throw new NotFoundError("Produto", id);
    return product;
  },

  async getManyByIds(ids: string[]): Promise<Product[]> {
    if (!ids || ids.length === 0) return [];
    const res = await this.list({ perPage: 1000, includeInactive: true });
    return res.data.filter((p) => ids.includes(p.id));
  },

  async create(input: Omit<Product, "id" | "createdAt">): Promise<Product> {
    const newId = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const createdAt = new Date().toISOString();

    const newProduct: Product = {
      ...input,
      id: newId,
      createdAt,
      status: input.status ?? "active",
      rating: input.rating ?? 5.0,
      reviewsCount: input.reviewsCount ?? 0,
    };

    // 1. Tentar salvar no Supabase
    try {
      const payload = {
        id: newProduct.id,
        name: newProduct.name,
        slug: newProduct.slug,
        sku: newProduct.sku,
        description: newProduct.description,
        short_description: newProduct.shortDescription ?? null,
        price: newProduct.price,
        compare_at_price: newProduct.compareAtPrice ?? null,
        category_id: newProduct.categoryId,
        collection_ids: newProduct.collectionIds,
        images: newProduct.images,
        badges: newProduct.badges,
        rating: newProduct.rating,
        reviews_count: newProduct.reviewsCount,
        stock: newProduct.stock,
        variants: newProduct.variants ?? [],
        tags: newProduct.tags,
        status: newProduct.status,
        seo_title: newProduct.seoTitle ?? null,
        seo_description: newProduct.seoDescription ?? null,
        related_product_ids: newProduct.relatedProductIds ?? [],
        order_bump_product_id: newProduct.orderBumpProductId ?? null,
        order_bump_message: newProduct.orderBumpMessage ?? null,
        specs: newProduct.specs ?? [],
        shipping_weight: newProduct.shippingWeight ?? null,
        shipping_length: newProduct.shippingLength ?? null,
        shipping_width: newProduct.shippingWidth ?? null,
        shipping_height: newProduct.shippingHeight ?? null,
        created_at: newProduct.createdAt,
      };

      const { error } = await supabase.from("products").insert(payload);
      if (error) {
        console.warn("Erro ao salvar produto no Supabase (salvando localmente):", error.message);
      }
    } catch (err) {
      console.warn("Falha de conexão com Supabase ao criar produto:", err);
    }

    // 2. Atualizar estado local
    localProductsStore = [newProduct, ...localProductsStore];
    return delay(clone(newProduct));
  },

  async update(id: string, patch: Partial<Product>): Promise<Product> {
    const existingIndex = localProductsStore.findIndex((p) => p.id === id);
    const existing = localProductsStore[existingIndex];

    const updatedProduct: Product = {
      ...(existing || {}),
      ...patch,
      id,
    } as Product;

    // 1. Atualizar no Supabase
    try {
      const payload: Record<string, any> = {};
      if (patch.name !== undefined) payload["name"] = patch.name;
      if (patch.slug !== undefined) payload["slug"] = patch.slug;
      if (patch.sku !== undefined) payload["sku"] = patch.sku;
      if (patch.description !== undefined) payload["description"] = patch.description;
      if (patch.shortDescription !== undefined) payload["short_description"] = patch.shortDescription;
      if (patch.price !== undefined) payload["price"] = patch.price;
      if (patch.compareAtPrice !== undefined) payload["compare_at_price"] = patch.compareAtPrice;
      if (patch.categoryId !== undefined) payload["category_id"] = patch.categoryId;
      if (patch.collectionIds !== undefined) payload["collection_ids"] = patch.collectionIds;
      if (patch.images !== undefined) payload["images"] = patch.images;
      if (patch.badges !== undefined) payload["badges"] = patch.badges;
      if (patch.stock !== undefined) payload["stock"] = patch.stock;
      if (patch.variants !== undefined) payload["variants"] = patch.variants;
      if (patch.tags !== undefined) payload["tags"] = patch.tags;
      if (patch.status !== undefined) payload["status"] = patch.status;
      if (patch.seoTitle !== undefined) payload["seo_title"] = patch.seoTitle;
      if (patch.seoDescription !== undefined) payload["seo_description"] = patch.seoDescription;
      if (patch.relatedProductIds !== undefined) payload["related_product_ids"] = patch.relatedProductIds;
      if (patch.orderBumpProductId !== undefined) payload["order_bump_product_id"] = patch.orderBumpProductId;
      if (patch.orderBumpMessage !== undefined) payload["order_bump_message"] = patch.orderBumpMessage;
      if (patch.specs !== undefined) payload["specs"] = patch.specs;
      if (patch.shippingWeight !== undefined) payload["shipping_weight"] = patch.shippingWeight;
      if (patch.shippingLength !== undefined) payload["shipping_length"] = patch.shippingLength;
      if (patch.shippingWidth !== undefined) payload["shipping_width"] = patch.shippingWidth;
      if (patch.shippingHeight !== undefined) payload["shipping_height"] = patch.shippingHeight;

      const { error } = await supabase.from("products").update(payload).eq("id", id);
      if (error) {
        console.warn("Erro ao atualizar produto no Supabase:", error.message);
      }
    } catch (err) {
      console.warn("Exceção ao atualizar produto no Supabase:", err);
    }

    // 2. Atualizar no estado local
    if (existingIndex >= 0) {
      localProductsStore[existingIndex] = updatedProduct;
    } else {
      localProductsStore.unshift(updatedProduct);
    }

    return delay(clone(updatedProduct));
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) {
        console.warn("Erro ao excluir produto no Supabase:", error.message);
      }
    } catch (err) {
      console.warn("Falha de conexão com Supabase ao excluir produto:", err);
    }

    localProductsStore = localProductsStore.filter((p) => p.id !== id);
    return delay(true);
  },

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      const { error } = await supabase.from("products").delete().in("id", ids);
      if (error) {
        console.warn("Erro ao excluir múltiplos produtos no Supabase:", error.message);
      }
    } catch (err) {
      console.warn("Falha ao excluir em lote no Supabase:", err);
    }

    localProductsStore = localProductsStore.filter((p) => !ids.includes(p.id));
    return delay(true);
  },

  async updateStatusMany(ids: string[], status: "active" | "draft" | "archived"): Promise<boolean> {
    try {
      const { error } = await supabase.from("products").update({ status }).in("id", ids);
      if (error) {
        console.warn("Erro ao atualizar status em lote no Supabase:", error.message);
      }
    } catch (err) {
      console.warn("Falha de atualização em lote no Supabase:", err);
    }

    localProductsStore = localProductsStore.map((p) => (ids.includes(p.id) ? { ...p, status } : p));
    return delay(true);
  },

  async featured(limit = 8): Promise<Product[]> {
    const res = await this.list({ collectionSlug: "destaques", perPage: limit });
    return res.data;
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
