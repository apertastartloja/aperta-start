import heroSetup from "@/assets/hero-setup.jpg";
import type { Banner, Testimonial } from "@/types";

export const mockBanners: Banner[] = [
  {
    id: "ban-1",
    title: "Organize seu setup. Eleve seu game.",
    subtitle: "Acessórios e decoração gamer desenhados para quem ama jogar.",
    image: heroSetup,
    ctaLabel: "Ver produtos",
    ctaHref: "/loja",
    placement: "hero",
    order: 1,
    active: true,
  },
  {
    id: "ban-2",
    title: "Novo drop de luminárias.",
    subtitle: "Ilumine seu ambiente com peças exclusivas Aperta Start.",
    image: heroSetup,
    ctaLabel: "Conferir agora",
    ctaHref: "/loja",
    placement: "hero",
    order: 2,
    active: true,
  },
  {
    id: "ban-3",
    title: "Kits completos com desconto.",
    subtitle: "Monte seu setup pagando menos em combos selecionados.",
    image: heroSetup,
    ctaLabel: "Ver kits",
    ctaHref: "/loja",
    placement: "hero",
    order: 3,
    active: true,
  },
];

export const mockTestimonials: Testimonial[] = [
  {
    id: "tst-1",
    author: "Rafael Menezes",
    role: "Streamer",
    rating: 5,
    content: "O suporte duplo deixou minha mesa muito mais limpa. Qualidade absurda.",
    createdAt: "2026-03-11T10:00:00.000Z",
  },
  {
    id: "tst-2",
    author: "Camila Duarte",
    role: "Designer & gamer",
    rating: 5,
    content: "As luminárias mudaram completamente o clima do meu quarto.",
    createdAt: "2026-04-02T10:00:00.000Z",
  },
  {
    id: "tst-3",
    author: "Jonas Ribeiro",
    role: "Colecionador",
    rating: 4,
    content: "Entrega rápida e embalagem impecável. Já é minha loja favorita.",
    createdAt: "2026-05-18T10:00:00.000Z",
  },
];
