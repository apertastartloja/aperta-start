import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ListSkeleton } from "@/components/common/loading";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import { ProductCard } from "./product-card";

interface ProductCarouselProps {
  products: Product[];
  isLoading?: boolean | undefined;
  compact?: boolean | undefined;
  className?: string | undefined;
}

export function ProductCarousel({ products, isLoading, compact, className }: ProductCarouselProps) {
  if (isLoading) return <ListSkeleton count={4} className={className} />;
  if (!products.length) return null;

  return (
    <Carousel opts={{ align: "start", loop: false }} className={cn("w-full", className)}>
      <CarouselContent className="-ml-6">
        {products.map((product) => (
          <CarouselItem
            key={product.id}
            className="basis-full pl-6 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
          >
            <ProductCard product={product} compact={compact} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
