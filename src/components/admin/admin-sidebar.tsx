import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  FolderTree,
  Layers,
  Boxes,
  Building2,
  Users,
  Megaphone,
  Image,
  Ticket,
  Send,
  Truck,
  CreditCard,
  Mail,
  BarChart2,
  Settings,
  User,
  ChevronDown,
  ChevronRight,
  LogOut,
  ExternalLink,
  ShieldCheck,
  X,
} from "lucide-react";
import logoImg from "@/assets/logo.png";
import { useAdminAuth } from "@/contexts/admin-auth-context";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface MenuItem {
  title: string;
  href?: string;
  icon: any;
  subItems?: { title: string; href: string; icon: any }[];
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/painel/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Pedidos",
    href: "/painel/admin/pedidos",
    icon: Package,
  },
  {
    title: "Produtos",
    icon: ShoppingBag,
    subItems: [
      { title: "Produtos", href: "/painel/admin/produtos/lista", icon: Tag },
      { title: "Categorias", href: "/painel/admin/produtos/categorias", icon: FolderTree },
      { title: "Coleções", href: "/painel/admin/produtos/colecoes", icon: Layers },
    ],
  },
  {
    title: "Estoque",
    href: "/painel/admin/estoque",
    icon: Boxes,
  },
  {
    title: "Fornecedores",
    href: "/painel/admin/fornecedores",
    icon: Building2,
  },
  {
    title: "Clientes",
    href: "/painel/admin/clientes",
    icon: Users,
  },
  {
    title: "Marketing",
    icon: Megaphone,
    subItems: [
      { title: "Banners", href: "/painel/admin/marketing/banners", icon: Image },
      { title: "Cupons", href: "/painel/admin/marketing/cupons", icon: Ticket },
      { title: "Newsletter", href: "/painel/admin/marketing/newsletter", icon: Send },
    ],
  },
  {
    title: "Entregas",
    href: "/painel/admin/entregas",
    icon: Truck,
  },
  {
    title: "Financeiro",
    href: "/painel/admin/financeiro",
    icon: CreditCard,
  },
  {
    title: "E-mails",
    href: "/painel/admin/emails",
    icon: Mail,
  },
  {
    title: "Relatórios",
    href: "/painel/admin/relatorios",
    icon: BarChart2,
  },
  {
    title: "Configurações",
    href: "/painel/admin/configuracoes",
    icon: Settings,
  },
  {
    title: "Minha Conta",
    href: "/painel/admin/minha-conta",
    icon: User,
  },
];

export function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const { user, logout } = useAdminAuth();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Track expanded accordion submenus
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    Produtos: currentPath.startsWith("/painel/admin/produtos"),
    Marketing: currentPath.startsWith("/painel/admin/marketing"),
  });

  const toggleSubmenu = (title: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isLinkActive = (href?: string) => {
    if (!href) return false;
    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-[#19253b] text-sidebar-foreground shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-18 items-center justify-between border-b border-sidebar-border px-5">
          <Link to="/painel/admin/dashboard" className="flex items-center gap-3 group">
            <img src={logoImg} alt="Aperta Start" className="h-8 w-auto object-contain transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="font-black tracking-tight uppercase text-white text-base leading-none">
                APERTA<span className="text-accent">START</span>
              </span>
              <span className="text-[10px] font-bold tracking-widest text-accent/90 uppercase mt-0.5 flex items-center gap-1">
                <ShieldCheck className="size-3 text-accent" /> ADMIN PANEL
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          {onMobileClose && (
            <button
              onClick={onMobileClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-white lg:hidden"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
          <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground/70">
            Navegação Principal
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasSub = Boolean(item.subItems && item.subItems.length > 0);
            const isSubOpen = openSubmenus[item.title];
            const isParentActive =
              item.href ? isLinkActive(item.href) : item.subItems?.some((sub) => isLinkActive(sub.href));

            if (hasSub) {
              return (
                <div key={item.title} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleSubmenu(item.title)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-small font-semibold transition-all duration-150",
                      isParentActive
                        ? "bg-sidebar-accent text-accent"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("size-4.5 shrink-0", isParentActive ? "text-accent" : "text-muted-foreground")} />
                      <span>{item.title}</span>
                    </div>
                    {isSubOpen ? (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-4 text-muted-foreground" />
                    )}
                  </button>

                  {/* Submenu Links */}
                  {isSubOpen && (
                    <div className="ml-4 pl-3 border-l border-white/10 space-y-1 pt-1">
                      {item.subItems?.map((sub) => {
                        const SubIcon = sub.icon;
                        const active = isLinkActive(sub.href);
                        return (
                          <Link
                            key={sub.href}
                            to={sub.href}
                            onClick={onMobileClose}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-small font-medium transition-all duration-150",
                              active
                                ? "bg-accent/20 text-accent font-bold shadow-xs"
                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-white"
                            )}
                          >
                            <SubIcon className={cn("size-4 shrink-0", active ? "text-accent" : "text-muted-foreground")} />
                            <span>{sub.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.title}
                to={item.href!}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-small font-semibold transition-all duration-150",
                  active
                    ? "bg-accent text-accent-foreground font-extrabold shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-white"
                )}
              >
                <Icon className={cn("size-4.5 shrink-0", active ? "text-accent-foreground" : "text-muted-foreground")} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Store Quick Link */}
        <div className="px-3 py-2">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl border border-white/10 bg-sidebar-accent/40 px-3 py-2.5 text-caption font-bold text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-white"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="size-3.5 text-accent" />
              Ver Loja Pública
            </span>
            <span className="text-[10px] text-accent uppercase font-black">Ao vivo</span>
          </Link>
        </div>

        {/* User Footer */}
        <div className="border-t border-sidebar-border p-3.5 bg-black/15">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground font-black text-sm shadow-xs">
                A
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-small font-bold text-white truncate leading-tight">Admin Aperta Start</p>
                <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Sair do painel"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-danger/20 hover:text-danger"
            >
              <LogOut className="size-4.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
