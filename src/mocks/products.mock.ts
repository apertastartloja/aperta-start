import actionFigure from "@/assets/products/action-figure.jpg";
import caixaBarril from "@/assets/products/caixa-barril.jpg";
import caixaCogumelo from "@/assets/products/caixa-cogumelo.jpg";
import caixaMascara from "@/assets/products/caixa-mascara.jpg";
import chaveiroControle from "@/assets/products/chaveiro-controle.jpg";
import luminariaBloco from "@/assets/products/luminaria-bloco.jpg";
import luminariaGameOver from "@/assets/products/luminaria-game-over.jpg";
import portaHeadset from "@/assets/products/porta-headset.jpg";
import suporteDuplo from "@/assets/products/suporte-duplo.jpg";
import suporteHeadsetRgb from "@/assets/products/suporte-headset-rgb.jpg";
import type { Product, ProductBadgeType } from "@/types";
import { slugify } from "@/utils/format";

interface Seed {
  id: string;
  name: string;
  image: string;
  categoryId: string;
  collectionIds: string[];
  price: number;
  costPrice?: number;
  supplierId?: string;
  compareAtPrice?: number | null;
  rating: number;
  reviewsCount: number;
  stock: number;
  badges: ProductBadgeType[];
  tags: string[];
  shortDescription: string;
}

