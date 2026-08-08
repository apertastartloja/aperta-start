import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  ShoppingBag,
  DollarSign,
  Award,
  Eye,
  Edit2,
  Trash2,
  Download,
  Loader2,
  CheckCircle2,
  UserCheck,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { AdminLayout } from "@/components/admin";
import { UserService } from "@/services/user.service";
import { OrderService, ORDER_STATUS_LABEL } from "@/services/order.service";
import type { User, Order } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel/admin/clientes")({
  head: () => ({
    meta: [{ title: "Clientes — Painel Aperta Start" }],
  }),
  component: ClientesPage,
});

interface CustomerMetrics {
  user: User;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string | null;
  tier: "vip" | "frequente" | "novo" | "sem_compras";
}

function ClientesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | "vip" | "frequente" | "novo" | "sem_compras">("all");

  // Selected Customer for Details Modal
  const [selectedMetrics, setSelectedMetrics] = useState<CustomerMetrics | null>(null);

  // Create/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "São Paulo",
    state: "SP",
    street: "Av. Paulista",
    number: "1000",
    zipCode: "01310-100",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, ordersRes] = await Promise.all([
        UserService.listAll(),
        OrderService.listAll({ perPage: 200 }),
      ]);
      setUsers(usersData);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
      toast.error("Erro ao carregar dados dos clientes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute metrics for each customer
  const customerMetricsList: CustomerMetrics[] = useMemo(() => {
    return users.map((u) => {
      const userOrders = orders.filter(
        (o) =>
          o.userId === u.id ||
          (o.customerEmail && o.customerEmail.toLowerCase() === u.email.toLowerCase())
      );
      const ordersCount = userOrders.length;
      const totalSpent = userOrders
        .filter((o) => o.status !== "canceled")
        .reduce((sum, o) => sum + o.total, 0);

      const sortedOrders = [...userOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const lastOrderDate = sortedOrders[0]?.createdAt || null;

      let tier: CustomerMetrics["tier"] = "sem_compras";
      if (totalSpent >= 200) {
        tier = "vip";
      } else if (ordersCount >= 2) {
        tier = "frequente";
      } else if (ordersCount === 1) {
        tier = "novo";
      }

      return { user: u, ordersCount, totalSpent, lastOrderDate, tier };
    });
  }, [users, orders]);

  // Filtered customer list
  const filteredMetrics = useMemo(() => {
    return customerMetricsList.filter(({ user, tier }) => {
      if (tierFilter !== "all" && tier !== tierFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = user.name.toLowerCase().includes(q);
        const matchEmail = user.email.toLowerCase().includes(q);
        const matchPhone = (user.phone || "").toLowerCase().includes(q);
        const matchCity = user.addresses.some(
          (a) => a.city.toLowerCase().includes(q) || a.state.toLowerCase().includes(q)
        );
        return matchName || matchEmail || matchPhone || matchCity;
      }
      return true;
    });
  }, [customerMetricsList, tierFilter, searchQuery]);

  // Overall Statistics
  const globalStats = useMemo(() => {
    const totalCount = users.length;
    const buyerCount = customerMetricsList.filter((m) => m.ordersCount > 0).length;
    const totalSpentSum = customerMetricsList.reduce((sum, m) => sum + m.totalSpent, 0);
    const avgLtv = buyerCount > 0 ? totalSpentSum / buyerCount : 0;
    const vipCount = customerMetricsList.filter((m) => m.tier === "vip").length;

    return { totalCount, buyerCount, avgLtv, vipCount };
  }, [users, customerMetricsList]);

  // Open Create/Edit modal
  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      city: "São Paulo",
      state: "SP",
      street: "",
      number: "",
      zipCode: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    const primaryAddr = u.addresses[0];
    setForm({
      name: u.name,
      email: u.email,
      phone: u.phone || "",
      city: primaryAddr?.city || "São Paulo",
      state: primaryAddr?.state || "SP",
      street: primaryAddr?.street || "",
      number: primaryAddr?.number || "",
      zipCode: primaryAddr?.zipCode || "",
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    setDeletingId(id);
    try {
      await UserService.delete(id);
      toast.success("Cliente removido com sucesso.");
      loadData();
    } catch (err) {
      console.error("Erro ao excluir cliente:", err);
      toast.error("Erro ao remover cadastro.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Informe nome e e-mail do cliente.");
      return;
    }

    setIsSubmitting(true);
    try {
      const addressData = {
        id: `adr-${Date.now()}`,
        label: "Principal",
        street: form.street || "Endereço cadastrado",
        number: form.number || "S/N",
        district: "Centro",
        city: form.city,
        state: form.state,
        zipCode: form.zipCode || "00000-000",
        isDefault: true,
      };

      if (editingUser) {
        await UserService.update(editingUser.id, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          addresses: [addressData],
        });
        toast.success(`Cadastro de ${form.name} atualizado!`);
      } else {
        await UserService.create({
          name: form.name,
          email: form.email,
          phone: form.phone,
          addresses: [addressData],
        });
        toast.success(`Novo cliente ${form.name} cadastrado!`);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error("Erro ao salvar cliente:", err);
      toast.error("Erro ao salvar cadastro do cliente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (customerMetricsList.length === 0) {
      toast.error("Não há clientes para exportar.");
      return;
    }

    const headers = "ID,Nome,E-mail,Telefone,Cidade,UF,Pedidos,Total Gasto (R$),Categoria,Data Cadastro\n";
    const rows = customerMetricsList
      .map(({ user: u, ordersCount, totalSpent, tier }) => {
        const addr = u.addresses[0];
        const city = addr?.city || "N/I";
        const uf = addr?.state || "N/I";
        return `"${u.id}","${u.name}","${u.email}","${u.phone || ""}","${city}","${uf}","${ordersCount}","${totalSpent.toFixed(
          2
        )}","${tier.toUpperCase()}","${u.createdAt}"`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `clientes_apertastart_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Base de clientes exportada para CSV!");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-caption font-extrabold text-brand uppercase tracking-wider">
              <Users className="size-4" /> Relacionamento & CRM
            </div>
            <h1 className="text-h2 font-black text-foreground tracking-tight">Gestão de Clientes</h1>
            <p className="text-small text-muted-foreground">
              Visualize a base de compradores, histórico de pedidos e valor acumulado (LTV).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-2.5 text-small font-bold text-foreground shadow-xs hover:bg-muted transition-colors cursor-pointer"
            >
              <Download className="size-4 text-brand" /> Exportar CSV
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-2.5 text-small font-extrabold text-accent-foreground shadow-medium hover:brightness-105 transition-all cursor-pointer"
            >
              <Plus className="size-4.5 stroke-[3]" /> Novo Cliente
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Base Total de Clientes</span>
              <p className="text-h2 font-black text-foreground">{globalStats.totalCount}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Users className="size-6" />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Clientes Compradores</span>
              <p className="text-h2 font-black text-emerald-500">{globalStats.buyerCount}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <UserCheck className="size-6" />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Ticket Médio / LTV</span>
              <p className="text-h3 font-black text-indigo-500">{formatCurrency(globalStats.avgLtv)}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <DollarSign className="size-6" />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Clientes VIP (R$ 200+)</span>
              <p className="text-h2 font-black text-amber-500">{globalStats.vipCount}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
              <Award className="size-6" />
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="rounded-3xl border border-border bg-surface p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail, telefone ou cidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-input bg-background pl-11 pr-4 py-2.5 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "Todos os Clientes" },
              { id: "vip", label: "Clientes VIP" },
              { id: "frequente", label: "Frequentes (2+)" },
              { id: "novo", label: "1º Pedido" },
              { id: "sem_compras", label: "Sem Pedidos" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTierFilter(tab.id as any)}
                className={cn(
                  "rounded-xl border px-3 py-2 text-caption font-bold whitespace-nowrap transition-all cursor-pointer",
                  tierFilter === tab.id
                    ? "border-brand bg-brand text-brand-foreground shadow-xs"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Customer Table */}
        <div className="rounded-3xl border border-border bg-surface shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <Loader2 className="size-8 animate-spin text-brand mx-auto" />
              <p className="text-small text-muted-foreground">Carregando lista de clientes...</p>
            </div>
          ) : filteredMetrics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-small border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-caption font-extrabold uppercase text-muted-foreground tracking-wider">
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Contato</th>
                    <th className="px-6 py-4">Localização</th>
                    <th className="px-6 py-4">Pedidos</th>
                    <th className="px-6 py-4">Total Gasto (LTV)</th>
                    <th className="px-6 py-4">Perfil</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredMetrics.map((item) => {
                    const { user: u, ordersCount, totalSpent, tier } = item;
                    const primaryAddr = u.addresses[0];

                    return (
                      <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                        {/* Customer Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-brand text-brand-foreground font-black text-small shadow-xs">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-foreground">{u.name}</p>
                              <span className="text-caption text-muted-foreground flex items-center gap-1">
                                <Calendar className="size-3" /> Cadastrado em {formatDate(u.createdAt)}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-4">
                          <div className="space-y-0.5 text-caption">
                            <p className="text-foreground font-medium flex items-center gap-1.5">
                              <Mail className="size-3 text-muted-foreground" /> {u.email}
                            </p>
                            {u.phone && (
                              <p className="text-muted-foreground flex items-center gap-1.5">
                                <Phone className="size-3 text-muted-foreground" /> {u.phone}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-6 py-4 text-caption text-muted-foreground">
                          {primaryAddr ? (
                            <span className="flex items-center gap-1 text-foreground font-medium">
                              <MapPin className="size-3.5 text-brand" /> {primaryAddr.city} / {primaryAddr.state}
                            </span>
                          ) : (
                            <span className="italic">Sem endereço</span>
                          )}
                        </td>

                        {/* Orders count */}
                        <td className="px-6 py-4">
                          <span className="font-bold text-foreground">
                            {ordersCount} {ordersCount === 1 ? "pedido" : "pedidos"}
                          </span>
                        </td>

                        {/* LTV */}
                        <td className="px-6 py-4 font-black text-foreground text-small">
                          {formatCurrency(totalSpent)}
                        </td>

                        {/* Tier badge */}
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-caption font-extrabold border",
                              tier === "vip"
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : tier === "frequente"
                                ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                : tier === "novo"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "border-border bg-muted text-muted-foreground"
                            )}
                          >
                            {tier === "vip"
                              ? "⭐ VIP"
                              : tier === "frequente"
                              ? "Frequente"
                              : tier === "novo"
                              ? "Novo Comprador"
                              : "Sem Compras"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedMetrics(item)}
                              title="Ver Detalhes do Cliente"
                              className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-caption font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                            >
                              <Eye className="size-3.5" /> Perfil & Pedidos
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(u)}
                              title="Editar cliente"
                              className="p-2 rounded-xl border border-border bg-background text-foreground hover:bg-muted transition-colors cursor-pointer"
                            >
                              <Edit2 className="size-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={deletingId === u.id}
                              title="Excluir cadastro"
                              className="p-2 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                            >
                              {deletingId === u.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Trash2 className="size-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center space-y-4">
              <Users className="size-10 text-muted-foreground mx-auto" />
              <p className="text-small text-muted-foreground">Nenhum cliente encontrado com os filtros aplicados.</p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedMetrics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl bg-surface p-6 sm:p-8 space-y-6 shadow-2xl border border-border animate-in fade-in zoom-in duration-200 my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-full bg-brand text-brand-foreground font-black text-h3 shadow-sm">
                  {selectedMetrics.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-h3 font-black text-foreground">{selectedMetrics.user.name}</h2>
                  <p className="text-caption text-muted-foreground flex items-center gap-2">
                    <Mail className="size-3.5" /> {selectedMetrics.user.email} • Cliente desde{" "}
                    {formatDate(selectedMetrics.user.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMetrics(null)}
                className="rounded-xl p-2 text-muted-foreground hover:text-foreground text-h4 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Financial & Order Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-border bg-background p-4 space-y-1">
                <span className="text-caption font-extrabold text-muted-foreground uppercase">Total Pedidos</span>
                <p className="text-h3 font-black text-foreground">{selectedMetrics.ordersCount}</p>
              </div>

              <div className="rounded-2xl border border-border bg-background p-4 space-y-1">
                <span className="text-caption font-extrabold text-muted-foreground uppercase">Total Acumulado (LTV)</span>
                <p className="text-h3 font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(selectedMetrics.totalSpent)}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-background p-4 space-y-1">
                <span className="text-caption font-extrabold text-muted-foreground uppercase">Telefone</span>
                <p className="text-small font-bold text-foreground">{selectedMetrics.user.phone || "Não informado"}</p>
              </div>
            </div>

            {/* Address */}
            <div className="rounded-2xl border border-border bg-background p-4 space-y-2">
              <span className="text-caption font-extrabold text-brand uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="size-3.5" /> Endereço Principal Cadastrado
              </span>
              {selectedMetrics.user.addresses[0] ? (
                <p className="text-small font-bold text-foreground">
                  {selectedMetrics.user.addresses[0].street}, {selectedMetrics.user.addresses[0].number}{" "}
                  {selectedMetrics.user.addresses[0].complement && `(${selectedMetrics.user.addresses[0].complement})`}{" "}
                  — {selectedMetrics.user.addresses[0].district}, {selectedMetrics.user.addresses[0].city} /{" "}
                  {selectedMetrics.user.addresses[0].state} (CEP: {selectedMetrics.user.addresses[0].zipCode})
                </p>
              ) : (
                <p className="text-small text-muted-foreground italic">Nenhum endereço salvo.</p>
              )}
            </div>

            {/* Customer Orders History */}
            <div className="space-y-3">
              <h3 className="text-small font-bold text-foreground border-b border-border pb-2 flex items-center gap-2">
                <ShoppingBag className="size-4 text-brand" /> Histórico de Pedidos Efetuados
              </h3>

              {orders.filter(
                (o) =>
                  o.userId === selectedMetrics.user.id ||
                  (o.customerEmail && o.customerEmail.toLowerCase() === selectedMetrics.user.email.toLowerCase())
              ).length > 0 ? (
                <div className="divide-y divide-border rounded-2xl border border-border bg-background overflow-hidden">
                  {orders
                    .filter(
                      (o) =>
                        o.userId === selectedMetrics.user.id ||
                        (o.customerEmail && o.customerEmail.toLowerCase() === selectedMetrics.user.email.toLowerCase())
                    )
                    .map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 hover:bg-surface transition-colors">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-foreground text-small font-mono">#{order.code}</span>
                            <span className="rounded-full bg-muted border border-border px-2.5 py-0.5 text-caption font-bold">
                              {ORDER_STATUS_LABEL[order.status]}
                            </span>
                          </div>
                          <p className="text-caption text-muted-foreground flex items-center gap-1">
                            <Calendar className="size-3" /> {formatDate(order.createdAt)} • {order.items.length} itens
                          </p>
                        </div>
                        <span className="font-black text-foreground text-small">{formatCurrency(order.total)}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-border rounded-2xl text-muted-foreground text-small">
                  Este cliente ainda não realizou nenhuma compra na loja.
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedMetrics(null)}
                className="rounded-xl border border-border px-5 py-2.5 text-small font-bold text-foreground hover:bg-muted"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-surface p-6 sm:p-8 space-y-6 shadow-2xl border border-border animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span className="text-caption font-extrabold text-brand uppercase tracking-wider">
                  {editingUser ? "Editar Cadastro" : "Novo Cliente"}
                </span>
                <h2 className="text-h3 font-black text-foreground">
                  {editingUser ? editingUser.name : "Cadastrar Cliente"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-2 text-muted-foreground hover:text-foreground text-h4 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-caption font-bold text-foreground">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cristiano Alves"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-caption font-bold text-foreground">E-mail</label>
                  <input
                    type="email"
                    required
                    placeholder="cliente@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-caption font-bold text-foreground">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(11) 98765-4321"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-caption font-bold text-foreground">Cidade</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-caption font-bold text-foreground">Estado (UF)</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })}
                    maxLength={2}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small font-bold text-foreground uppercase focus:border-ring focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2.5 text-small font-bold text-foreground hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-small font-extrabold text-accent-foreground shadow-sm hover:brightness-105"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Salvando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" /> {editingUser ? "Salvar Alterações" : "Cadastrar Cliente"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
