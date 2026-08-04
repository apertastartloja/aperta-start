import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import { AddToCartButton } from "./add-to-cart-button";
import { QuantitySelector } from "./quantity-selector";
import { WishlistButton } from "./wishlist-button";

/** Bloco de ações da página de produto (quantidade + sacola + favoritos). */
export function ProductActions({
  product,
  className,
}: {
  product: Product;
  className?: string | undefined;
}) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-3">
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          max={Math.max(1, product.stock)}
          disabled={product.stock <= 0}
        />
        <span className="text-small text-muted-foreground">
          {product.stock > 0 ? `${product.stock} em estoque` : "Sem estoque"}
        </span>
      </div>
      <div className="flex gap-3">
        <AddToCartButton product={product} quantity={quantity} size="lg" />
        <WishlistButton productId={product.id} variant="full" />
      </div>
    </div>
  );
}
