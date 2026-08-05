import { useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAdminAuth } from "@/contexts/admin-auth-context";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import logoImg from "@/assets/logo.png";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAdmin, isLoading } = useAdminAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate({ to: "/painel/admin" });
    }
  }, [isAdmin, isLoading, navigate]);

  // Loading state while checking Supabase Auth session
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="relative inline-flex items-center justify-center">
            <img src={logoImg} alt="Aperta Start" className="h-12 w-auto animate-pulse" />
            <div className="absolute inset-0 rounded-full border-2 border-accent border-t-transparent animate-spin scale-150" />
          </div>
          <h2 className="text-h4 font-extrabold text-foreground">Carregando Painel...</h2>
          <p className="text-caption text-muted-foreground">Verificando credenciais e sessão Supabase Auth</p>
        </div>
      </div>
    );
  }

  // If not admin, return null while redirecting
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar Navigation */}
      <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <AdminHeader onMobileToggle={() => setMobileOpen((prev) => !prev)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
