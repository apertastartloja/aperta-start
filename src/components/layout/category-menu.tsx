import { Link } from "@tanstack/react-router";
import { Container } from "@/components/common/container";
import { useCategories } from "@/hooks/useCategories";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";

/** Lista vertical de categorias — usada em sidebars e no menu mobile. */
export function CategoryMenu({
  onNavigate,
  className,
}: {
  onNavigate?: (() => void) | undefined;
  className?: string | undefined;
}) {
  const { data: categories = [], isLoading } = useCategories();
  const roots = categories.filter((category) => !category.parentId);

  return (
    <nav aria-label="Menu de categorias" className={cn("w-full", className)}>
      <ul className="space-y-1">
        {isLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <li key={index} className="h-9 animate-pulse rounded-md bg-muted" />
            ))
          : roots.map((category) => (
              <li key={category.id}>
                <Link
                  to={ROUTES.shop}
                  onClick={onNavigate}
                  className="text-small flex items-center justify-between rounded-md px-3 py-2 text-foreground transition-colors hover:bg-muted"
                >
                  {category.name}
                </Link>
                <ul className="ml-3 border-l border-border pl-3">
                  {categories
                    .filter((child) => child.parentId === category.id)
                    .map((child) => (
                      <li key={child.id}>
                        <Link
                          to={ROUTES.shop}
                          onClick={onNavigate}
                          className="text-small block rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                </ul>
              </li>
            ))}
      </ul>
    </nav>
  );
}

export function CategoryMenuSection() {
  return (
    <Container>
      <CategoryMenu />
    </Container>
  );
}
