import { ShoppingBag } from "lucide-react";
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
  const soldOut = product.stock <= 0;

  return (
    <Button
      type="button"
      size={size}
      disabled={soldOut}
      className={cn("w-full gap-2", className)}
      onClick={() =>
        addItem({
          productId: product.id,
          quantity,
          unitPrice: product.price,
          ...(variantId ? { variantId } : {}),
        })
      }
    >
      <ShoppingBag className="size-4" />
      {soldOut ? "Indisponível" : "Adicionar à sacola"}
    </Button>
  );
}
