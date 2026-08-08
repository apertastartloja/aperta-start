import { useState, useEffect, useRef } from "react";
import { Menu, Search, Bell, ExternalLink, ShieldCheck, CheckCheck, ChevronRight, Package, Boxes, Building2, Truck, DollarSign, Mail, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/contexts/admin-auth-context";
import { NotificationService } from "@/services/notification.service";
import type { AdminNotification, NotificationCategory, NotificationPriority } from "@/types";
import { formatTimeAgo } from "@/utils/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  onMobileToggle: () => void;
}

const categoryIcons: Record<NotificationCategory, any> = {
  orders: Package,
  inventory: Boxes,
  suppliers: Building2,
  deliveries: Truck,
  financial: DollarSign,
  emails: Mail,
  system: ShieldCheck,
  marketing: SparklesIcon,
};

function SparklesIcon(props: any) {
  return <ShieldCheck {...props} />;
}

const priorityColors: Record<NotificationPriority, string> = {
  critical: "bg-red-500/10 text-red-500 border-red-500/30",
  high: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  medium: "bg-brand/10 text-brand border-brand/30",
  low: "bg-muted text-muted-foreground border-border",
};

export function AdminHeader({ onMobileToggle }: AdminHeaderProps) {
  const { user } = useAdminAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => NotificationService.listAll(),
    refetchInterval: 15000,
  });

  // Subscribe to Realtime notifications
  useEffect(() => {
    const unsubscribe = NotificationService.subscribeToRealtime((newNotif) => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      toast.info(`🔔 ${newNotif.title}`, {
        description: newNotif.message,
      });
    });

    return () => unsubscribe();
  }, [queryClient]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.read);
  const unreadCount = unreadNotifications.length;
  const recentNotifications = notifications.slice(0, 5);

  // Handle click on notification
  const handleNotificationClick = async (notif: AdminNotification) => {
    if (!notif.read) {
      await NotificationService.markAsRead(notif.id);
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    }
    setIsDropdownOpen(false);

    if (notif.linkHref) {
      navigate({ to: notif.linkHref as any });
    } else {
      navigate({ to: "/painel/admin/notificacoes" });
    }
  };

  // Handle Mark All As Read
  const handleMarkAllRead = async () => {
    await NotificationService.markAllAsRead();
    queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    toast.success("Todas as notificações foram marcadas como lidas.");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-surface px-4 sm:px-6 shadow-light">
      {/* Left section: Mobile toggle & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onMobileToggle}
          className="rounded-xl border border-border p-2 text-foreground hover:bg-muted lg:hidden cursor-pointer"
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
          Supabase Realtime Conectado
        </div>

        {/* Notifications Popover Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            title="Notificações do sistema"
            className="relative rounded-xl border border-border bg-background p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
          >
            <Bell className="size-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-accent font-black text-[10px] text-accent-foreground animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl border border-border bg-surface p-4 shadow-2xl z-50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="size-4 text-brand" />
                  <span className="font-extrabold text-foreground text-small">Notificações</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-black text-brand">
                      {unreadCount} não lida{unreadCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    title="Marcar todas como lidas"
                    className="text-[11px] font-bold text-muted-foreground hover:text-brand flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="size-3.5" /> Limpar lidas
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                {recentNotifications.length === 0 ? (
                  <div className="p-6 text-center text-caption text-muted-foreground">
                    Nenhuma notificação recente.
                  </div>
                ) : (
                  recentNotifications.map((notif) => {
                    const CatIcon = categoryIcons[notif.category] || Bell;
                    const pColor = priorityColors[notif.priority];

                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={cn(
                          "rounded-2xl p-3 border transition-all cursor-pointer flex items-start gap-3 relative group",
                          notif.read
                            ? "bg-background/40 border-border/50 text-muted-foreground opacity-80"
                            : "bg-background border-brand/40 text-foreground shadow-xs hover:border-brand"
                        )}
                      >
                        <div className="p-2 rounded-xl bg-muted shrink-0 mt-0.5">
                          <CatIcon className="size-4 text-brand" />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-extrabold text-caption text-foreground truncate">
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                              {formatTimeAgo(notif.createdAt)}
                            </span>
                          </div>

                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>

                          <div className="flex items-center justify-between pt-1">
                            <span
                              className={cn(
                                "rounded-full border px-2 py-0.2 text-[9px] font-extrabold uppercase",
                                pColor
                              )}
                            >
                              {notif.priority}
                            </span>
                            {!notif.read && (
                              <span className="size-2 rounded-full bg-accent animate-ping" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border pt-2 text-center">
                <Link
                  to="/painel/admin/notificacoes"
                  onClick={() => setIsDropdownOpen(false)}
                  className="inline-flex items-center gap-1.5 text-caption font-extrabold text-brand hover:underline"
                >
                  Ver Central de Notificações Completa <ChevronRight className="size-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

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
