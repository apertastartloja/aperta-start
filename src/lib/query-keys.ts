import type { ProductQuery } from "@/types";

/** Chaves centralizadas do TanStack Query. */
export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (query: ProductQuery) => ["products", "list", query] as const,
    detail: (slug: string) => ["products", "detail", slug] as const,
    byIds: (ids: string[]) => ["products", "byIds", ids] as const,
    featured: (limit: number) => ["products", "featured", limit] as const,
    related: (id: string) => ["products", "related", id] as const,
    search: (term: string) => ["products", "search", term] as const,
  },
  categories: {
    all: ["categories"] as const,
    tree: ["categories", "tree"] as const,
    detail: (slug: string) => ["categories", "detail", slug] as const,
  },
  collections: { all: ["collections"] as const },
  kits: { all: ["kits"] as const },
  content: {
    banners: (placement?: string) => ["content", "banners", placement ?? "all"] as const,
    testimonials: ["content", "testimonials"] as const,
    benefits: ["content", "benefits"] as const,
    institutional: ["content", "institutional"] as const,
    newsletter: ["content", "newsletter"] as const,
  },
  cart: ["cart"] as const,
  wishlist: ["wishlist"] as const,
  session: ["session"] as const,
  orders: (userId: string) => ["orders", userId] as const,
} as const;
