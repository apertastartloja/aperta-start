# Arquitetura — Aperta Start

Fundação do e-commerce. Nenhuma tela foi criada nesta etapa.

```
src/
  assets/        imagens importadas por componentes
  components/
    ui/          shadcn/ui (base, não editar sem necessidade)
    common/      Container, SectionTitle, Price, Rating, Modal, Drawer, Pagination...
    forms/       campos conectados a React Hook Form + schemas Zod
    layout/      TopBar, Header, Navigation, MegaMenu, Search, MiniCart, MobileMenu, Footer, Newsletter
    product/     ProductCard/Grid/Carousel, Badge, Price, Actions, Wishlist, AddToCart, Quantity
    home/        blocos exclusivos da home (próxima etapa)
  contexts/      ThemeProvider, AuthProvider, CartProvider, WishlistProvider, AppProviders
  hooks/         useCart, useWishlist, useProducts, useCategories, useOrders, useSearch, useAuth
  services/      ProductService, CategoryService, CartService, OrderService, UserService...
  mocks/         dados mockados por domínio
  types/         contratos de domínio
  constants/     rotas, moeda, frete, paginação, storage keys
  utils/         formatação e helpers puros
  lib/           utilitários de infra (cn, query-keys)
  routes/        rotas (TanStack Router) — telas nas próximas etapas
```

## Regras

1. Páginas só montam componentes. Lógica vive em hooks/services/utils/contexts.
2. Toda leitura/escrita de dados passa por um Service. Componentes nunca importam mocks.
3. Cores, tipografia, raios e sombras só via tokens de `src/styles.css`. Nada de HEX solto.
4. Tipagem forte: todos os contratos em `src/types`.

## Migração para Lovable Cloud (Supabase)

Os services já têm a assinatura final. Para migrar, troque apenas o corpo dos métodos:

```ts
// hoje
async list(query) { return delay(paginate(applyQuery(query))) }
// depois
async list(query) { const { data } = await supabase.from("products").select("*")...; return paginate(data) }
```

Hooks, componentes e páginas permanecem inalterados.

## Roteamento

O projeto usa **TanStack Router** (file-based, `src/routes/`), equivalente ao React Router para o que precisamos.