const seeds: Seed[] = [
  {
    id: "prd-1",
    name: "Suporte Duplo para Controles",
    image: suporteDuplo,
    categoryId: "cat-1-1",
    collectionIds: ["col-destaques", "col-mais-vendidos"],
    price: 69.9,
    costPrice: 28.0,
    supplierId: "sup-1",
    compareAtPrice: 89.9,
    rating: 4.9,
    reviewsCount: 214,
    stock: 34,
    badges: ["new", "bestseller"],
    tags: ["suporte", "controle", "setup"],
    shortDescription: "Organiza dois controles com base antiderrapante.",
  },
  {
    id: "prd-2",
    name: "Chaveiro Controle 8-Bits",
    image: chaveiroControle,
    categoryId: "cat-5",
    collectionIds: ["col-destaques", "col-mais-vendidos"],
    price: 24.9,
    rating: 4.7,
    reviewsCount: 320,
    stock: 180,
    badges: ["new"],
    tags: ["chaveiro", "retro", "8-bits"],
    shortDescription: "Chaveiro em relevo inspirado nos consoles clássicos.",
  },
  {
    id: "prd-3",
    name: "Action Figure Crash Bandicoot",
    image: actionFigure,
    categoryId: "cat-4-1",
    collectionIds: ["col-destaques", "col-colecionaveis"],
    price: 129.9,
    rating: 4.8,
    reviewsCount: 76,
    stock: 22,
    badges: ["new", "exclusive"],
    tags: ["colecionavel", "figure"],
    shortDescription: "Colecionável com base preta e pintura à mão.",
  },
  {
    id: "prd-4",
    name: "Luminária Bloco de Interrogação",
    image: luminariaBloco,
    categoryId: "cat-2-1",
    collectionIds: ["col-destaques", "col-mais-vendidos", "col-decoracao"],
    price: 89.9,
    compareAtPrice: 109.9,
    rating: 4.9,
    reviewsCount: 189,
    stock: 40,
    badges: ["new", "bestseller"],
    tags: ["luminaria", "decoracao"],
    shortDescription: "Luz quente com toque na base e cabo USB.",
  },
  {
    id: "prd-5",
    name: "Porta Headset Play",
    image: portaHeadset,
    categoryId: "cat-1-2",
    collectionIds: ["col-destaques", "col-mais-vendidos"],
    price: 79.9,
    rating: 4.6,
    reviewsCount: 143,
    stock: 55,
    badges: [],
    tags: ["headset", "suporte"],
    shortDescription: "Suporte em aço com acabamento fosco.",
  },
  {
    id: "prd-6",
    name: "Caixa Donkey Kong Porta-Trecos",
    image: caixaBarril,
    categoryId: "cat-3-1",
    collectionIds: ["col-lancamentos", "col-decoracao"],
    price: 99.9,
    rating: 4.7,
    reviewsCount: 54,
    stock: 30,
    badges: ["new"],
    tags: ["caixa", "organizador"],
    shortDescription: "Barril em madeira para cabos e acessórios.",
  },
  {
    id: "prd-7",
    name: "Caixa Item Super Mario",
    image: caixaCogumelo,
    categoryId: "cat-3-1",
    collectionIds: ["col-lancamentos", "col-mais-vendidos"],
    price: 89.9,
    rating: 4.8,
    reviewsCount: 97,
    stock: 44,
    badges: ["new"],
    tags: ["caixa", "cogumelo"],
    shortDescription: "Organizador temático com tampa removível.",
  },
  {
    id: "prd-8",
    name: "Caixa Item Crash Bandicoot",
    image: caixaMascara,
    categoryId: "cat-3-1",
    collectionIds: ["col-lancamentos"],
    price: 89.9,
    rating: 4.5,
    reviewsCount: 38,
    stock: 26,
    badges: ["new"],
    tags: ["caixa", "madeira"],
    shortDescription: "Caixa em madeira com aplique da máscara.",
  },
  {
    id: "prd-9",
    name: "Suporte para Headset RGB",
    image: suporteHeadsetRgb,
    categoryId: "cat-1-2",
    collectionIds: ["col-lancamentos", "col-setup"],
    price: 139.9,
    compareAtPrice: 169.9,
    rating: 4.9,
    reviewsCount: 61,
    stock: 18,
    badges: ["new", "sale"],
    tags: ["rgb", "headset"],
    shortDescription: "Base iluminada com 7 modos de LED.",
  },
  {
    id: "prd-10",
    name: "Luminária Game Over",
    image: luminariaGameOver,
    categoryId: "cat-2-2",
    collectionIds: ["col-lancamentos", "col-decoracao"],
    price: 89.9,
    rating: 4.6,
    reviewsCount: 72,
    stock: 33,
    badges: ["new"],
    tags: ["luminaria", "pixel"],
    shortDescription: "Painel pixel art em LED vermelho.",
  },
  {
    id: "prd-11",
    name: "Suporte Duplo Pro para Controles",
    image: suporteDuplo,
    categoryId: "cat-1-1",
    collectionIds: ["col-setup"],
    price: 84.9,
    rating: 4.7,
    reviewsCount: 45,
    stock: 21,
    badges: ["exclusive"],
    tags: ["suporte", "pro"],
    shortDescription: "Versão reforçada com carregamento por indução.",
  },
  {
    id: "prd-12",
    name: "Chaveiro Controle Retrô Gold",
    image: chaveiroControle,
    categoryId: "cat-5",
    collectionIds: ["col-colecionaveis"],
    price: 29.9,
    compareAtPrice: 39.9,
    rating: 4.4,
    reviewsCount: 118,
    stock: 90,
    badges: ["sale"],
    tags: ["chaveiro", "gold"],
    shortDescription: "Edição dourada limitada.",
  },
];

export const mockProducts: Product[] = seeds.map((seed, index) => ({
  ...seed,
  slug: slugify(seed.name),
  sku: `APS-${1000 + index}`,
  compareAtPrice: seed.compareAtPrice ?? null,
  description:
    "Acessório Aperta Start com design exclusivo, produzido no Brasil com materiais de alta qualidade para elevar o seu setup.",
  images: [
    { id: `${seed.id}-img-1`, url: seed.image, alt: seed.name },
    { id: `${seed.id}-img-2`, url: seed.image, alt: `${seed.name} — detalhe` },
  ],
  variants: [],
  createdAt: new Date(2026, 0, 1 + index).toISOString(),
}));
