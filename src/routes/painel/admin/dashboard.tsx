import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  DollarSign,
  ChevronRight,
  Sparkles,
  Inbox,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { AdminLayout } from "@/components/admin/admin-layout";
import { OrderService, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/services/order.service";
import { UserService } from "@/services/user.service";
import { ProductService } from "@/services/product.service";
import { formatCurrency, formatDate } from "@/utils/format";
import type { Order, Product, User } from "@/types";

export const Route = createFileRoute("/painel/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Painel Administrativo Aperta Start" },
      { name: "description", content: "Visão geral de vendas, pedidos e clientes da Aperta Start." },
    ],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      OrderService.listAll({ perPage: 200 }),
      UserService.listAll(),
      ProductService.list({ perPage: 200, includeInactive: true }),
    ])
      .then(([ordersRes, usersRes, productsRes]) => {
        if (!isMounted) return;
        setOrders(ordersRes.data);
        setUsers(usersRes);
        setProducts(productsRes.data);
      })
      .catch((err) => {
        console.error("Erro ao carregar dados do dashboard:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Real Metrics
  const validOrders = useMemo(() => orders.filter((o) => o.status !== "canceled"), [orders]);

  const totalRevenue = useMemo(
    () => validOrders.reduce((sum, o) => sum + o.total, 0),
    [validOrders]
  );

  const totalOrdersCount = orders.length;

  const totalCustomersCount = useMemo(() => {
    const emails = new Set<string>();
    users.forEach((u) => {
      if (u.email) emails.add(u.email.toLowerCase());
    });
    orders.forEach((o) => {
      if (o.customerEmail) emails.add(o.customerEmail.toLowerCase());
    });
    return emails.size;
  }, [users, orders]);

  const totalProductsCount = products.length;

  const avgTicket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  // Real 7-day Sales Chart Data
  const salesChartData = useMemo(() => {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const now = new Date();
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayLabel = days[d.getDay()]!;
      const dateStr = d.toISOString().split("T")[0]!;

      const dayOrders = validOrders.filter((o) => o.createdAt.startsWith(dateStr));
      const dayVendas = dayOrders.reduce((acc, o) => acc + o.total, 0);

      result.push({
        label: dayLabel,
        vendas: dayVendas,
        pedidos: dayOrders.length,
      });
    }

    return result;
  }, [validOrders]);

  // Top Selling Products based on actual orders or store products
  const topProducts = useMemo(() => {
    const salesMap: Record<string, { count: number; total: number }> = {};
    validOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!salesMap[item.productId]) {
          salesMap[item.productId] = { count: 0, total: 0 };
        }
        salesMap[item.productId]!.count += item.quantity;
        salesMap[item.productId]!.total += item.unitPrice * item.quantity;
      });
    });

    const sortedBySales = Object.entries(salesMap)
      .map(([id, info]) => {
        const prod = products.find((p) => p.id === id);
        return {
          id,
          name: prod?.name || "Produto",
          sku: prod?.sku || "APS",
          price: prod?.price || info.total / (info.count || 1),
          image: prod?.images[0]?.url || "/placeholder-product.svg",
          salesCount: info.count,
        };
      })
      .sort((a, b) => b.salesCount - a.salesCount);

    return sortedBySales.slice(0, 5);
  }, [validOrders, products]);

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5);
  }, [orders]);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-caption font-black text-brand uppercase tracking-wider">
              <Sparkles className="size-4 text-accent" /> Visão Geral em Tempo Real
            </div>
            <h1 className="text-h2 font-black text-foreground">Dashboard Geral</h1>
            <p className="text-small text-muted-foreground">
              Acompanhe o desempenho de vendas, pedidos e indicadores da Aperta Start.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-xl border border-border bg-surface px-4 py-2 text-small font-bold text-foreground shadow-xs">
              📅 Hoje: {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Vendas */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-light hover:shadow-medium transition-all space-y-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-caption font-bold">Total de Vendas</span>
              <div className="grid size-9 place-items-center rounded-xl bg-accent/20 text-accent-foreground font-black">
                <DollarSign className="size-5" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-h3 font-black text-foreground">{formatCurrency(totalRevenue)}</p>
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground">
                <span>{validOrders.length} {validOrders.length === 1 ? "venda paga" : "vendas pagas"}</span>
              </div>
            </div>
          </div>

          {/* Pedidos */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-light hover:shadow-medium transition-all space-y-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-caption font-bold">Pedidos</span>
              <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary font-black">
                <ShoppingBag className="size-5" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-h3 font-black text-foreground">{totalOrdersCount}</p>
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground">
                <span>{totalOrdersCount === 1 ? "pedido registrado" : "pedidos registrados"}</span>
              </div>
            </div>
          </div>

          {/* Clientes */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-light hover:shadow-medium transition-all space-y-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-caption font-bold">Clientes</span>
              <div className="grid size-9 place-items-center rounded-xl bg-brand/10 text-brand font-black">
                <Users className="size-5" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-h3 font-black text-foreground">{totalCustomersCount}</p>
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground">
                <span>{totalCustomersCount === 1 ? "cliente na base" : "clientes na base"}</span>
              </div>
            </div>
          </div>

          {/* Produtos */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-light hover:shadow-medium transition-all space-y-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-caption font-bold">Produtos</span>
              <div className="grid size-9 place-items-center rounded-xl bg-info/10 text-info font-black">
                <Package className="size-5" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-h3 font-black text-foreground">{totalProductsCount}</p>
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground">
                <span>{totalProductsCount === 1 ? "produto ativo" : "produtos no catálogo"}</span>
              </div>
            </div>
          </div>

          {/* Ticket Médio */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-light hover:shadow-medium transition-all space-y-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-caption font-bold">Ticket Médio</span>
              <div className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 font-black">
                <TrendingUp className="size-5" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-h3 font-black text-foreground">{formatCurrency(avgTicket)}</p>
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground">
                <span>por pedido</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Top Products Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Chart (2 cols) */}
          <div className="lg:col-span-2 rounded-3xl border border-border bg-surface p-6 shadow-medium space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
              <div>
                <h3 className="text-h4 font-black text-foreground">Faturamento Semanal</h3>
                <p className="text-caption text-muted-foreground">Evolução do faturamento diário (em R$)</p>
              </div>
              <div className="inline-flex rounded-xl bg-background p-1 border border-border">
                <span className="rounded-lg bg-primary px-3 py-1 text-caption font-bold text-primary-foreground shadow-xs">
                  Últimos 7 Dias
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffc933" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ffc933" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                  <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-border)",
                      borderRadius: "12px",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                      color: "var(--color-foreground)",
                      fontWeight: "bold",
                    }}
                    formatter={(value: any) => [`R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Vendas"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="vendas"
                    stroke="#ffc933"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#salesGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Selling Products (1 col) */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-medium space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-h4 font-black text-foreground">Mais Vendidos</h3>
                <p className="text-caption text-muted-foreground">Campeões do catálogo</p>
              </div>
              <Link to="/painel/admin/produtos/lista" className="text-muted-foreground hover:text-foreground">
                <ChevronRight className="size-5" />
              </Link>
            </div>

            <div className="space-y-4">
              {topProducts.length === 0 ? (
                <div className="py-8 text-center space-y-1">
                  <p className="text-small font-bold text-foreground">Nenhuma venda registrada ainda</p>
                  <p className="text-caption text-muted-foreground">
                    Os campeões de vendas aparecerão aqui conforme os primeiros pedidos forem concluídos.
                  </p>
                </div>
              ) : (
                topProducts.map((prod, idx) => (
                  <div key={prod.id} className="flex items-center gap-3.5 p-2 rounded-2xl hover:bg-muted/50 transition-colors">
                    <span className="font-black text-caption text-muted-foreground size-5 grid place-items-center">
                      #{idx + 1}
                    </span>
                    <img
                      src={prod.image || "/placeholder-product.svg"}
                      alt={prod.name}
                      onError={(e) => {
                        if (!e.currentTarget.src.endsWith("/placeholder-product.svg")) {
                          e.currentTarget.src = "/placeholder-product.svg";
                        }
                      }}
                      className="size-12 rounded-xl object-contain bg-background border border-border p-1 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-small font-bold text-foreground truncate">{prod.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {prod.sku} • {prod.salesCount} {prod.salesCount === 1 ? "venda" : "vendas"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-small font-black text-foreground">{formatCurrency(prod.price)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-medium space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-h4 font-black text-foreground">Pedidos Recentes</h3>
              <p className="text-caption text-muted-foreground">Últimas transações realizadas na plataforma</p>
            </div>
            <Link to="/painel/admin/pedidos" className="text-small font-bold text-brand hover:underline self-start sm:self-auto">
              Ver todos os pedidos →
            </Link>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground text-small">
                <Loader2 className="size-5 animate-spin" /> Carregando pedidos...
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <Inbox className="size-6" />
                </div>
                <p className="text-small font-bold text-foreground">Nenhum pedido recente registrado</p>
                <p className="text-caption text-muted-foreground max-w-sm mx-auto">
                  Assim que novos clientes finalizarem compras na loja, os pedidos aparecerão aqui em tempo real.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-small">
                <thead>
                  <tr className="border-b border-border text-caption text-muted-foreground">
                    <th className="py-3 px-4 font-extrabold">ID Pedido</th>
                    <th className="py-3 px-4 font-extrabold">Cliente</th>
                    <th className="py-3 px-4 font-extrabold">Itens</th>
                    <th className="py-3 px-4 font-extrabold">Valor Total</th>
                    <th className="py-3 px-4 font-extrabold">Status</th>
                    <th className="py-3 px-4 font-extrabold">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3.5 px-4 font-extrabold text-foreground">#{order.code || order.id}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-foreground">{order.customerName || "Cliente Convidado"}</div>
                        <div className="text-[11px] text-muted-foreground">{order.customerEmail || "—"}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-foreground">
                        {order.items.length} {order.items.length === 1 ? "item" : "itens"}
                      </td>
                      <td className="py-3.5 px-4 font-black text-foreground">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-caption font-bold border ${
                            ORDER_STATUS_COLOR[order.status] || "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {ORDER_STATUS_LABEL[order.status] || order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground text-[12px]">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
