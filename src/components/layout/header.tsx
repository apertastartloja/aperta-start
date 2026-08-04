import { Link } from "@tanstack/react-router";
import { Menu, ShoppingCart, User } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/aperta-start-logo.png.asset.json";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { APP, ROUTES } from "@/constants";
import { useCart } from "@/hooks/useCart";
import { MiniCart } from "./mini-cart";
import { MobileMenu } from "./mobile-menu";
import { Navigation } from "./navigation";
import { Search } from "./search";
import { TopBar } from "./top-bar";

export function Header() {
  const { totals, openMiniCart } = useCart();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full">
      <TopBar />

      <div className="bg-primary text-primary-foreground">
        <Container className="flex h-24 items-center gap-8">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Abrir menu"
            className="text-primary-foreground hover:bg-primary-foreground/10 lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="size-5" />
          </Button>

          <Link to={ROUTES.home} className="shrink-0">
            <img
              src={logo.url}
              alt={APP.name}
              width={200}
              height={74}
              className="h-11 w-auto"
            />
          </Link>

          <Search className="hidden flex-1 lg:block" />

          <div className="ml-auto flex items-center gap-6">
            <Link
              to={ROUTES.home}
              className="hidden items-center gap-2 text-primary-foreground transition-colors hover:text-accent lg:flex"
            >
              <User className="size-6" aria-hidden />
              <span className="leading-tight">
                <span className="text-small block font-semibold">Entrar</span>
                <span className="block text-[12px] opacity-75">Minha conta</span>
              </span>
            </Link>

            <button
              type="button"
              onClick={openMiniCart}
              aria-label="Abrir sacola"
              className="relative text-primary-foreground transition-colors hover:text-accent"
            >
              <ShoppingCart className="size-6" aria-hidden />
              <span className="text-[11px] absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-accent font-bold text-accent-foreground">
                {totals.itemsCount}
              </span>
            </button>
          </div>
        </Container>
      </div>

      <div className="hidden lg:block">
        <Navigation />
      </div>

      <MobileMenu open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      <MiniCart />
    </header>
  );
}
