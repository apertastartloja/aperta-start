import { supabase } from "@/lib/supabase";
import { mockBanners } from "@/mocks";
import type { Banner } from "@/types";
import { NotFoundError, clone, delay } from "./base.service";

let localBannersStore: Banner[] = clone(mockBanners);

export const BannerService = {
  async fetchFromSupabase(): Promise<Banner[] | null> {
    try {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("order", { ascending: true });

      if (!error && data) {
        const fetched: Banner[] = data.map((b) => ({
          id: b.id,
          title: b.title,
          highlightText: b.highlight_text ?? undefined,
          subtitle: b.subtitle ?? undefined,
          image: b.image,
          ctaLabel: b.cta_label ?? undefined,
          ctaHref: b.cta_href ?? undefined,
          placement: b.placement,
          order: b.order ?? 0,
          active: b.active ?? true,
        }));
        
        localBannersStore = fetched;
        return localBannersStore;
      }
    } catch (err) {
      console.warn("Aviso ao buscar banners do Supabase, utilizando estado local:", err);
    }
    return localBannersStore;
  },

  async listAll(): Promise<Banner[]> {
    await this.fetchFromSupabase();
    return delay(clone(localBannersStore).sort((a, b) => a.order - b.order));
  },

  async listActive(placement?: Banner["placement"]): Promise<Banner[]> {
    await this.fetchFromSupabase();
    const items = localBannersStore
      .filter((b) => b.active && (!placement || b.placement === placement))
      .sort((a, b) => a.order - b.order);
    return delay(clone(items));
  },

  async getById(id: string): Promise<Banner> {
    await this.fetchFromSupabase();
    const banner = localBannersStore.find((b) => b.id === id);
    if (!banner) throw new NotFoundError("Banner", id);
    return delay(clone(banner));
  },

  async create(input: Omit<Banner, "id">): Promise<Banner> {
    const newId = `ban-${Date.now()}`;
    const newBanner: Banner = {
      ...input,
      id: newId,
    };

    try {
      const payload = {
        id: newBanner.id,
        title: newBanner.title,
        highlight_text: newBanner.highlightText ?? null,
        subtitle: newBanner.subtitle ?? null,
        image: newBanner.image,
        cta_label: newBanner.ctaLabel ?? null,
        cta_href: newBanner.ctaHref ?? null,
        placement: newBanner.placement,
        order: newBanner.order,
        active: newBanner.active,
      };

      const { error } = await supabase.from("banners").insert(payload);
      if (error) console.warn("Erro ao inserir banner no Supabase:", error.message);
    } catch (err) {
      console.warn("Exceção ao criar banner no Supabase:", err);
    }

    localBannersStore = [newBanner, ...localBannersStore];
    return delay(clone(newBanner));
  },

  async update(id: string, patch: Partial<Banner>): Promise<Banner> {
    const idx = localBannersStore.findIndex((b) => b.id === id);
    if (idx < 0) throw new NotFoundError("Banner", id);

    const updated: Banner = {
      ...localBannersStore[idx]!,
      ...patch,
    };

    try {
      const payload: Record<string, any> = {};
      if (patch.title !== undefined) payload["title"] = patch.title;
      if (patch.highlightText !== undefined) payload["highlight_text"] = patch.highlightText;
      if (patch.subtitle !== undefined) payload["subtitle"] = patch.subtitle;
      if (patch.image !== undefined) payload["image"] = patch.image;
      if (patch.ctaLabel !== undefined) payload["cta_label"] = patch.ctaLabel;
      if (patch.ctaHref !== undefined) payload["cta_href"] = patch.ctaHref;
      if (patch.placement !== undefined) payload["placement"] = patch.placement;
      if (patch.order !== undefined) payload["order"] = patch.order;
      if (patch.active !== undefined) payload["active"] = patch.active;

      const { error } = await supabase.from("banners").update(payload).eq("id", id);
      if (error) console.warn("Erro ao atualizar banner no Supabase:", error.message);
    } catch (err) {
      console.warn("Exceção ao atualizar banner no Supabase:", err);
    }

    localBannersStore[idx] = updated;
    return delay(clone(updated));
  },

  async toggleActive(id: string): Promise<Banner> {
    const banner = localBannersStore.find((b) => b.id === id);
    if (!banner) throw new NotFoundError("Banner", id);
    return this.update(id, { active: !banner.active });
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) console.warn("Erro ao excluir banner no Supabase:", error.message);
    } catch (err) {
      console.warn("Exceção ao excluir banner no Supabase:", err);
    }

    localBannersStore = localBannersStore.filter((b) => b.id !== id);
    return delay(true);
  },
};
