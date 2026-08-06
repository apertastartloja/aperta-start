import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu } from "lucide-react";
import { Container } from "@/components/common/container";
import { MAIN_MENU, ROUTES } from "@/constants";
import { useCategoryTree } from "@/hooks/useCategories";
import type { CategoryTree } from "@/services";

function MegaMenu({ categories }: { categories: CategoryTree[] }) {
  return (
    <div className="invisible absolute left-0 top-full z-50 w-[520px] pt-2 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
      <div className="grid grid-cols-2 gap-6 rounded-lg border border-border bg-popover p-6 shadow-large">
        {categories.map((category) => (
          <div key={category.id} className="space-y-2">
            <p className="text-caption text-accent-foreground">{category.name}</p>
            <ul className="space-y-1.5">
              {category.children.map((child) => (
                <li key={child.id}>
                  <Link
                    to={ROUTES.home}
                    className="text-small text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {child.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Linha de navegação: botão "Categorias" + menu principal. */
export function Navigation() {
  const { data: categories = [] } = useCategoryTree();

  return (
    <nav aria-label="Navegação principal" className="bg-background text-foreground">
      <Container className="flex h-14 items-center justify-center gap-10">
        <div className="group relative">
          <button
            type="button"
            className="text-button flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-accent-foreground transition-opacity hover:opacity-90"
          >
            <Menu className="size-4" aria-hidden />
            Categorias
            <ChevronDown className="size-3.5" aria-hidden />
          </button>
          {categories.length ? <MegaMenu categories={categories} /> : null}
        </div>

        <ul className="flex items-center gap-8">
          {MAIN_MENU.map((item) => (
            <li key={item.label}>
              <Link
                to={item.href}
                className="text-small font-semibold text-primary transition-colors hover:text-primary/75"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </nav>
  );
}
