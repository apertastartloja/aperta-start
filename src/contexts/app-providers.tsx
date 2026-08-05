import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./auth-context";
import { AdminAuthProvider } from "./admin-auth-context";
import { CartProvider } from "./cart-context";
import { ThemeProvider } from "./theme-context";
import { WishlistProvider } from "./wishlist-context";
import { seedSupabaseDatabase } from "@/utils/seed-supabase";

/** Único ponto de composição de providers da aplicação. */
export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Sincroniza produtos mockados com a base do Supabase no banco de dados real
    seedSupabaseDatabase();
  }, []);

  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={200}>
        <AdminAuthProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                {children}
                <Toaster />
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </AdminAuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export * from "./auth-context";
export * from "./admin-auth-context";
export * from "./cart-context";
export * from "./theme-context";
export * from "./wishlist-context";

