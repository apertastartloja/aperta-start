import { Link } from "@tanstack/react-router";
import { Menu, ShoppingCart, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Logo } from "@/components/common/logo";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { MiniCart } from "./mini-cart";
import { MobileMenu } from "./mobile-menu";
import { Navigation } from "./navigation";
import { Search } from "./search";
import { TopBar } from "./top-bar";
import { cn } from "@/lib/utils";

/**
 * Header com modo compacto ao rolar.
 *
 * Estratégia para evitar layout shift / pulo:
 * - O <header> é `fixed` (sai do fluxo do documento — sem alterar a altura do layout).
 * - O MainLayout insere um <div> espaçador estático com altura equivalente ao
 *   header expandido para que o conteúdo não fique atrás do header.
 * - Quando o usuário rola, o header anima internamente, mas NENHUM elemento
 *   no fluxo do documento muda de tamanho, portanto não há jump/flicker.
 */
export function Header() {
  const { totals, openMiniCart } = useCart();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScroll = window.scrollY;
          if (currentScroll > 100) {
            setIsScrolled(true);
          } else if (currentScroll < 10) {
            setIsScrolled(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Header fixo — fora do fluxo do documento */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full">
        {/* TopBar */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden will-change-[max-height,opacity]",
            isScrolled ? "max-h-0 opacity-0 pointer-events-none" : "max-h-12 opacity-100"
          )}
        >
          <TopBar />
        </div>

        {/* Barra principal */}
        <div
          className={cn(
            "bg-primary text-primary-foreground transition-all duration-300 ease-in-out border-b border-white/10 will-change-[height,box-shadow,background]",
            isScrolled ? "shadow-large bg-primary/95 backdrop-blur-md" : "shadow-medium"
          )}
        >
          <Container
            className={cn(
              "flex items-center gap-4 sm:gap-8 transition-all duration-300 ease-in-out",
              isScrolled ? "h-14 sm:h-16" : "h-20 sm:h-24"
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              aria-label="Abrir menu"
              className="text-primary-foreground hover:bg-primary-foreground/10 lg:hidden shrink-0"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="size-5" />
            </Button>

            <div
              className={cn(
                "shrink-0 transition-transform duration-300 ease-in-out origin-left",
                isScrolled ? "scale-90" : "scale-100"
              )}
            >
              <Logo size="lg" variant="light" />
            </div>

            <Search className="hidden flex-1 lg:block" />

            <div className="ml-auto flex items-center gap-4 sm:gap-6 shrink-0">
              <Link
                to="/entrar"
                className="hidden items-center gap-2 text-primary-foreground transition-colors hover:text-accent lg:flex"
              >
                <User
                  className={cn("transition-all duration-300", isScrolled ? "size-5" : "size-6")}
                  aria-hidden
                />
                <span className="leading-tight">
                  <span className="text-small block font-semibold">Entrar</span>
                  <span
                    className={cn(
                      "block text-[12px] opacity-75 overflow-hidden transition-all duration-300",
                      isScrolled ? "max-h-0 opacity-0" : "max-h-6 opacity-75"
                    )}
                  >
                    Minha conta
                  </span>
                </span>
              </Link>

              <button
                type="button"
                onClick={openMiniCart}
                aria-label="Abrir sacola"
                className="relative text-primary-foreground transition-colors hover:text-accent p-1"
              >
                <ShoppingCart
                  className={cn("transition-all duration-300", isScrolled ? "size-5" : "size-6")}
                  aria-hidden
                />
                <span className="text-[11px] absolute -right-2 -top-1.5 grid size-5 place-items-center rounded-full bg-accent font-bold text-accent-foreground shadow-xs">
                  {totals.itemsCount}
                </span>
              </button>
            </div>
          </Container>
        </div>

        {/* Menu de navegação por categorias */}
        <div
          className={cn(
            "hidden lg:block overflow-hidden transition-all duration-300 ease-in-out bg-surface border-b border-border shadow-xs will-change-[max-height,opacity]",
            isScrolled ? "max-h-0 opacity-0 pointer-events-none" : "max-h-16 opacity-100"
          )}
        >
          <Navigation />
        </div>
      </header>

      {/* Espaçador estático — mantém o conteúdo abaixo do header fixo.
          Altura equivalente ao header EXPANDIDO: TopBar(48) + MainBar(96) + NavBar(48) = 192px em desktop.
          Em mobile não tem NavBar: TopBar(48) + MainBar(80) = 128px. */}
      <div className="h-[192px] hidden lg:block" aria-hidden="true" />
      <div className="h-[128px] block lg:hidden" aria-hidden="true" />

      <MobileMenu open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen} />
      <MiniCart />
    </>
  );
}
