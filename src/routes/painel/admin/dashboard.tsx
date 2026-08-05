import { createFileRoute } from "@tanstack/react-router";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Sparkles,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
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
import { mockProducts } from "@/mocks";

export const Route = createFileRoute("/painel/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Painel Administrativo Aperta Start" },
      { name: "description", content: "Visão geral de vendas, pedidos e clientes da Aperta Start." },
    ],
  }),
  component: AdminDashboardPage,
});

// Mock Sales Chart Data (Últimos 7 dias / semanas)
const mockSalesChartData = [
  { label: "Seg", vendas: 12400, pedidos: 32 },
  { label: "Ter", vendas: 18900, pedidos: 45 },
  { label: "Qua", vendas: 15600, pedidos: 38 },
  { label: "Qui", vendas: 24800, pedidos: 59 },
  { label: "Sex", vendas: 31200, pedidos: 74 },
  { label: "Sáb", vendas: 28400, pedidos: 68 },
  { label: "Dom", vendas: 17650, pedidos: 41 },
];

// Mock Recent Orders Data
const mockRecentOrders = [
  {
    id: "PED-9842",
    cliente: "Guilherme Santos",
    email: "guilherme@exemplo.com",
    itens: 3,
    total: 849.9,
    status: "Entregue",
    data: "Há 15 min",
  },
  {
    id: "PED-9841",
    cliente: "Mariana Oliveira",
    email: "mariana.o@exemplo.com",
    itens: 1,
    total: 359.0,
    status: "Processando",
    data: "Há 42 min",
  },
  {
    id: "PED-9840",
    cliente: "Carlos Eduardo",
    email: "carlos.edu@exemplo.com",
    itens: 2,
    total: 1290.0,
    status: "Aguardando Pagamento",
    data: "Há 1 hora",
  },
  {
    id: "PED-9839",
    cliente: "Fernanda Lima",
    email: "nanda.lima@exemplo.com",
    itens: 5,
    total: 2150.8,
    status: "Entregue",
    data: "Há 2 horas",
  },
  {
    id: "PED-9838",
    cliente: "Roberto Alves",
    email: "roberto@exemplo.com",
    itens: 1,
    total: 199.9,
    status: "Processando",
    data: "Há 3 horas",
  },
];

function AdminDashboardPage() {
  const topProducts = mockProducts.slice(0, 4);

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
              <p className="text-h3 font-black text-foreground">R$ 148.950,00</p>
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="size-4" />
                <span>+18.4% este mês</span>
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
              <p className="text-h3 font-black text-foreground">1.284</p>
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="size-4" />
                <span>+12.3% vs mês ant.</span>
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
              <p className="text-h3 font-black text-foreground">3.842</p>
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="size-4" />
                <span>+8.1% este mês</span>
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
              <p className="text-h3 font-black text-foreground">156</p>
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground">
                <span>+4 novos adicionados</span>
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
              <p className="text-h3 font-black text-foreground">R$ 412,50</p>
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="size-4" />
                <span>+3.2% este mês</span>
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
                <AreaChart data={mockSalesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    formatter={(value: any) => [`R$ ${Number(value).toLocaleString("pt-BR")}`, "Vendas"]}
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
                <p className="text-caption text-muted-foreground">Campeões de receita</p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </div>

            <div className="space-y-4">
              {topProducts.map((prod, idx) => (
                <div key={prod.id} className="flex items-center gap-3.5 p-2 rounded-2xl hover:bg-muted/50 transition-colors">
                  <span className="font-black text-caption text-muted-foreground size-5 grid place-items-center">
                    #{idx + 1}
                  </span>
                  <img
                    src={typeof prod.images[0] === "string" ? prod.images[0] : prod.images[0]?.url}
                    alt={prod.name}
                    className="size-12 rounded-xl object-contain bg-background border border-border p-1 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-small font-bold text-foreground truncate">{prod.name}</p>
                    <p className="text-[11px] text-muted-foreground">{prod.sku || "Produto"} • {prod.reviewsCount || (120 + idx * 15)} vds</p>
                  </div>
                  <div className="text-right">
                    <p className="text-small font-black text-foreground">R$ {prod.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
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
            <button className="text-small font-bold text-brand hover:underline self-start sm:self-auto">
              Ver todos os pedidos →
            </button>
          </div>

          <div className="overflow-x-auto">
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
                {mockRecentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-foreground">{order.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-foreground">{order.cliente}</div>
                      <div className="text-[11px] text-muted-foreground">{order.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-foreground">{order.itens} itens</td>
                    <td className="py-3.5 px-4 font-black text-foreground">
                      R$ {order.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4">
                      {order.status === "Entregue" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-caption font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="size-3" /> Entregue
                        </span>
                      )}
                      {order.status === "Processando" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-info/10 px-2.5 py-1 text-caption font-bold text-info">
                          <Clock className="size-3" /> Processando
                        </span>
                      )}
                      {order.status === "Aguardando Pagamento" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1 text-caption font-bold text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="size-3" /> Pagamento
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground text-[12px]">{order.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
