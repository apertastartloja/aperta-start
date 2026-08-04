import { Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Drawer } from "@/components/common/drawer";
import { EmptyState } from "@/components/common/empty-state";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/utils/format";

export function MiniCart() {
  const { cart, totals, isMiniCartOpen, closeMiniCart, updateQuantity, removeItem } = useCart();

  return (
    <Drawer
      open={isMiniCartOpen}
      onOpenChange={(open) => (open ? undefined : closeMiniCart())}
      title="Sua sacola"
      description={`${totals.itemsCount} item(ns)`}
      footer={
        cart.items.length ? (
          <div className="w-full space-y-3">
            <div className="text-small flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="text-small flex items-center justify-between">
              <span className="text-muted-foreground">Frete</span>
              <span className="font-semibold">
                {totals.shipping === 0 ? "Grátis" : formatCurrency(totals.shipping)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-h4">Total</span>
              <span className="text-h4">{formatCurrency(totals.total)}</span>
            </div>
            <Button asChild size="lg" className="w-full">
              <Link to={ROUTES.home} onClick={closeMiniCart}>
                Finalizar compra
              </Link>
            </Button>
          </div>
        ) : null
      }
    >
      {cart.items.length === 0 ? (
        <EmptyState
          title="Sua sacola está vazia"
          description="Explore o catálogo e adicione ferramentas."
        />
      ) : (
        <ul className="space-y-4 py-2">
          {cart.items.map((item) => (
            <li key={item.id} className="flex gap-3">
              <span className="size-16 shrink-0 rounded-md bg-surface" />
              <div className="flex-1 space-y-2">
                <p className="text-small font-medium">Produto {item.productId}</p>
                <p className="text-small text-muted-foreground">
                  {formatCurrency(item.unitPrice)}
                </p>
                <div className="flex items-center gap-2">
                  <QuantitySelector
                    value={item.quantity}
                    onChange={(quantity) => updateQuantity(item.id, quantity)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remover item"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}
