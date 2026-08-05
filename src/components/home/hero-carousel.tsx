import { Link } from "@tanstack/react-router";
import { ArrowRight, Package, Trophy, ShieldCheck, RefreshCw } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useRef, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useBanners } from "@/hooks/useContent";

const HERO_BENEFITS = [
  {
    icon: Package,
    title: "Design exclusivo",
    subtitle: "Aperta Start",
  },
  {
    icon: Trophy,
    title: "Produzido no Brasil",
    subtitle: null,
  },
  {
    icon: ShieldCheck,
    title: "Feito com qualidade",
    subtitle: null,
  },
  {
    icon: RefreshCw,
    title: "Materiais premium",
    subtitle: "e duráveis",
  },
];

/**
 * Seção Hero: banner principal reconstruído conforme layout de referência.
 *
 * Otimizado para notebooks (1366×768 e 1440×900):
 * A Hero inteira (banner + benefícios) deve caber na primeira dobra,
 * permitindo visualizar o início da seção "Destaques" sem rolar.
 *
 * Budget vertical para 768px (viewport real ~673px com chrome do browser):
 *   Top Bar (36) + Header (96) + Nav (56) = 188px
 *   Disponível: 673 - 188 = ~485px
 *   Hero banner: ~340px  |  Benefits bar: ~52px  |  Início Destaques: ~90px
 */
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
    return <Skeleton className="h-[290px] w-full bg-[#060B14]" />;
  }

  if (!banners.length) return null;

  return (
    <section aria-label="Destaques da loja" className="relative w-full bg-[#060B14]">
      {/* ── Carousel / Banner ─────────────────────────────── */}
      <div className="relative w-full overflow-hidden">
        <Carousel
          opts={{ loop: true }}
          plugins={[autoplay.current]}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="ml-0">
            {banners.map((banner) => {
              const titleMain = banner.title || "Organize\nseu setup.";
              const highlight = banner.highlightText || "Eleve seu game.";

              return (
                <CarouselItem key={banner.id} className="pl-0">
                  {/*
                    Altura otimizada para notebooks:
                    - lg (1366-1440): 340px → cabe na primeira dobra com benefícios + destaques
                    - xl (1920+): 420px → mais respiro em monitores grandes
                  */}
                  <div className="relative h-[280px] lg:h-[290px] xl:h-[400px] w-full overflow-hidden bg-[#060B14]">
                    {/* Setup Photograph Right (~65% width) */}
                    <img
                      src={banner.image}
                      alt={banner.title}
                      width={1920}
                      height={1040}
                      className="absolute right-0 top-0 h-full w-full md:w-[65%] object-cover object-center"
                    />

                    {/* Dark Gradient Overlay Left */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#060B14] via-[#060B14]/95 via-[38%] lg:via-[42%] to-transparent z-10 pointer-events-none" />

                    {/* Top/Bottom Gradient Fades */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#060B14]/30 via-transparent to-[#060B14]/70 z-10 pointer-events-none" />

                    {/* Text Content Area */}
                    <div className="relative z-20 mx-auto flex h-full w-full max-w-[1440px] flex-col justify-center px-6 sm:px-10 lg:px-14 pb-4">
                      <div className="max-w-xl">
                        {/* Title — white + yellow highlight */}
                        <h1 className="text-[1.5rem] sm:text-[1.75rem] lg:text-[2rem] xl:text-[2.5rem] font-bold tracking-tight text-white leading-[1.1] font-sans">
                          {titleMain.split("\n").map((line, idx) => (
                            <span key={idx} className="block">
                              {line}
                            </span>
                          ))}
                          {highlight ? (
                            <span className="block text-[#FFC107]">
                              {highlight}
                            </span>
                          ) : null}
                        </h1>

                        {/* Subtitle */}
                        {banner.subtitle ? (
                          <p className="mt-1.5 mb-3 max-w-[350px] text-[12px] lg:text-[13px] text-slate-300 font-normal leading-relaxed opacity-90">
                            {banner.subtitle}
                          </p>
                        ) : null}

                        {/* CTA Button */}
                        {banner.ctaLabel ? (
                          <Link
                            to={banner.ctaHref || "/produtos"}
                            className="inline-flex h-9 lg:h-10 items-center gap-2 rounded-lg bg-[#FFC107] px-5 text-[13px] font-bold text-slate-950 shadow-lg shadow-amber-500/10 transition-all hover:bg-[#FFB700] hover:scale-[1.02] active:scale-[0.98] w-fit"
                          >
                            <span>{banner.ctaLabel}</span>
                            <ArrowRight className="size-4 stroke-[2.5]" aria-hidden />
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        {/* Slider Indicators — Centered at bottom of banner */}
        <div className="pointer-events-none absolute inset-x-0 bottom-2.5 z-30 flex justify-center items-center gap-2">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              aria-label={`Ir para o banner ${index + 1}`}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "pointer-events-auto h-2 rounded-full transition-all duration-300",
                index === selected
                  ? "w-6 bg-[#FFC107]"
                  : "w-2 bg-white/50 hover:bg-white/90",
              )}
            />
          ))}
        </div>
      </div>

      {/* ── Benefits Bar ──────────────────────────────────── */}
      <div className="relative z-30 w-full bg-[#091122]/90 backdrop-blur-sm border-t border-white/8">
        <div className="mx-auto max-w-[1440px] flex items-center justify-between px-6 sm:px-10 lg:px-14 py-2.5">
          {HERO_BENEFITS.map(({ icon: Icon, title, subtitle }, index) => (
            <div
              key={title}
              className={cn(
                "flex items-center gap-3 flex-1 justify-center py-0.5 px-2",
                index < HERO_BENEFITS.length - 1 && "md:border-r md:border-white/10",
              )}
            >
              <Icon className="size-[18px] text-[#FFC107] shrink-0 stroke-[1.75]" aria-hidden />
              <div className="flex flex-col text-left">
                <span className="text-[11px] lg:text-xs font-bold text-white leading-tight">
                  {title}
                </span>
                {subtitle ? (
                  <span className="text-[10px] text-slate-300 font-normal opacity-85 leading-tight">
                    {subtitle}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
