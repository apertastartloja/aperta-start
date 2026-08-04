import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/common/container";
import { Price } from "@/components/common/price";
import { ListSkeleton } from "@/components/common/loading";
import { ROUTES } from "@/constants";
import { useKits } from "@/hooks/useCategories";

/** Seção 8: três cards grandes de kits. */
export function KitsSection() {
  const { data: kits = [], isLoading } = useKits();

  return (
    <section aria-label="Kits Aperta Start" className="py-14">
      <Container className="space-y-8">
        <div className="space-y-1">
          <h2 className="text-h1 flex items-center gap-3">
            <span className="inline-block h-7 w-1.5 rounded-full bg-accent" aria-hidden />
            Kits Aperta Start
          </h2>
          <p className="text-small text-muted-foreground">
            Combos prontos para deixar seu setup completo por um preço melhor.
          </p>
        </div>

        {isLoading ? (
          <ListSkeleton count={3} />
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {kits.slice(0, 3).map((kit) => (
              <article
                key={kit.id}
                className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-light transition-all duration-200 hover:-translate-y-1 hover:shadow-hover"
              >
                <div className="aspect-[4/3] overflow-hidden bg-surface">
                  {kit.image ? (
                    <img
                      src={kit.image}
                      alt={kit.name}
                      loading="lazy"
                      width={1000}
                      height={750}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <h3 className="text-h3 leading-snug">{kit.name}</h3>
                  {kit.description ? (
                    <p className="text-small text-muted-foreground">{kit.description}</p>
                  ) : null}
                  <Price
                    value={kit.price}
                    compareAtValue={kit.compareAtPrice}
                    size="md"
                    className="mt-auto"
                  />
                  <Link
                    to={ROUTES.home}
                    className="text-button inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground transition-opacity after:absolute after:inset-0 hover:opacity-90"
                  >
                    Ver kit
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
