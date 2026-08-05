export const APP = {
  name: "Aperta Start",
  tagline: "Acessórios e decoração gamer para elevar seu setup e sua experiência de jogo!",
  supportPhone: "0800 123 4567",
  supportEmail: "ola@apertastart.com.br",
} as const;

/** Rotas centralizadas — as telas serão criadas nas próximas etapas. */
export const ROUTES = {
  home: "/",
  shop: "/produtos",
  product: "/produto",
  cart: "/carrinho",
  checkout: "/checkout",
  account: "/minha-conta",
  wishlist: "/favoritos",
  orders: "/minha-conta/pedidos",
  auth: "/entrar",
} as const;

export const CURRENCY = { locale: "pt-BR", code: "BRL" } as const;

export const INSTALLMENTS = { max: 6, minValue: 10, interestFree: true } as const;

export const SHIPPING = { freeAbove: 199, flatRate: 19.9 } as const;

export const PIX_DISCOUNT = 0.05;

export const MAIN_MENU = [
  { label: "Início", href: "/" },
  { label: "Catálogo", href: "/produtos" },
  { label: "Lançamentos", href: "/produtos" },
  { label: "Sobre nós", href: "/sobre" },
  { label: "Contato", href: "/contato" },
  { label: "Checkout", href: "/checkout" },
] as const;

export const PAGINATION = { perPage: 12 } as const;

export const SORT_OPTIONS = [
  { value: "relevance", label: "Mais relevantes" },
  { value: "newest", label: "Lançamentos" },
  { value: "priceAsc", label: "Menor preço" },
  { value: "priceDesc", label: "Maior preço" },
  { value: "rating", label: "Melhor avaliados" },
] as const;

export const STORAGE_KEYS = {
  cart: "aperta:cart",
  wishlist: "aperta:wishlist",
  theme: "aperta:theme",
  auth: "aperta:auth",
  recentSearches: "aperta:recent-searches",
} as const;

/** Latência simulada dos mocks (ms). */
export const MOCK_DELAY = 220;
