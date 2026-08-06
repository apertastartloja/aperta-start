import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/common/container";
import { Price } from "@/components/common/price";
import { ListSkeleton } from "@/components/common/loading";
import { ROUTES } from "@/constants";
import { useKits } from "@/hooks/useCategories";

/** Seção 8: três cards grandes de kits com acabamento premium. */
export function KitsSection() {
  const { data: kits = [], isLoading } = useKits();

  return (
    <section aria-label="Kits Aperta Start" className="py-14 bg-background">
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
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-large hover:shadow-accent/5"
              >
                <div className="aspect-[4/3] overflow-hidden bg-surface">
                  {kit.image ? (
                    <img
                      src={kit.image}
                      alt={kit.name}
                      loading="lazy"
                      width={1000}
                      height={750}
                      className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <h3 className="text-h3 leading-snug text-foreground transition-colors group-hover:text-primary">
                    {kit.name}
                  </h3>
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
                    className="text-button inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#000B1F] to-[#081838] text-white font-bold shadow-xs transition-all duration-300 after:absolute after:inset-0 hover:brightness-125 hover:shadow-medium cursor-pointer"
                  >
                    Ver kit
                    <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
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
