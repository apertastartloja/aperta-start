import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Trash2, ArrowLeft, ChevronRight, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { Container } from "@/components/common/container";
import { MainLayout } from "@/components/layout/main-layout";
import { ProductCard } from "@/components/product/product-card";
import { useWishlistContext } from "@/contexts/wishlist-context";
import { useCart } from "@/hooks/useCart";
import { useFeaturedProducts, useProductsByIds } from "@/hooks/useProducts";
import { mockProducts } from "@/mocks/products.mock";
import { formatCurrency } from "@/utils/format";

export const Route = createFileRoute("/favoritos")({
  head: () => ({
    meta: [
      { title: "Meus Favoritos — Aperta Start" },
      { name: "description", content: "Confira sua lista de desejos e produtos salvos na Aperta Start." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist, clear, isLoading: isWishlistLoading } = useWishlistContext();
  const { addItem, openMiniCart } = useCart();
  const { data: featuredProducts = [] } = useFeaturedProducts(4);

  const productIds = useMemo(() => wishlist.items.map((item) => item.productId), [wishlist.items]);
  const { data: loadedProducts, isLoading: isProductsLoading } = useProductsByIds(productIds);

  const favoriteProducts = useMemo(() => {
    if (loadedProducts && loadedProducts.length > 0) {
      return loadedProducts;
    }
    return productIds
      .map((id) => mockProducts.find((p) => p.id === id))
      .filter(Boolean) as typeof mockProducts;
  }, [loadedProducts, productIds]);

  const isLoading =
    isWishlistLoading || (productIds.length > 0 && isProductsLoading && favoriteProducts.length === 0);

  const totalValue = useMemo(() => {
    return favoriteProducts.reduce((acc, item) => acc + item.price, 0);
  }, [favoriteProducts]);

  const handleAddAllToCart = () => {
    if (favoriteProducts.length === 0) return;
    favoriteProducts.forEach((product) => {
      addItem({
        productId: product.id,
        quantity: 1,
        unitPrice: product.price,
      });
    });
    toast.success(
      `${favoriteProducts.length} ${
        favoriteProducts.length === 1 ? "produto adicionado" : "produtos adicionados"
      } ao carrinho!`,
    );
    openMiniCart();
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-background py-8">
        <Container>
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center text-small text-muted-foreground">
            <Link to="/" className="transition-colors hover:text-foreground">
              Início
            </Link>
            <ChevronRight className="mx-2 size-4 text-muted-foreground/60" />
            <span className="font-medium text-foreground">Meus Favoritos</span>
          </nav>

          {/* Header Section */}
          <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent-foreground uppercase tracking-wider">
                  <Heart className="size-3.5 fill-accent text-accent" /> Lista de Desejos
                </span>
                {favoriteProducts.length > 0 && (
                  <span className="text-xs font-medium text-muted-foreground">
                    • Total estimado: <strong className="text-primary">{formatCurrency(totalValue)}</strong>
                  </span>
                )}
              </div>
              <h1 className="text-h2 font-extrabold text-foreground tracking-tight">
                Meus Produtos Favoritos
              </h1>
              <p className="text-small text-muted-foreground">
                {favoriteProducts.length === 0 ? (
                  "Você ainda não possui itens na sua lista."
                ) : (
                  <>
                    Você tem <strong className="text-foreground">{favoriteProducts.length}</strong>{" "}
                    {favoriteProducts.length === 1 ? "item salvo" : "itens salvos"}.
                  </>
                )}
              </p>
            </div>

            {favoriteProducts.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={clear}
                  className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-small font-semibold text-muted-foreground hover:border-danger/30 hover:text-danger transition-all cursor-pointer"
                >
                  <Trash2 className="size-4" />
                  Limpar Lista
                </button>
                <button
                  type="button"
                  onClick={handleAddAllToCart}
                  className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-small font-bold text-accent-foreground shadow-sm hover:brightness-105 transition-all cursor-pointer"
                >
                  <ShoppingCart className="size-4" />
                  Adicionar Todos ao Carrinho
                </button>
              </div>
            )}
          </div>

          {/* Grid or Empty State */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-80 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : favoriteProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {favoriteProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="space-y-12 py-4">
              <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-border bg-surface p-8 text-center space-y-5 shadow-xs sm:p-12">
                <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Heart className="size-10 fill-accent/20" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-h3 font-bold text-foreground">Sua lista está vazia</h2>
                  <p className="text-small text-muted-foreground">
                    Você ainda não salvou nenhum produto como favorito. Clique no ícone de coração nos produtos da loja para montar sua lista de desejos!
                  </p>
                </div>
                <Link
                  to="/loja"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-small font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
                >
                  <ArrowLeft className="size-4" />
                  Explorar Loja
                </Link>
              </div>

              {/* Recommended Section */}
              {featuredProducts.length > 0 && (
                <div className="space-y-6 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-h3 font-extrabold text-foreground flex items-center gap-2">
                        <Sparkles className="size-5 text-accent" /> Recomendados para o seu Setup
                      </h2>
                      <p className="text-small text-muted-foreground">
                        Confira estes produtos em destaque e adicione aos seus favoritos
                      </p>
                    </div>
                    <Link
                      to="/loja"
                      className="text-small font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      Ver todos <ChevronRight className="size-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {featuredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Container>
      </div>
    </MainLayout>
  );
}
