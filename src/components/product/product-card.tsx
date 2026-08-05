import { Link } from "@tanstack/react-router";
import { ImageOff } from "lucide-react";
import { Rating } from "@/components/common/rating";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductBadgeList } from "./product-badge";
import { ProductInstallments, ProductPrice } from "./product-price";
import { WishlistButton } from "./wishlist-button";

interface ProductCardProps {
  product: Product;
  className?: string | undefined;
  /** Card enxuto usado na Home: imagem, badge, nome, preço e parcelamento. */
  compact?: boolean | undefined;
}

export function ProductCard({ product, className, compact = false }: ProductCardProps) {
  const cover = product.images[0];

  return (
    <Card
      className={cn(
        "group relative h-full gap-0 overflow-hidden rounded-lg border-border bg-card p-0 shadow-light transition-all duration-200 hover:-translate-y-1 hover:shadow-hover",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-surface">
        {cover ? (
          <img
            src={cover.url}
            alt={cover.alt}
            loading="lazy"
            width={800}
            height={800}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-8" aria-hidden />
          </div>
        )}

        <ProductBadgeList types={product.badges} max={1} className="absolute left-3 top-3" />
        <WishlistButton productId={product.id} className="absolute right-3 top-3" />
      </div>

      <CardContent className={cn("flex flex-col gap-3", compact ? "p-4" : "p-5")}>
        <div className="space-y-1.5">
          <Link to="/produto/$slug" params={{ slug: product.slug }} className="after:absolute after:inset-0">
            <h3 className="text-h4 line-clamp-2 min-h-[2.7em] text-foreground transition-colors group-hover:text-accent">
              {product.name}
            </h3>
          </Link>
          {!compact ? <Rating value={product.rating} reviewsCount={product.reviewsCount} /> : null}
        </div>

        <div className="space-y-0.5">
          <ProductPrice product={product} size={compact ? "md" : "md"} />
          <ProductInstallments product={product} />
        </div>

        {!compact ? (
          <AddToCartButton product={product} className="relative z-10" />
        ) : null}
      </CardContent>
    </Card>
  );
}
