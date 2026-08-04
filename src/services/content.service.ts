import { supabase } from "@/lib/supabase";
import {
  mockBanners,
  mockBenefits,
  mockInstitutional,
  mockNewsletter,
  mockTestimonials,
} from "@/mocks";
import type {
  Banner,
  Benefit,
  InstitutionalItem,
  NewsletterContent,
  Testimonial,
} from "@/types";
import { clone, delay } from "./base.service";

export const ContentService = {
  async banners(placement?: Banner["placement"]): Promise<Banner[]> {
    try {
      let query = supabase.from("banners").select("*").eq("active", true).order("order", { ascending: true });
      if (placement) {
        query = query.eq("placement", placement);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((b) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle ?? undefined,
          image: b.image,
          ctaLabel: b.cta_label ?? undefined,
          ctaHref: b.cta_href ?? undefined,
          placement: b.placement,
          order: b.order ?? 0,
          active: b.active ?? true,
        }));
      }
    } catch {
      // Fallback
    }

    const items = clone(mockBanners)
      .filter((b) => b.active && (!placement || b.placement === placement))
      .sort((a, b) => a.order - b.order);
    return delay(items);
  },

  async testimonials(limit?: number): Promise<Testimonial[]> {
    try {
      const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        const mapped: Testimonial[] = data.map((t) => ({
          id: t.id,
          author: t.author,
          role: t.role ?? undefined,
          avatar: t.avatar ?? undefined,
          rating: t.rating ?? 5,
          content: t.content,
          createdAt: t.created_at,
        }));
        return limit ? mapped.slice(0, limit) : mapped;
      }
    } catch {
      // Fallback
    }

    const items = clone(mockTestimonials);
    return delay(limit ? items.slice(0, limit) : items);
  },

  async benefits(): Promise<Benefit[]> {
    return delay(clone(mockBenefits));
  },

  async institutional(): Promise<InstitutionalItem[]> {
    return delay(clone(mockInstitutional));
  },

  async newsletter(): Promise<NewsletterContent> {
    return delay(clone(mockNewsletter));
  },
};
