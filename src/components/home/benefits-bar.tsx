import { Container } from "@/components/common/container";
import { Icon } from "@/components/common/icon";
import { useBenefits } from "@/hooks/useContent";

/** Seção de diferenciais/autoridade da marca (Barra de benefícios premium). */
export function BenefitsBar() {
  const { data: benefits = [] } = useBenefits();
  if (!benefits.length) return null;

  return (
    <section
      aria-label="Nossos diferenciais"
      className="relative overflow-hidden border-y border-white/10 bg-gradient-to-r from-[#000B1F] via-[#081838] to-[#000B1F] py-8 text-white shadow-medium"
    >
      {/* Luz ambiente sutil de fundo */}
      <div
        className="pointer-events-none absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl"
        aria-hidden
      />

      <Container>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-white/10">
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              className="group flex items-center gap-4 rounded-xl p-3 transition-all duration-300 hover:bg-white/[0.03] lg:px-6"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-accent/30 bg-white/5 text-accent shadow-[0_0_15px_rgba(255,201,51,0.15)] transition-all duration-300 group-hover:scale-105 group-hover:border-accent/60 group-hover:bg-accent/15 group-hover:shadow-[0_0_20px_rgba(255,201,51,0.3)]">
                <Icon name={benefit.icon} className="size-5" />
              </span>
              <div className="min-w-0 space-y-0.5">
                <p className="text-small font-bold text-white tracking-tight">{benefit.title}</p>
                <p className="text-caption text-white/65 normal-case font-normal leading-snug">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
