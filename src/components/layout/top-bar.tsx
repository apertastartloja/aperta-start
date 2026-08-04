import { Container } from "@/components/common/container";
import { Icon } from "@/components/common/icon";
import { useInstitutional } from "@/hooks/useContent";

/** Faixa fina de informações comerciais no topo do site. */
export function TopBar() {
  const { data: items = [] } = useInstitutional();

  return (
    <div className="hidden bg-secondary text-secondary-foreground lg:block">
      <Container className="flex h-9 items-center justify-between gap-6">
        <ul className="flex items-center gap-8">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-2 text-[12px] font-medium">
              <Icon name={item.icon} className="size-3.5 text-accent" />
              <span>{item.title}</span>
              <span className="opacity-60">{item.description}</span>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
