import { Menu, Search, Bell, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAdminAuth } from "@/contexts/admin-auth-context";

interface AdminHeaderProps {
  onMobileToggle: () => void;
}

export function AdminHeader({ onMobileToggle }: AdminHeaderProps) {
  const { user } = useAdminAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-surface px-4 sm:px-6 shadow-light">
      {/* Left section: Mobile toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onMobileToggle}
          className="rounded-xl border border-border p-2 text-foreground hover:bg-muted lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </button>

        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar pedidos, produtos, clientes..."
            className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Right section: System status, Store link, Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Supabase status badge */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-caption font-bold text-emerald-600 dark:text-emerald-400">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
          </span>
          Supabase Auth Conectado
        </div>

        {/* Notifications mock button */}
        <button
          type="button"
          title="Notificações do sistema"
          className="relative rounded-xl border border-border bg-background p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          <Bell className="size-4.5" />
          <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-accent font-black text-[10px] text-accent-foreground">
            3
          </span>
        </button>

        {/* Quick link to store */}
        <Link
          to="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-small font-bold text-foreground hover:bg-muted transition-all"
        >
          <ExternalLink className="size-4 text-brand" />
          <span>Ver Loja</span>
        </Link>

        {/* Profile Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-border">
          <div className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground font-black text-xs">
            AS
          </div>
          <div className="hidden lg:block leading-tight">
            <p className="text-small font-extrabold text-foreground">Administrador</p>
            <p className="text-[11px] text-muted-foreground font-medium">Aperta Start</p>
          </div>
        </div>
      </div>
    </header>
  );
}
