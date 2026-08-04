import { Link } from "@tanstack/react-router";
import { Container } from "@/components/common/container";
import { ProductCarousel } from "@/components/product/product-carousel";
import { ProductGrid } from "@/components/product/product-grid";
import { ROUTES } from "@/constants";
import { useCollectionProducts } from "@/hooks/useCollectionProducts";
import { cn } from "@/lib/utils";

interface ProductSectionProps {
  slug: string;
  title: string;
  description?: string | undefined;
  layout?: "carousel" | "grid";
  className?: string | undefined;
}

/** Seções 4, 5 e 7: vitrines de produtos por coleção. */
export function ProductSection({
  slug,
  title,
  description,
  layout = "carousel",
  className,
}: ProductSectionProps) {
  const { data: products = [], isLoading } = useCollectionProducts(slug);

  return (
    <section aria-label={title} className={cn("py-14", className)}>
      <Container className="space-y-8">
        <div className="flex items-end justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-h1 flex items-center gap-3">
              <span className="inline-block h-7 w-1.5 rounded-full bg-accent" aria-hidden />
              {title}
            </h2>
            {description ? <p className="text-small text-muted-foreground">{description}</p> : null}
          </div>
          <Link
            to={ROUTES.home}
            className="text-small shrink-0 font-bold text-primary underline-offset-4 hover:underline"
          >
            Ver todos
          </Link>
        </div>

        {layout === "grid" ? (
          <ProductGrid products={products} isLoading={isLoading} columns={4} compact />
        ) : (
          <ProductCarousel products={products} isLoading={isLoading} compact />
        )}
      </Container>
    </section>
  );
}
