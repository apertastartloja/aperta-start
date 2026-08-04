import kitColecionaveis from "@/assets/kits/kit-colecionaveis.jpg";
import kitDecoracao from "@/assets/kits/kit-decoracao.jpg";
import kitOrganizacao from "@/assets/kits/kit-organizacao.jpg";
import type { Collection, Kit } from "@/types";

export const mockCollections: Collection[] = [
  {
    id: "col-destaques",
    name: "Destaques",
    slug: "destaques",
    description: "Os queridinhos da Aperta Start.",
    productIds: ["prd-1", "prd-2", "prd-3", "prd-4", "prd-5"],
  },
  {
    id: "col-lancamentos",
    name: "Lançamentos",
    slug: "lancamentos",
    description: "Chegaram agora na loja.",
    productIds: ["prd-6", "prd-7", "prd-8", "prd-9", "prd-10"],
  },
  {
    id: "col-mais-vendidos",
    name: "Mais vendidos",
    slug: "mais-vendidos",
    description: "O que a comunidade mais leva.",
    productIds: ["prd-1", "prd-4", "prd-5", "prd-7", "prd-2"],
  },
  {
    id: "col-decoracao",
    name: "Decoração gamer",
    slug: "decoracao-gamer",
    productIds: ["prd-4", "prd-6", "prd-10"],
  },
  {
    id: "col-colecionaveis",
    name: "Colecionáveis",
    slug: "colecionaveis",
    productIds: ["prd-3", "prd-12"],
  },
  {
    id: "col-setup",
    name: "Setup completo",
    slug: "setup-completo",
    productIds: ["prd-9", "prd-11"],
  },
];

export const mockKits: Kit[] = [
  {
    id: "kit-1",
    name: "Organização que faz a diferença",
    slug: "kit-organizacao",
    description: "Kits de organização para um setup impecável!",
    image: kitOrganizacao,
    productIds: ["prd-1", "prd-5", "prd-6"],
    price: 219.9,
    compareAtPrice: 249.7,
  },
  {
    id: "kit-2",
    name: "Decore com estilo gamer",
    slug: "kit-decoracao",
    description: "Luminárias incríveis para transformar seu ambiente!",
    image: kitDecoracao,
    productIds: ["prd-4", "prd-10"],
    price: 169.9,
    compareAtPrice: 179.8,
  },
  {
    id: "kit-3",
    name: "Para fãs de verdade",
    slug: "kit-colecionaveis",
    description: "Itens colecionáveis para mostrar sua paixão pelos games!",
    image: kitColecionaveis,
    productIds: ["prd-3", "prd-12"],
    price: 149.9,
    compareAtPrice: 159.8,
  },
];
