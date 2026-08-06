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
        className={cn(
          "gap-2 transition-all duration-300",
          active && "border-rose-500/40 bg-rose-500/10 text-rose-500 font-bold",
          className,
        )}
      >
        <Heart className={cn("size-4 transition-transform duration-200", active && "fill-rose-500 text-rose-500 scale-110")} />
        {active ? "Nos favoritos" : "Favoritar"}
      </Button>
    );
  }

  return (
    <button
      type="button"
      aria-label={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      aria-pressed={active}
      onClick={() => toggle(productId)}
      className={cn(
        "grid size-9 place-items-center rounded-full transition-all duration-300 cursor-pointer",
        active
          ? "bg-[#000B1F] text-white border border-white/20 shadow-medium hover:scale-105"
          : "bg-surface/90 backdrop-blur-xs text-muted-foreground border border-border/60 hover:bg-surface hover:text-foreground hover:scale-105 shadow-xs",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-4 transition-all duration-200",
          active ? "fill-rose-500 text-rose-500 scale-110 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]" : "text-muted-foreground",
        )}
      />
    </button>
  );
}
