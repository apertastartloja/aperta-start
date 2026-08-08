import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  CreditCard,
  QrCode,
  FileText,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Download,
  Search,
  Calendar,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Sparkles,
  Percent,
  Wallet,
  ArrowDownRight,
  ShieldCheck,
} from "lucide-react";
import { AdminLayout } from "@/components/admin";
import { OrderService } from "@/services/order.service";
import type { Order } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel/admin/financeiro")({
  head: () => ({
    meta: [{ title: "Financeiro — Painel Aperta Start" }],
  }),
  component: FinanceiroPage,
});

interface FinancialTransaction {
  order: Order;
  fee: number;
  net: number;
  payoutStatus: "available" | "pending" | "canceled";
}

function FinanceiroPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState<"all" | "pix" | "card" | "boleto">("all");

  // Withdrawal modal state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [pixKey, setPixKey] = useState("12.345.678/0001-90 (CNPJ)");
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await OrderService.listAll({ perPage: 500 });
      setOrders(res.data);
    } catch (err) {
      console.error("Erro ao carregar dados financeiros:", err);
      toast.error("Erro ao carregar relatórios financeiros.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute fee and net for each transaction
  const transactions: FinancialTransaction[] = useMemo(() => {
    return orders.map((o) => {
      let fee = 0;
      if (o.paymentMethod === "pix") {
        fee = o.total * 0.0099; // 0.99% PIX fee
      } else if (o.paymentMethod === "card") {
        fee = o.total * 0.0299; // 2.99% Card fee
      } else {
        fee = 2.5; // R$ 2.50 fixed Boleto fee
      }
      fee = Math.min(fee, o.total);
      const net = Math.max(0, o.total - fee);

      let payoutStatus: FinancialTransaction["payoutStatus"] = "pending";
      if (o.status === "delivered" || o.status === "shipped" || o.status === "paid") {
        payoutStatus = "available";
      } else if (o.status === "canceled") {
        payoutStatus = "canceled";
      }

      return { order: o, fee, net, payoutStatus };
    });
  }, [orders]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(({ order }) => {
      if (methodFilter !== "all" && order.paymentMethod !== methodFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = order.code.toLowerCase().includes(q);
        const matchName = (order.customerName || "").toLowerCase().includes(q);
        return matchCode || matchName;
      }
      return true;
    });
  }, [transactions, methodFilter, searchQuery]);

  // Global Financial Statistics
  const stats = useMemo(() => {
    const validTxs = transactions.filter((t) => t.order.status !== "canceled");

    const grossRevenue = validTxs.reduce((sum, t) => sum + t.order.total, 0);
    const totalFees = validTxs.reduce((sum, t) => sum + t.fee, 0);
    const netRevenue = grossRevenue - totalFees;

    const availableBalance = transactions
      .filter((t) => t.payoutStatus === "available")
      .reduce((sum, t) => sum + t.net, 0);

    const pendingBalance = transactions
      .filter((t) => t.payoutStatus === "pending")
      .reduce((sum, t) => sum + t.net, 0);

    // Breakdown by payment method
    const pixTxs = validTxs.filter((t) => t.order.paymentMethod === "pix");
    const cardTxs = validTxs.filter((t) => t.order.paymentMethod === "card");
    const boletoTxs = validTxs.filter((t) => t.order.paymentMethod === "boleto");

    const pixGross = pixTxs.reduce((sum, t) => sum + t.order.total, 0);
    const cardGross = cardTxs.reduce((sum, t) => sum + t.order.total, 0);
    const boletoGross = boletoTxs.reduce((sum, t) => sum + t.order.total, 0);

    return {
      grossRevenue,
      netRevenue,
      totalFees,
      availableBalance,
      pendingBalance,
      pixGross,
      pixCount: pixTxs.length,
      cardGross,
      cardCount: cardTxs.length,
      boletoGross,
      boletoCount: boletoTxs.length,
    };
  }, [transactions]);

  // Handle withdrawal submission
  const handleRequestWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error("Informe um valor válido para transferência.");
      return;
    }
    if (amount > stats.availableBalance) {
      toast.error("O valor solicitado excede o saldo disponível para saque.");
      return;
    }

    setIsSubmittingWithdraw(true);
    setTimeout(() => {
      setIsSubmittingWithdraw(false);
      setIsWithdrawModalOpen(false);
      setWithdrawAmount("");
      toast.success(
        `Solicitação de saque no valor de ${formatCurrency(amount)} enviada com sucesso!`
      );
    }, 800);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error("Não há transações para exportar.");
      return;
    }

    const headers = "Código Pedido,Data,Cliente,Forma de Pagamento,Valor Bruto (R$),Taxa Gateway (R$),Valor Líquido (R$),Status Repasse\n";
    const rows = transactions
      .map(({ order: o, fee, net, payoutStatus }) => {
        const statusLabel =
          payoutStatus === "available"
            ? "Disponível"
            : payoutStatus === "pending"
            ? "Pendente"
            : "Cancelado";
        return `"${o.code}","${o.createdAt}","${o.customerName || "Cliente"}","${
          o.paymentMethod || "Outro"
        }","${o.total.toFixed(2)}","${fee.toFixed(2)}","${net.toFixed(2)}","${statusLabel}"`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `extrato_financeiro_apertastart_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Extrato financeiro exportado para CSV!");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-caption font-extrabold text-brand uppercase tracking-wider">
              <CreditCard className="size-4" /> Finanças & Fluxo de Caixa
            </div>
            <h1 className="text-h2 font-black text-foreground tracking-tight">Gestão Financeira</h1>
            <p className="text-small text-muted-foreground">
              Acompanhe o faturamento bruto, repasses de pagamentos, taxas de gateway e solicite saques.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-2.5 text-small font-bold text-foreground shadow-xs hover:bg-muted transition-colors cursor-pointer"
            >
              <Download className="size-4 text-brand" /> Exportar Extrato CSV
            </button>
            <button
              onClick={() => {
                setWithdrawAmount(stats.availableBalance.toFixed(2));
                setIsWithdrawModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-2.5 text-small font-extrabold text-accent-foreground shadow-medium hover:brightness-105 transition-all cursor-pointer"
            >
              <Wallet className="size-4" /> Solicitar Saque / Repasse
            </button>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Gross Revenue */}
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Faturamento Bruto</span>
              <p className="text-h2 font-black text-foreground">{formatCurrency(stats.grossRevenue)}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <DollarSign className="size-6" />
            </div>
          </div>

          {/* Available Payout */}
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Saldo Disponível para Saque</span>
              <p className="text-h2 font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(stats.availableBalance)}
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Wallet className="size-6" />
            </div>
          </div>

          {/* Net Revenue */}
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Receita Líquida Estimada</span>
              <p className="text-h2 font-black text-indigo-500">{formatCurrency(stats.netRevenue)}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <TrendingUp className="size-6" />
            </div>
          </div>

          {/* Total Gateway Fees */}
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Taxas Deduzidas de Gateway</span>
              <p className="text-h3 font-black text-rose-500">-{formatCurrency(stats.totalFees)}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
              <Percent className="size-6" />
            </div>
          </div>
        </div>

        {/* Payment Methods Revenue Distribution */}
        <div className="space-y-3">
          <h2 className="text-small font-bold text-foreground flex items-center gap-2">
            <CreditCard className="size-4 text-brand" /> Divisão por Método de Pagamento
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* PIX */}
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-caption font-extrabold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1.5">
                  <QrCode className="size-4" /> PIX (5% Desconto)
                </span>
                <span className="text-caption font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  {stats.pixCount} vendas
                </span>
              </div>
              <p className="text-h3 font-black text-foreground">{formatCurrency(stats.pixGross)}</p>
              <p className="text-caption text-muted-foreground">Taxa de processamento estimada: ~0.99%</p>
            </div>

            {/* Credit Card */}
            <div className="rounded-3xl border border-brand/30 bg-brand/5 p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-caption font-extrabold text-brand uppercase flex items-center gap-1.5">
                  <CreditCard className="size-4" /> Cartão de Crédito
                </span>
                <span className="text-caption font-bold text-brand bg-brand/10 px-2.5 py-0.5 rounded-full">
                  {stats.cardCount} vendas
                </span>
              </div>
              <p className="text-h3 font-black text-foreground">{formatCurrency(stats.cardGross)}</p>
              <p className="text-caption text-muted-foreground">Taxa de processamento estimada: ~2.99%</p>
            </div>

            {/* Boleto */}
            <div className="rounded-3xl border border-border bg-surface p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-caption font-extrabold text-muted-foreground uppercase flex items-center gap-1.5">
                  <FileText className="size-4 text-primary" /> Boleto Bancário
                </span>
                <span className="text-caption font-bold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
                  {stats.boletoCount} vendas
                </span>
              </div>
              <p className="text-h3 font-black text-foreground">{formatCurrency(stats.boletoGross)}</p>
              <p className="text-caption text-muted-foreground">Taxa fixa estimada: R$ 2.50 / boleto</p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="rounded-3xl border border-border bg-surface p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por código de pedido ou cliente no extrato..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-input bg-background pl-11 pr-4 py-2.5 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: "all", label: "Todas as Formas" },
              { id: "pix", label: "PIX" },
              { id: "card", label: "Cartão" },
              { id: "boleto", label: "Boleto" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMethodFilter(tab.id as any)}
                className={cn(
                  "rounded-xl border px-3 py-2 text-caption font-bold whitespace-nowrap transition-all cursor-pointer",
                  methodFilter === tab.id
                    ? "border-brand bg-brand text-brand-foreground shadow-xs"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Financial Transactions Statement Table */}
        <div className="rounded-3xl border border-border bg-surface shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <Loader2 className="size-8 animate-spin text-brand mx-auto" />
              <p className="text-small text-muted-foreground">Carregando extrato financeiro...</p>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-small border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-caption font-extrabold uppercase text-muted-foreground tracking-wider">
                    <th className="px-6 py-4">Transação / Data</th>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Forma de Pagamento</th>
                    <th className="px-6 py-4">Valor Bruto</th>
                    <th className="px-6 py-4">Taxa Gateway</th>
                    <th className="px-6 py-4">Valor Líquido</th>
                    <th className="px-6 py-4 text-right">Status do Repasse</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTransactions.map(({ order, fee, net, payoutStatus }) => (
                    <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                      {/* Code & Date */}
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-foreground font-mono">#{order.code}</span>
                          <p className="text-caption text-muted-foreground flex items-center gap-1">
                            <Calendar className="size-3" /> {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4 font-bold text-foreground">
                        {order.customerName || "Cliente Convidado"}
                      </td>

                      {/* Payment Method */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-caption font-bold text-foreground uppercase">
                          {order.paymentMethod === "pix" ? (
                            <>
                              <QrCode className="size-3.5 text-emerald-500" /> PIX
                            </>
                          ) : order.paymentMethod === "card" ? (
                            <>
                              <CreditCard className="size-3.5 text-brand" /> Cartão
                            </>
                          ) : (
                            <>
                              <FileText className="size-3.5 text-primary" /> Boleto
                            </>
                          )}
                        </span>
                      </td>

                      {/* Gross Amount */}
                      <td className="px-6 py-4 font-black text-foreground">
                        {formatCurrency(order.total)}
                      </td>

                      {/* Gateway Fee */}
                      <td className="px-6 py-4 text-rose-500 font-semibold text-caption">
                        -{formatCurrency(fee)}
                      </td>

                      {/* Net Amount */}
                      <td className="px-6 py-4 font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(net)}
                      </td>

                      {/* Payout Status */}
                      <td className="px-6 py-4 text-right">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-caption font-extrabold border",
                            payoutStatus === "available"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : payoutStatus === "pending"
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          )}
                        >
                          {payoutStatus === "available" ? (
                            <>
                              <CheckCircle2 className="size-3" /> Disponível
                            </>
                          ) : payoutStatus === "pending" ? (
                            <>
                              <Clock className="size-3" /> Em compensação
                            </>
                          ) : (
                            <>
                              <AlertCircle className="size-3" /> Cancelado
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center space-y-4">
              <CreditCard className="size-10 text-muted-foreground mx-auto" />
              <p className="text-small text-muted-foreground">Nenhuma transação encontrada no extrato.</p>
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-surface p-6 sm:p-8 space-y-6 shadow-2xl border border-border animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span className="text-caption font-extrabold text-brand uppercase tracking-wider">
                  Transferência Bancária
                </span>
                <h3 className="text-h3 font-black text-foreground">Solicitar Saque de Repasse</h3>
              </div>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="rounded-xl p-2 text-muted-foreground hover:text-foreground text-h4 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestWithdrawal} className="space-y-4">
              {/* Available summary box */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-1">
                <span className="text-caption font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  Saldo Disponível para Saque
                </span>
                <p className="text-h2 font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(stats.availableBalance)}
                </p>
              </div>

              {/* Amount input */}
              <div className="space-y-1.5">
                <label className="text-caption font-bold text-foreground">Valor a Transferir (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  max={stats.availableBalance}
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-h4 font-black text-foreground focus:border-ring focus:outline-none"
                />
              </div>

              {/* PIX Key / Bank details */}
              <div className="space-y-1.5">
                <label className="text-caption font-bold text-foreground">Chave PIX da Empresa (CNPJ)</label>
                <input
                  type="text"
                  required
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small font-mono text-foreground focus:border-ring focus:outline-none"
                />
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="size-3 text-emerald-500" /> Os repasses são efetuados no mesmo dia via PIX PJ.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2.5 text-small font-bold text-foreground hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdraw}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-small font-extrabold text-accent-foreground shadow-sm hover:brightness-105"
                >
                  {isSubmittingWithdraw ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Transferindo...
                    </>
                  ) : (
                    <>
                      <Wallet className="size-4" /> Confirmar Saque
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
