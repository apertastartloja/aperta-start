import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Bell,
  Search,
  Filter,
  CheckCheck,
  Trash2,
  ExternalLink,
  Loader2,
  Package,
  Boxes,
  Building2,
  Truck,
  DollarSign,
  Mail,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Clock,
  RefreshCw,
  Info,
  Layers,
  Zap,
} from "lucide-react";
import { AdminLayout } from "@/components/admin";
import { NotificationService } from "@/services/notification.service";
import type { AdminNotification, NotificationCategory, NotificationPriority } from "@/types";
import { formatTimeAgo, formatDate } from "@/utils/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel/admin/notificacoes")({
  head: () => ({
    meta: [{ title: "Central de Notificações — Painel Aperta Start" }],
  }),
  component: NotificacoesPage,
});

const categoryMap: Record<NotificationCategory, { label: string; icon: any }> = {
  orders: { label: "Pedidos", icon: Package },
  inventory: { label: "Estoque", icon: Boxes },
  suppliers: { label: "Fornecedores", icon: Building2 },
  deliveries: { label: "Entregas", icon: Truck },
  financial: { label: "Financeiro", icon: DollarSign },
  emails: { label: "E-mails", icon: Mail },
  system: { label: "Sistema & Segurança", icon: ShieldCheck },
  marketing: { label: "Marketing", icon: Sparkles },
};

const priorityMap: Record<NotificationPriority, { label: string; style: string }> = {
  critical: { label: "Crítica", style: "bg-red-500/10 text-red-500 border-red-500/30 font-black" },
  high: { label: "Alta", style: "bg-amber-500/10 text-amber-500 border-amber-500/30 font-extrabold" },
  medium: { label: "Média", style: "bg-brand/10 text-brand border-brand/30 font-bold" },
  low: { label: "Informativa", style: "bg-muted text-muted-foreground border-border font-medium" },
};

function NotificacoesPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Selection & Batch State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPurging, setIsPurging] = useState(false);

  useEffect(() => {
    loadNotifications();

    // Realtime channel listener
    const unsubscribe = NotificationService.subscribeToRealtime(() => {
      loadNotifications();
    });

    return () => unsubscribe();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await NotificationService.listAll();
      setNotifications(data);
    } catch (err) {
      console.error("Erro ao carregar notificações:", err);
      toast.error("Erro ao carregar central de notificações.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // Search
      const matchesSearch =
        notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchQuery.toLowerCase());

      // Status
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "unread"
          ? !notif.read
          : notif.read;

      // Category
      const matchesCategory =
        categoryFilter === "all" ? true : notif.category === categoryFilter;

      // Priority
      const matchesPriority =
        priorityFilter === "all" ? true : notif.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });
  }, [notifications, searchQuery, statusFilter, categoryFilter, priorityFilter]);

  // Selection Handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map((n) => n.id));
    }
  };

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Action: Mark single notification as read and navigate
  const handleNotifClick = async (notif: AdminNotification) => {
    if (!notif.read) {
      await NotificationService.markAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
      );
    }

    if (notif.linkHref) {
      navigate({ to: notif.linkHref as any });
    }
  };

  // Action: Mark single as read
  const handleMarkAsRead = async (id: string) => {
    await NotificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
    );
    toast.success("Notificação marcada como lida.");
  };

  // Action: Delete single
  const handleDeleteNotif = async (id: string) => {
    await NotificationService.delete(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    toast.success("Notificação removida.");
  };

  // Action: Mark All as Read
  const handleMarkAllRead = async () => {
    await NotificationService.markAllAsRead();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
    );
    toast.success("Todas as notificações foram marcadas como lidas.");
  };

  // Action: Batch Mark Selected as Read
  const handleBatchMarkRead = async () => {
    for (const id of selectedIds) {
      await NotificationService.markAsRead(id);
    }
    setNotifications((prev) =>
      prev.map((n) => (selectedIds.includes(n.id) ? { ...n, read: true } : n))
    );
    setSelectedIds([]);
    toast.success(`${selectedIds.length} notificações marcadas como lidas.`);
  };

  // Action: Batch Delete Selected
  const handleBatchDelete = async () => {
    if (!confirm(`Deseja excluir ${selectedIds.length} notificações selecionadas?`)) return;
    await NotificationService.deleteMany(selectedIds);
    setNotifications((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
    setSelectedIds([]);
    toast.success("Notificações excluídas com sucesso.");
  };

  // Action: Purge Read Notifications Older than 30 Days
  const handlePurgeOldRead = async () => {
    setIsPurging(true);
    try {
      const count = await NotificationService.purgeOldRead(30);
      await loadNotifications();
      toast.success(`Limpeza concluída! ${count} notificações lidas antigas foram removidas.`);
    } catch (err) {
      toast.error("Erro ao realizar limpeza de retenção.");
    } finally {
      setIsPurging(false);
    }
  };

  // Metrics
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const criticalCount = useMemo(() => notifications.filter((n) => n.priority === "critical" || n.priority === "high").length, [notifications]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-caption font-extrabold text-brand uppercase tracking-wider">
              <Bell className="size-4 text-accent animate-pulse" /> Central de Comunicação
            </div>
            <h1 className="text-h2 font-black text-foreground tracking-tight">
              Central de Notificações
            </h1>
            <p className="text-small text-muted-foreground">
              Acompanhe todos os alertas transacionais, avisos de estoque e atualizações do sistema em tempo real.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePurgeOldRead}
              disabled={isPurging}
              title="Apagar notificações lidas há mais de 30 dias"
              className="inline-flex items-center gap-2 shrink-0 rounded-2xl border border-border bg-surface px-4 py-2.5 text-small font-bold text-foreground hover:bg-muted transition-all cursor-pointer"
            >
              {isPurging ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4 text-muted-foreground" />}
              Limpar Lidas (+30d)
            </button>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-2 shrink-0 rounded-2xl bg-brand px-5 py-2.5 text-small font-extrabold text-brand-foreground shadow-xs hover:brightness-105 transition-all cursor-pointer"
              >
                <CheckCheck className="size-4" /> Marcar Todas como Lidas
              </button>
            )}
          </div>
        </div>

        {/* Top KPIs Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-caption font-extrabold text-muted-foreground uppercase">Total Registradas</span>
              <p className="text-h2 font-black text-foreground mt-0.5">{notifications.length}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Bell className="size-6" />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-caption font-extrabold text-muted-foreground uppercase">Não Lidas</span>
              <p className="text-h2 font-black text-accent mt-0.5">{unreadCount}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/20 text-accent-foreground">
              <Zap className="size-6 text-accent" />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-caption font-extrabold text-muted-foreground uppercase">Alta Prioridade / Críticas</span>
              <p className="text-h2 font-black text-red-500 mt-0.5">{criticalCount}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
              <AlertTriangle className="size-6" />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-caption font-extrabold text-muted-foreground uppercase">Retenção de Dados</span>
              <p className="text-small font-black text-foreground mt-1">30 dias para Lidas</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Clock className="size-6" />
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="rounded-3xl border border-border bg-surface p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por título ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-input bg-background pl-10 pr-4 py-2 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-2xl border border-input bg-background px-3 py-2 text-small font-bold text-foreground focus:outline-none cursor-pointer"
              >
                <option value="all">📂 Todas as Categorias</option>
                {Object.entries(categoryMap).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="rounded-2xl border border-input bg-background px-3 py-2 text-small font-bold text-foreground focus:outline-none cursor-pointer"
              >
                <option value="all">⚡ Toda Prioridade</option>
                <option value="critical">🔴 Crítica</option>
                <option value="high">🟡 Alta</option>
                <option value="medium">🔵 Média</option>
                <option value="low">⚪ Informativa</option>
              </select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 border-t border-border pt-3">
            {[
              { id: "all", label: `Todas (${notifications.length})` },
              { id: "unread", label: `● Não Lidas (${unreadCount})` },
              { id: "read", label: `✓ Lidas (${notifications.length - unreadCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={cn(
                  "rounded-2xl px-3.5 py-1.5 text-caption font-extrabold transition-all cursor-pointer",
                  statusFilter === tab.id
                    ? "bg-brand text-brand-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Batch Selection Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between rounded-2xl border border-accent/40 bg-accent/10 p-4 animate-in fade-in slide-in-from-top-2 duration-150">
            <span className="text-small font-black text-accent-foreground">
              {selectedIds.length} notificações selecionadas
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBatchMarkRead}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-caption font-extrabold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
              >
                <CheckCheck className="size-3.5" /> Marcar como Lidas
              </button>
              <button
                type="button"
                onClick={handleBatchDelete}
                className="inline-flex items-center gap-1.5 rounded-xl border border-danger/30 bg-danger/10 px-3 py-1.5 text-caption font-extrabold text-danger hover:bg-danger/20 transition-all cursor-pointer"
              >
                <Trash2 className="size-3.5" /> Excluir Selecionadas
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs space-y-3">
          {isLoading ? (
            <div className="flex py-12 justify-center">
              <Loader2 className="size-8 animate-spin text-brand" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground space-y-2">
              <Bell className="size-12 mx-auto opacity-30 text-brand" />
              <p className="text-small font-bold">Nenhuma notificação encontrada.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Select All Row */}
              <div className="flex items-center justify-between border-b border-border pb-2 px-3 text-caption font-extrabold text-muted-foreground uppercase">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === filteredNotifications.length &&
                      filteredNotifications.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded accent-brand size-4 cursor-pointer"
                  />
                  <span>Selecionar Todas</span>
                </label>
                <span>{filteredNotifications.length} resultados</span>
              </div>

              {filteredNotifications.map((notif) => {
                const isSelected = selectedIds.includes(notif.id);
                const catObj = categoryMap[notif.category] || { label: "Geral", icon: Bell };
                const CatIcon = catObj.icon;
                const priorityObj = priorityMap[notif.priority];

                return (
                  <div
                    key={notif.id}
                    className={cn(
                      "rounded-2xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group",
                      notif.read
                        ? "bg-background/40 border-border/50 text-muted-foreground"
                        : "bg-background border-brand/40 shadow-xs hover:border-brand"
                    )}
                  >
                    {/* Left: Checkbox + Icon + Info */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectId(notif.id)}
                        className="rounded accent-brand size-4 mt-1 shrink-0 cursor-pointer"
                      />

                      <div className="flex size-10 items-center justify-center rounded-2xl bg-muted shrink-0 mt-0.5">
                        <CatIcon className="size-5 text-brand" />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            onClick={() => handleNotifClick(notif)}
                            className={cn(
                              "font-black text-small hover:underline cursor-pointer",
                              notif.read ? "text-foreground/70" : "text-foreground"
                            )}
                          >
                            {notif.title}
                          </span>

                          <span
                            className={cn(
                              "rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase",
                              priorityObj.style
                            )}
                          >
                            {priorityObj.label}
                          </span>

                          <span className="rounded-xl border border-border bg-surface px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                            {catObj.label}
                          </span>
                        </div>

                        <p className="text-small text-muted-foreground leading-relaxed">
                          {notif.message}
                        </p>

                        <div className="flex items-center gap-3 text-caption text-muted-foreground pt-1">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="size-3" /> {formatTimeAgo(notif.createdAt)} ({formatDate(notif.createdAt)})
                          </span>

                          {notif.read && notif.readAt && (
                            <span className="text-emerald-500 font-bold">
                              ✓ Lida {formatTimeAgo(notif.readAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Actions */}
                    <div className="flex items-center justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border">
                      {notif.linkHref && (
                        <button
                          type="button"
                          onClick={() => handleNotifClick(notif)}
                          className="inline-flex items-center gap-1.5 rounded-2xl bg-brand/10 border border-brand/30 px-3 py-1.5 text-caption font-extrabold text-brand hover:bg-brand/20 transition-all cursor-pointer"
                        >
                          <ExternalLink className="size-3.5" /> Ir para Registro
                        </button>
                      )}

                      {!notif.read ? (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(notif.id)}
                          title="Marcar como lida"
                          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                        >
                          <CheckCheck className="size-4" />
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => handleDeleteNotif(notif.id)}
                        title="Excluir notificação"
                        className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
