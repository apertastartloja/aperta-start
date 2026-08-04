import type { Benefit, InstitutionalItem, NewsletterContent } from "@/types";

/** Barra escura de benefícios (seção 6 da Home). */
export const mockBenefits: Benefit[] = [
  {
    id: "ben-1",
    icon: "package",
    title: "Produzidos no Brasil",
    description: "Com orgulho e atenção aos detalhes",
  },
  {
    id: "ben-2",
    icon: "trophy",
    title: "Design exclusivo Aperta Start",
    description: "Produtos únicos para seu setup",
  },
  {
    id: "ben-3",
    icon: "shield",
    title: "Materiais de alta qualidade",
    description: "Duráveis, resistentes e feitos para durar",
  },
  {
    id: "ben-4",
    icon: "lock",
    title: "Compra segura e garantida",
    description: "Seus dados sempre protegidos",
  },
];

/** Barra institucional clara (seção 10 da Home) e Top Bar (seção 1). */
export const mockInstitutional: InstitutionalItem[] = [
  { id: "ins-1", icon: "truck", title: "Frete para todo Brasil", description: "Consulte condições" },
  { id: "ins-2", icon: "creditCard", title: "Parcele em até 6x", description: "sem juros" },
  { id: "ins-3", icon: "pix", title: "5% de desconto", description: "no PIX" },
  { id: "ins-4", icon: "refresh", title: "Troca fácil", description: "em até 7 dias" },
];

export const mockNewsletter: NewsletterContent = {
  title: "Promoções & Novidades",
  subtitle: "Assine e receba ofertas exclusivas!",
  placeholder: "Seu melhor e-mail",
  ctaLabel: "Assinar",
};
