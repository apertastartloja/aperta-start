import { Container } from "@/components/common/container";
import { Icon } from "@/components/common/icon";
import { useBenefits } from "@/hooks/useContent";

/** Seção 6: barra escura de diferenciais da marca. */
export function BenefitsBar() {
  const { data: benefits = [] } = useBenefits();
  if (!benefits.length) return null;

  return (
    <section aria-label="Nossos diferenciais" className="bg-secondary text-secondary-foreground">
      <Container className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit) => (
          <div key={benefit.id} className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
              <Icon name={benefit.icon} className="size-5" />
            </span>
            <div className="min-w-0 space-y-1">
              <p className="text-h4 leading-snug">{benefit.title}</p>
              <p className="text-small opacity-75">{benefit.description}</p>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}
