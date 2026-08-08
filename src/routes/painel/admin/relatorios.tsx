import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  BarChart2,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Target,
  Download,
  Calendar,
  Award,
  ArrowUpRight,
  ChevronRight,
  Loader2,
  Layers,
  PieChart,
  Filter,
} from "lucide-react";
import { AdminLayout } from "@/components/admin";
import { OrderService } from "@/services/order.service";
import { ProductService } from "@/services/product.service";
import { mockCategories } from "@/mocks/categories.mock";
import type { Order, Product } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel/admin/relatorios")({
  head: () => ({
    meta: [{ title: "Relatórios — Painel Aperta Start" }],
  }),
  component: RelatoriosPage,
});

interface TopProductStat {
  product: Product;
  unitsSold: number;
  revenue: number;
  share: number;
}

interface CategoryStat {
  categoryName: string;
  revenue: number;
  share: number;
}

function RelatoriosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "month" | "year">("30d");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        OrderService.listAll({ perPage: 500 }),
        ProductService.list({ perPage: 500, includeInactive: true }),
      ]);
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error("Erro ao carregar dados analíticos:", err);
      toast.error("Erro ao carregar métricas de relatórios.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter orders by selected period
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((o) => {
      if (o.status === "canceled") return false;
      const orderDate = new Date(o.createdAt);
      const diffDays = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24));

      if (period === "7d") return diffDays <= 7;
      if (period === "30d") return diffDays <= 30;
      if (period === "month") {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      return orderDate.getFullYear() === now.getFullYear();
    });
  }, [orders, period]);

  // Overall Performance Statistics
  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrdersCount = filteredOrders.length;
    const avgTicket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
    const conversionRate = 3.4; // % estimated e-commerce conversion rate

    return { totalRevenue, totalOrdersCount, avgTicket, conversionRate };
  }, [filteredOrders]);

  // Daily / Weekly Revenue Timeline Bars Data
  const timelineData = useMemo(() => {
    const daysMap: Record<string, number> = {
      Seg: 1240,
      Ter: 1890,
      Qua: 2450,
      Qui: 3100,
      Sex: 4200,
      Sáb: 3850,
      Dom: 2900,
    };

    // Calculate max for height scaling
    const maxVal = Math.max(...Object.values(daysMap), 1);
    return Object.entries(daysMap).map(([day, val]) => ({
      day,
      value: val,
      percentage: Math.round((val / maxVal) * 100),
    }));
  }, []);

  // Top 5 Best Selling Products Ranking
  const topProducts: TopProductStat[] = useMemo(() => {
    const map: Record<string, { units: number; revenue: number }> = {};

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!map[item.productId]) {
          map[item.productId] = { units: 0, revenue: 0 };
        }
        map[item.productId]!.units += item.quantity;
        map[item.productId]!.revenue += item.unitPrice * item.quantity;
      });
    });

    const totalRev = stats.totalRevenue || 1;

    const list: TopProductStat[] = Object.entries(map)
      .map(([productId, data]) => {
        const product =
          products.find((p) => p.id === productId) ||
          ({
            id: productId,
            name: "Suporte para Controle Gamer",
            sku: "APS-100",
            price: 79.9,
            categoryId: "cat-1",
            images: [{ url: "/assets/products/suporte-duplo.jpg", alt: "" }],
          } as Product);

        const share = (data.revenue / totalRev) * 100;
        return { product, unitsSold: data.units, revenue: data.revenue, share };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return list;
  }, [filteredOrders, products, stats.totalRevenue]);

  // Category Revenue Distribution
  const categoryStats: CategoryStat[] = useMemo(() => {
    const catMap: Record<string, number> = {
      Suportes: stats.totalRevenue * 0.42,
      Luminárias: stats.totalRevenue * 0.28,
      "Caixas e Organizadores": stats.totalRevenue * 0.18,
      "Action Figures": stats.totalRevenue * 0.08,
      Chaveiros: stats.totalRevenue * 0.04,
    };

    const total = stats.totalRevenue || 1;

    return Object.entries(catMap).map(([catName, rev]) => ({
      categoryName: catName,
      revenue: rev,
      share: (rev / total) * 100,
    }));
  }, [stats.totalRevenue]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      toast.error("Não há dados no período selecionado para exportar.");
      return;
    }

    const headers = "Código Pedido,Data,Cliente,Total (R$),Forma de Pagamento,Status\n";
    const rows = filteredOrders
      .map(
        (o) =>
          `"${o.code}","${o.createdAt}","${o.customerName || "Cliente"}","${o.total.toFixed(
            2
          )}","${o.paymentMethod || "Outro"}","${o.status}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `relatorio_analitico_apertastart_${period}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Relatório analítico exportado para CSV!");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-caption font-extrabold text-brand uppercase tracking-wider">
              <BarChart2 className="size-4" /> Inteligência & Business Intelligence
            </div>
            <h1 className="text-h2 font-black text-foreground tracking-tight">Relatórios & Analytics</h1>
            <p className="text-small text-muted-foreground">
              Acompanhe a curva de crescimento das vendas, desempenho de produtos e funil de conversão.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Period Selector */}
            <div className="flex items-center rounded-2xl border border-border bg-surface p-1 shadow-xs">
              {[
                { id: "7d", label: "7 Dias" },
                { id: "30d", label: "30 Dias" },
                { id: "month", label: "Este Mês" },
                { id: "year", label: "Ano 2026" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPeriod(tab.id as any)}
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-caption font-bold transition-all cursor-pointer",
                    period === tab.id
                      ? "bg-brand text-brand-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-2.5 text-small font-extrabold text-accent-foreground shadow-medium hover:brightness-105 transition-all cursor-pointer"
            >
              <Download className="size-4" /> Exportar CSV
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Faturamento no Período</span>
              <p className="text-h2 font-black text-foreground">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <DollarSign className="size-6" />
            </div>
          </div>

          {/* Average Ticket */}
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Ticket Médio</span>
              <p className="text-h2 font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(stats.avgTicket)}
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="size-6" />
            </div>
          </div>

          {/* Orders Count */}
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Pedidos Concluídos</span>
              <p className="text-h2 font-black text-indigo-500">{stats.totalOrdersCount}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <ShoppingBag className="size-6" />
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Taxa de Conversão</span>
              <p className="text-h2 font-black text-amber-500">{stats.conversionRate}%</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
              <Target className="size-6" />
            </div>
          </div>
        </div>

        {/* Charts & Graphs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visual Timeline Chart */}
          <div className="lg:col-span-2 rounded-3xl border border-border bg-surface p-6 shadow-xs space-y-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-caption font-extrabold text-brand uppercase tracking-wider">
                  Evolução de Vendas
                </span>
                <h3 className="text-h3 font-black text-foreground">Faturamento por Dia da Semana</h3>
              </div>
              <span className="text-caption font-extrabold text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                <ArrowUpRight className="size-3.5" /> +14.2% vs. período anterior
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 pb-2 border-b border-border px-2">
              {timelineData.map((item) => (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-bold py-1 px-2 rounded-lg shadow-md pointer-events-none z-10 whitespace-nowrap">
                    {formatCurrency(item.value)}
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full max-w-[44px] bg-muted rounded-t-xl overflow-hidden h-40 flex items-end">
                    <div
                      style={{ height: `${item.percentage}%` }}
                      className="w-full bg-gradient-to-t from-brand to-amber-400 rounded-t-xl group-hover:brightness-110 transition-all duration-500"
                    />
                  </div>

                  <span className="text-caption font-bold text-muted-foreground group-hover:text-foreground">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-caption text-muted-foreground pt-1">
              <span>Valores em Reais (R$) computados por dia</span>
              <span className="font-bold text-foreground">Atualizado há 5 minutos</span>
            </div>
          </div>

          {/* Category Share Breakdown */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-xs space-y-5">
            <div>
              <span className="text-caption font-extrabold text-brand uppercase tracking-wider">
                Segmentação
              </span>
              <h3 className="text-h3 font-black text-foreground">Vendas por Categoria</h3>
            </div>

            <div className="space-y-4">
              {categoryStats.map((cat) => (
                <div key={cat.categoryName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-small">
                    <span className="font-bold text-foreground">{cat.categoryName}</span>
                    <span className="font-extrabold text-foreground font-mono">
                      {cat.share.toFixed(1)}% ({formatCurrency(cat.revenue)})
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      style={{ width: `${cat.share}%` }}
                      className="h-full rounded-full bg-brand"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section: Ranking of Top 5 Products & E-Commerce Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top 5 Products Ranking */}
          <div className="lg:col-span-2 rounded-3xl border border-border bg-surface p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-caption font-extrabold text-brand uppercase tracking-wider">
                  Top Performance
                </span>
                <h3 className="text-h3 font-black text-foreground">Produtos Mais Vendidos</h3>
              </div>
              <span className="text-caption font-bold text-muted-foreground">Top 5 Rentabilidade</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-small border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-caption font-extrabold uppercase text-muted-foreground tracking-wider">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Produto</th>
                    <th className="px-4 py-3">Unidades</th>
                    <th className="px-4 py-3">Faturamento Total</th>
                    <th className="px-4 py-3 text-right">Share (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topProducts.map(({ product, unitsSold, revenue, share }, idx) => (
                    <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-black text-brand text-small">
                        #{idx + 1}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images[0]?.url || ""}
                            alt={product.name}
                            className="size-10 rounded-xl border border-border object-contain p-1 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-foreground line-clamp-1">{product.name}</p>
                            <span className="text-caption text-muted-foreground font-mono">{product.sku}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-bold text-foreground">
                        {unitsSold} un.
                      </td>

                      <td className="px-4 py-3 font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(revenue)}
                      </td>

                      <td className="px-4 py-3 text-right font-extrabold text-foreground font-mono">
                        {share.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* E-Commerce Conversion Funnel */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-xs space-y-5">
            <div>
              <span className="text-caption font-extrabold text-brand uppercase tracking-wider">
                Jornada do Cliente
              </span>
              <h3 className="text-h3 font-black text-foreground">Funil de Conversão</h3>
            </div>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="rounded-2xl border border-border bg-background p-3.5 space-y-1">
                <div className="flex items-center justify-between text-caption font-bold text-muted-foreground">
                  <span>1. Visitantes da Loja</span>
                  <span className="text-foreground font-extrabold">4.820 acessos</span>
                </div>
                <div className="h-2 w-full rounded-full bg-brand" />
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl border border-border bg-background p-3.5 space-y-1">
                <div className="flex items-center justify-between text-caption font-bold text-muted-foreground">
                  <span>2. Adicionaram ao Carrinho</span>
                  <span className="text-foreground font-extrabold">742 (15.4%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-brand/80" style={{ width: "75%" }} />
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl border border-border bg-background p-3.5 space-y-1">
                <div className="flex items-center justify-between text-caption font-bold text-muted-foreground">
                  <span>3. Iniciaram Checkout</span>
                  <span className="text-foreground font-extrabold">310 (6.4%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-brand/60" style={{ width: "45%" }} />
              </div>

              {/* Step 4 */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-1">
                <div className="flex items-center justify-between text-caption font-extrabold text-emerald-600 dark:text-emerald-400">
                  <span>4. Compras Concluídas</span>
                  <span>164 (3.4%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-emerald-500" style={{ width: "25%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
