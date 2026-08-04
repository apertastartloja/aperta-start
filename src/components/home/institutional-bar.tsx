import { Container } from "@/components/common/container";
import { Icon } from "@/components/common/icon";
import { useInstitutional } from "@/hooks/useContent";

/** Seção 10: barra institucional clara acima do rodapé. */
export function InstitutionalBar() {
  const { data: items = [] } = useInstitutional();
  if (!items.length) return null;

  return (
    <section aria-label="Informações da loja" className="border-y border-border bg-card">
      <Container className="grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <Icon name={item.icon} className="size-7 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-small font-bold text-foreground">{item.title}</p>
              <p className="text-caption text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}
