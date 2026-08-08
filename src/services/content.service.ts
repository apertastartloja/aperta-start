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

import { BannerService } from "./banner.service";

export const ContentService = {
  async banners(placement?: Banner["placement"]): Promise<Banner[]> {
    return BannerService.listActive(placement);
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
