import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { ContentService } from "@/services";
import type { Banner } from "@/types";

export function useBanners(placement?: Banner["placement"]) {
  return useQuery({
    queryKey: queryKeys.content.banners(placement),
    queryFn: () => ContentService.banners(placement),
  });
}

export function useTestimonials(limit?: number | undefined) {
  return useQuery({
    queryKey: queryKeys.content.testimonials,
    queryFn: () => ContentService.testimonials(limit),
  });
}

export function useBenefits() {
  return useQuery({
    queryKey: queryKeys.content.benefits,
    queryFn: () => ContentService.benefits(),
  });
}

export function useInstitutional() {
  return useQuery({
    queryKey: queryKeys.content.institutional,
    queryFn: () => ContentService.institutional(),
  });
}

export function useNewsletterContent() {
  return useQuery({
    queryKey: queryKeys.content.newsletter,
    queryFn: () => ContentService.newsletter(),
  });
}
