import { supabase } from "@/lib/supabase";
import { mockCategories } from "@/mocks/categories.mock";
import { mockProducts } from "@/mocks/products.mock";
import { mockBanners, mockTestimonials } from "@/mocks/content.mock";

export async function seedSupabaseDatabase() {
  try {
    console.log("Iniciando povoamento do Supabase...");

    // 1. Seed Categories
    const categoriesPayload = mockCategories.map((c, idx) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? null,
      image: c.image ?? null,
      parent_id: c.parentId ?? null,
      order: idx + 1,
      featured: c.featured ?? false,
    }));

    const { error: catErr } = await supabase
      .from("categories")
      .upsert(categoriesPayload, { onConflict: "id" });

    if (catErr) {
      console.warn("Erro ao cadastrar categorias no Supabase:", catErr.message);
    } else {
      console.log("Categorias populadas com sucesso!");
    }

    // 2. Seed Products
    const productsPayload = mockProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      description: p.description,
      short_description: p.shortDescription ?? null,
      price: p.price,
      compare_at_price: p.compareAtPrice ?? null,
      category_id: p.categoryId,
      collection_ids: p.collectionIds,
      images: p.images,
      badges: p.badges,
      rating: p.rating,
      reviews_count: p.reviewsCount,
      stock: p.stock,
      variants: p.variants,
      tags: p.tags,
    }));

    const { error: prodErr } = await supabase
      .from("products")
      .upsert(productsPayload, { onConflict: "id" });

    if (prodErr) {
      console.warn("Erro ao cadastrar produtos no Supabase:", prodErr.message);
    } else {
      console.log("Produtos populados com sucesso no Supabase!");
    }

    // 3. Seed Banners
    const bannersPayload = mockBanners.map((b, idx) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle ?? null,
      image: b.image,
      cta_label: b.ctaLabel ?? null,
      cta_href: b.ctaHref ?? null,
      placement: b.placement,
      order: idx + 1,
      active: true,
    }));

    const { error: banErr } = await supabase
      .from("banners")
      .upsert(bannersPayload, { onConflict: "id" });

    if (banErr) {
      console.warn("Erro ao cadastrar banners no Supabase:", banErr.message);
    } else {
      console.log("Banners populados no Supabase!");
    }

    return { success: true };
  } catch (err: any) {
    console.error("Erro geral no seeding do Supabase:", err);
    return { success: false, error: err.message };
  }
}
