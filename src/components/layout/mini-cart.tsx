import { Link } from "@tanstack/react-router";
import { Trash2, ShoppingBag, ArrowRight, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Drawer } from "@/components/common/drawer";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { useCartContext } from "@/contexts/cart-context";
import { ProductService } from "@/services/product.service";
import { formatCurrency } from "@/utils/format";

export function MiniCart() {
  const { cart, totals, isMiniCartOpen, closeMiniCart, updateQuantity, removeItem } = useCart();
  const { addItem } = useCartContext();

  // Fetch all products from Supabase to resolve product data
  const { data: productsData } = useQuery({
    queryKey: ["products", "mini-cart"],
    queryFn: () => ProductService.list({ perPage: 200 }),
    enabled: isMiniCartOpen,
  });

  const allProducts = productsData?.data ?? [];

  const cartItemsWithProduct = cart.items.map((item) => {
    const product = allProducts.find((p) => p.id === item.productId);
    return { ...item, product: product ?? null };
  });

  // Find Order Bump: look for a bump defined on any product in the cart
  const orderBumpProduct = (() => {
    for (const item of cart.items) {
      const cartProduct = allProducts.find((p) => p.id === item.productId);
      if (cartProduct?.orderBumpProductId) {
        const bumpProduct = allProducts.find((p) => p.id === cartProduct.orderBumpProductId);
        const alreadyInCart = cart.items.some((ci) => ci.productId === cartProduct.orderBumpProductId);
        if (bumpProduct && !alreadyInCart) {
          return {
            product: bumpProduct,
            message: cartProduct.orderBumpMessage || `Adicione por apenas ${formatCurrency(bumpProduct.price)}!`,
          };
        }
      }
    }
    return null;
  })();

  const handleAddBump = () => {
    if (!orderBumpProduct) return;
    addItem({
      productId: orderBumpProduct.product.id,
      quantity: 1,
      unitPrice: orderBumpProduct.product.price,
    });
  };

  return (
    <Drawer
      open={isMiniCartOpen}
      onOpenChange={(open) => (open ? undefined : closeMiniCart())}
      title="Sua Sacola"
      description={`${totals.itemsCount} item(ns) adicionado(s)`}
      footer={
        cart.items.length ? (
          <div className="w-full space-y-3 pt-2 border-t border-border">
            <div className="text-small flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold text-foreground">{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="text-small flex items-center justify-between">
              <span className="text-muted-foreground">Frete</span>
              <span className="font-semibold text-foreground">
                {totals.shipping === 0 ? "Grátis" : formatCurrency(totals.shipping)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-h4 font-bold text-foreground">
              <span>Total</span>
              <span className="text-brand font-black">{formatCurrency(totals.total)}</span>
            </div>
            <Button asChild size="lg" className="w-full bg-accent font-extrabold text-accent-foreground hover:brightness-105 shadow-medium">
              <Link to="/checkout" onClick={closeMiniCart} className="flex items-center justify-center gap-2">
                Finalizar Compra
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : null
      }
    >
      {cart.items.length === 0 ? (
        <div className="py-12 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h3 className="text-h4 font-bold text-foreground">Sua sacola está vazia</h3>
          <p className="text-small text-muted-foreground">
            Navegue pelos produtos e adicione os melhores itens gamer ao seu carrinho.
          </p>
          <Button asChild onClick={closeMiniCart} variant="outline" className="mt-2">
            <Link to="/loja">Explorar Loja</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-0">
          <ul className="divide-y divide-border py-2">
            {cartItemsWithProduct.map(({ id, unitPrice, quantity, product }) => (
              <li key={id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                {product ? (
                  <img
                    src={product.images[0]?.url || ""}
                    alt={product.name}
                    className="h-16 w-16 shrink-0 rounded-xl border border-border bg-background object-contain p-1.5"
                  />
                ) : (
                  <div className="h-16 w-16 shrink-0 rounded-xl border border-border bg-muted" />
                )}
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-small font-bold text-foreground line-clamp-1">
                      {product?.name ?? "Produto"}
                    </h4>
                    <span className="text-small font-extrabold text-foreground">
                      {formatCurrency(unitPrice * quantity)}
                    </span>
                  </div>
                  <p className="text-caption text-muted-foreground">
                    Unidade: {formatCurrency(unitPrice)}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <QuantitySelector
                      value={quantity}
                      onChange={(q) => updateQuantity(id, q)}
                      max={product?.stock ?? 99}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remover item"
                      onClick={() => removeItem(id)}
                      className="h-8 w-8 text-muted-foreground hover:text-danger hover:bg-danger/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Order Bump */}
          {orderBumpProduct && (
            <div className="mt-4 rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 p-4 space-y-3">
              <p className="text-caption font-black text-accent uppercase tracking-wider">
                ⚡ Oferta Especial para Você
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={orderBumpProduct.product.images[0]?.url}
                  alt={orderBumpProduct.product.name}
                  className="h-14 w-14 shrink-0 rounded-xl border border-border bg-white object-contain p-1"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-small font-bold text-foreground truncate">
                    {orderBumpProduct.product.name}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {orderBumpProduct.message}
                  </p>
                  <p className="text-small font-black text-accent mt-0.5">
                    {formatCurrency(orderBumpProduct.product.price)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddBump}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-small font-extrabold text-accent-foreground transition-all hover:brightness-105 shadow-sm"
              >
                <Zap className="h-4 w-4 fill-current" />
                Adicionar ao Pedido
              </button>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
