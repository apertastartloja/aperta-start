import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, MapPin, Sparkles } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useRef, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants";
import { useBanners } from "@/hooks/useContent";

const HERO_HIGHLIGHTS = [
  { icon: Sparkles, label: "Design exclusivo" },
  { icon: MapPin, label: "Produzido no Brasil" },
  { icon: BadgeCheck, label: "Feito com qualidade" },
];

/** Seção 3: banner principal full-bleed logo abaixo do header. */
export function HeroCarousel() {
  const { data: banners = [], isLoading } = useBanners("hero");
  const autoplay = useRef(Autoplay({ delay: 6000, stopOnInteraction: true }));
  const [api, setApi] = useState<Parameters<
    NonNullable<Parameters<typeof Carousel>[0]["setApi"]>
  >[0]>();
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  if (isLoading) {
    return <Skeleton className="h-[520px] w-full" />;
  }

  if (!banners.length) return null;

  return (
    <section aria-label="Destaques da loja" className="relative w-full">
      <Carousel
        opts={{ loop: true }}
        plugins={[autoplay.current]}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent className="ml-0">
          {banners.map((banner) => (
            <CarouselItem key={banner.id} className="pl-0">
              <div className="relative h-[520px] w-full overflow-hidden bg-secondary">
                <img
                  src={banner.image}
                  alt={banner.title}
                  width={1920}
                  height={1040}
                  className="size-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/80 to-transparent" />

                <div className="absolute inset-0">
                  <div className="mx-auto flex h-full w-full max-w-[1440px] flex-col justify-center gap-5 px-10 text-secondary-foreground">
                    <h2 className="text-display max-w-xl">{banner.title}</h2>
                    {banner.subtitle ? (
                      <p className="text-body max-w-md opacity-90">{banner.subtitle}</p>
                    ) : null}
                    {banner.ctaLabel ? (
                      <Link
                        to={ROUTES.home}
                        className="text-button inline-flex h-12 w-fit items-center gap-2 rounded-md bg-accent px-7 text-accent-foreground transition-opacity hover:opacity-90"
                      >
                        {banner.ctaLabel}
                        <ArrowRight className="size-4" aria-hidden />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Indicadores */}
      <div className="pointer-events-none absolute inset-x-0 bottom-20 flex justify-center gap-2">
        {banners.map((banner, index) => (
          <button
            key={banner.id}
            type="button"
            aria-label={`Ir para o banner ${index + 1}`}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "pointer-events-auto size-2 rounded-full transition-all",
              index === selected
                ? "w-6 bg-accent"
                : "bg-secondary-foreground/40 hover:bg-secondary-foreground/70",
            )}
          />
        ))}
      </div>

      {/* Lista de benefícios na base da hero */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center gap-8 px-10 pb-8 text-secondary-foreground">
          {HERO_HIGHLIGHTS.map(({ icon: Icon, label }) => (
            <span key={label} className="text-small flex items-center gap-2 opacity-90">
              <Icon className="size-4 text-accent" aria-hidden />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
