import { Link } from "@tanstack/react-router";
import { ChevronDown, Menu } from "lucide-react";
import { useState } from "react";
import { Container } from "@/components/common/container";
import { MAIN_MENU, ROUTES } from "@/constants";
import { useCategoryTree } from "@/hooks/useCategories";
import type { CategoryTree } from "@/services";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function MegaMenu({
  categories,
  onClose,
}: {
  categories: CategoryTree[];
  onClose?: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-6 p-2">
      {categories.map((category) => (
        <div key={category.id} className="space-y-2">
          <Link
            to={ROUTES.shop}
            onClick={onClose}
            className="text-caption font-bold text-foreground transition-colors hover:text-primary block"
          >
            {category.name}
          </Link>
          {category.children.length > 0 ? (
            <ul className="space-y-1.5">
              {category.children.map((child) => (
                <li key={child.id}>
                  <Link
                    to={ROUTES.shop}
                    onClick={onClose}
                    className="text-small text-muted-foreground transition-colors hover:text-primary"
                  >
                    {child.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** Linha de navegação: botão "Categorias" + menu principal. */
export function Navigation() {
  const { data: categories = [] } = useCategoryTree();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav aria-label="Navegação principal" className="bg-background text-foreground">
      <Container className="flex h-14 items-center justify-center gap-10">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="text-button flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-accent-foreground transition-opacity hover:opacity-90 cursor-pointer"
            >
              <Menu className="size-4" aria-hidden />
              Categorias
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
                aria-hidden
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={8}
            className="w-[520px] p-6 shadow-large border-border bg-popover z-50"
          >
            {categories.length ? (
              <MegaMenu categories={categories} onClose={() => setIsOpen(false)} />
            ) : (
              <p className="text-small text-muted-foreground">Carregando categorias...</p>
            )}
          </PopoverContent>
        </Popover>

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
