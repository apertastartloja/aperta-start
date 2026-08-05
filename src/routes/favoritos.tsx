import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Trash2, ArrowLeft, ChevronRight } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { ProductCard } from "@/components/product/product-card";
import { useWishlistContext } from "@/contexts/wishlist-context";
import { useCartContext } from "@/contexts/cart-context";
import { mockProducts } from "@/mocks/products.mock";
import { toast } from "sonner";

export const Route = createFileRoute("/favoritos")({
  head: () => ({
    meta: [
      { title: "Meus Favoritos — Aperta Start" },
      { name: "description", content: "Confira a sua lista de desejos e produtos salvos na Aperta Start." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist, clear } = useWishlistContext();
  const { addItem } = useCartContext();

  const favoriteProducts = wishlist.items
    .map((item) => mockProducts.find((p) => p.id === item.productId))
    .filter(Boolean) as typeof mockProducts;

  const handleAddAllToCart = () => {
    if (favoriteProducts.length === 0) return;
    favoriteProducts.forEach((product) => {
      addItem({
        productId: product.id,
        quantity: 1,
        unitPrice: product.price,
      });
    });
    toast.success(`${favoriteProducts.length} itens adicionados ao carrinho!`);
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center text-small text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            Início
          </Link>
          <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground/60" />
          <span className="font-medium text-foreground">Meus Favoritos</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="text-caption font-bold text-brand uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="h-4 w-4 fill-brand text-brand" /> Lista de Desejos
            </span>
            <h1 className="text-h1 text-foreground font-extrabold tracking-tight">
              Meus Produtos Favoritos
            </h1>
            <p className="mt-1 text-small text-muted-foreground">
              Você tem <strong className="text-foreground">{favoriteProducts.length}</strong> {favoriteProducts.length === 1 ? "item salvo" : "itens salvos"} na sua lista.
            </p>
          </div>

          {favoriteProducts.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={clear}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-small font-semibold text-muted-foreground hover:text-danger hover:border-danger/30 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Limpar Lista
              </button>
              <button
                onClick={handleAddAllToCart}
                className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-small font-bold text-accent-foreground shadow-sm hover:brightness-105 transition-all"
              >
                <ShoppingCart className="h-4 w-4" />
                Adicionar Todos ao Carrinho
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {favoriteProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favoriteProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-surface p-12 text-center space-y-4 shadow-light">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
              <Heart className="h-8 w-8" />
            </div>
            <h3 className="text-h3 font-bold text-foreground">Sua lista está vazia</h3>
            <p className="text-small text-muted-foreground">
              Você ainda não salvou nenhum produto como favorito. Navegue pela loja e clique no ícone de coração nos produtos que mais gostar!
            </p>
            <Link
              to="/produtos"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-small font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Explorar Catálogo
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
