import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

interface AddToCartButtonProps {
  product: Product;
  quantity?: number | undefined;
  variantId?: string | undefined;
  size?: "sm" | "default" | "lg";
  className?: string | undefined;
}

export function AddToCartButton({
  product,
  quantity = 1,
  variantId,
  size = "default",
  className,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const soldOut = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut) return;

    addItem({
      productId: product.id,
      quantity,
      unitPrice: product.price,
      productName: product.name,
      productSku: product.sku,
      productImage: product.images[0]?.url,
      ...(variantId ? { variantId } : {}),
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <Button
      type="button"
      size={size}
      disabled={soldOut}
      className={cn(
        "w-full gap-2 transition-all cursor-pointer",
        isAdded && "bg-emerald-600 text-white hover:bg-emerald-700",
        className
      )}
      onClick={handleAddToCart}
    >
      {soldOut ? (
        <>
          <ShoppingBag className="size-4" />
          Indisponível
        </>
      ) : isAdded ? (
        <>
          <Check className="size-4 stroke-[3]" />
          Adicionado!
        </>
      ) : (
        <>
          <ShoppingBag className="size-4" />
          Adicionar à sacola
        </>
      )}
    </Button>
  );
}
