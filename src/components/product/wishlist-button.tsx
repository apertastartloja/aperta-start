import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  variant?: "icon" | "full";
  className?: string | undefined;
}

export function WishlistButton({ productId, variant = "icon", className }: WishlistButtonProps) {
  const { has, toggle } = useWishlist();
  const active = has(productId);

  if (variant === "full") {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => toggle(productId)}
        className={cn("gap-2", className)}
      >
        <Heart className={cn("size-4", active && "fill-danger text-danger")} />
        {active ? "Nos favoritos" : "Favoritar"}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      aria-label={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      aria-pressed={active}
      onClick={() => toggle(productId)}
      className={cn("rounded-full shadow-light", className)}
    >
      <Heart className={cn("size-4", active && "fill-danger text-danger")} />
    </Button>
  );
}
