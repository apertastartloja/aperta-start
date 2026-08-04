import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./auth-context";
import { CartProvider } from "./cart-context";
import { ThemeProvider } from "./theme-context";
import { WishlistProvider } from "./wishlist-context";

/** Único ponto de composição de providers da aplicação. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={200}>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              {children}
              <Toaster />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export * from "./auth-context";
export * from "./cart-context";
export * from "./theme-context";
export * from "./wishlist-context";
