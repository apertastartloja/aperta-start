import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Package,
  Search,
  Filter,
  Truck,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  TrendingUp,
  CreditCard,
  QrCode,
  FileText,
  Copy,
  ExternalLink,
  Loader2,
  MapPin,
  User as UserIcon,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { AdminLayout } from "@/components/admin";
import { OrderService, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/services/order.service";
import { EmailService } from "@/services/email.service";
import type { Order, OrderStatus } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel/admin/pedidos")({
  head: () => ({
    meta: [{ title: "Gestão de Pedidos — Painel Aperta Start" }],
  }),
  component: PedidosPage,
});

const STATUS_BADGE_STYLE: Record<OrderStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  paid: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  processing: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
  shipped: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
  delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  canceled: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
};

const PAYMENT_ICON: Record<string, typeof CreditCard> = {
  pix: QrCode,
  card: CreditCard,
  boleto: FileText,
};

function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Selected Order for Tracking Modal
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [trackingCode, setTrackingCode] = useState("");
  const [carrier, setCarrier] = useState("SEDEX Express");
  const [isSavingTracking, setIsSavingTracking] = useState(false);

  // Load orders
  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await OrderService.listAll({ perPage: 100 });
      setOrders(res.data);
    } catch (err) {
      console.error("Erro ao carregar pedidos:", err);
      toast.error("Erro ao carregar lista de pedidos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = o.code.toLowerCase().includes(q);
        const matchName = (o.customerName || "").toLowerCase().includes(q);
        const matchEmail = (o.customerEmail || "").toLowerCase().includes(q);
        const matchTracking = (o.trackingCode || "").toLowerCase().includes(q);
        return matchCode || matchName || matchEmail || matchTracking;
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = orders.length;
    const pendingCount = orders.filter((o) => o.status === "pending").length;
    const processingCount = orders.filter((o) => o.status === "processing" || o.status === "paid").length;
    const shippedCount = orders.filter((o) => o.status === "shipped").length;
    const totalRevenue = orders
      .filter((o) => o.status !== "canceled")
      .reduce((sum, o) => sum + o.total, 0);

    return { totalCount, pendingCount, processingCount, shippedCount, totalRevenue };
  }, [orders]);

  // Handle status update
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await OrderService.updateStatus(orderId, newStatus);
      toast.success(`Status do pedido alterado para "${ORDER_STATUS_LABEL[newStatus]}".`);
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      console.error("Erro ao alterar status:", err);
      toast.error("Não foi possível atualizar o status.");
    }
  };

  // Open tracking modal
  const handleOpenTrackingModal = (order: Order) => {
    setTrackingOrder(order);
    setTrackingCode(order.trackingCode || "");
    setCarrier(order.carrier || "SEDEX Express");
  };

  // Save tracking info
  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingOrder) return;
    if (!trackingCode.trim()) {
      toast.error("Informe o código de rastreamento.");
      return;
    }

    setIsSavingTracking(true);
    try {
      const updatedOrder = await OrderService.updateTrackingInfo(
        trackingOrder.id,
        trackingCode.trim(),
        carrier
      );

      // Send Resend transactional tracking email to customer
      EmailService.sendTrackingUpdate(updatedOrder).catch((err) =>
        console.warn("Aviso ao enviar e-mail de rastreamento:", err)
      );

      toast.success("Código de rastreio salvo, status atualizado e e-mail enviado ao cliente!");
      setTrackingOrder(null);
      loadOrders();
    } catch (err) {
      console.error("Erro ao salvar rastreamento:", err);
      toast.error("Erro ao salvar dados de rastreamento.");
    } finally {
      setIsSavingTracking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-caption font-extrabold text-brand uppercase tracking-wider">
              <Package className="size-4" /> Vendas & Operações
            </div>
            <h1 className="text-h2 font-black text-foreground tracking-tight">Gestão de Pedidos</h1>
            <p className="text-small text-muted-foreground">
              Acompanhe vendas, gerencie envios e insira códigos de rastreamento em tempo real.
            </p>
          </div>

          <button
            onClick={loadOrders}
            className="self-start sm:self-auto inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-2.5 text-small font-bold text-foreground shadow-xs hover:bg-muted transition-colors cursor-pointer"
          >
            {isLoading ? <Loader2 className="size-4 animate-spin text-brand" /> : <Clock className="size-4 text-brand" />}
            Atualizar Lista
          </button>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Orders */}
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Total de Pedidos</span>
              <p className="text-h2 font-black text-foreground">{stats.totalCount}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Package className="size-6" />
            </div>
          </div>

          {/* Card 2: Pending Payment */}
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Aguardando Pagamento</span>
              <p className="text-h2 font-black text-amber-500">{stats.pendingCount}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
              <Clock className="size-6" />
            </div>
          </div>

          {/* Card 3: In Processing / Shipped */}
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Em Separação / Enviados</span>
              <p className="text-h2 font-black text-indigo-500">{stats.processingCount + stats.shippedCount}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <Truck className="size-6" />
            </div>
          </div>

          {/* Card 4: Total Revenue */}
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Faturamento Bruto</span>
              <p className="text-h3 font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <DollarSign className="size-6" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="rounded-3xl border border-border bg-surface p-4 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por código (#APS-...), nome do cliente, e-mail ou rastreio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-input bg-background pl-11 pr-4 py-2.5 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-caption font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Status Select for Mobile/Desktop */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {[
                { id: "all", label: "Todos os Pedidos" },
                { id: "pending", label: "Aguardando" },
                { id: "paid", label: "Pagos" },
                { id: "processing", label: "Em Separação" },
                { id: "shipped", label: "Enviados" },
                { id: "delivered", label: "Entregues" },
                { id: "canceled", label: "Cancelados" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-caption font-bold whitespace-nowrap transition-all cursor-pointer",
                    statusFilter === tab.id
                      ? "border-brand bg-brand text-brand-foreground shadow-xs"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table Card */}
        <div className="rounded-3xl border border-border bg-surface shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <Loader2 className="size-8 animate-spin text-brand mx-auto" />
              <p className="text-small text-muted-foreground font-medium">Carregando pedidos...</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-small border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-caption font-extrabold uppercase text-muted-foreground tracking-wider">
                    <th className="px-6 py-4">Pedido / Data</th>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Itens</th>
                    <th className="px-6 py-4">Pagamento</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.map((order) => {
                    const PayIcon = (order.paymentMethod && PAYMENT_ICON[order.paymentMethod]) || CreditCard;
                    return (
                      <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                        {/* Code & Date */}
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <span className="font-black text-foreground font-mono text-small flex items-center gap-1.5">
                              #{order.code}
                            </span>
                            <span className="text-caption text-muted-foreground flex items-center gap-1">
                              <Calendar className="size-3" />
                              {formatDate(order.createdAt)}
                            </span>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <p className="font-bold text-foreground">
                              {order.customerName || `Cliente #${order.userId.slice(0, 6)}`}
                            </p>
                            <p className="text-caption text-muted-foreground">
                              {order.customerEmail || "Sem e-mail cadastrado"}
                            </p>
                          </div>
                        </td>

                        {/* Items */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                              {order.items.slice(0, 3).map((item, idx) => (
                                <img
                                  key={idx}
                                  src={item.productImage || ""}
                                  alt={item.productName}
                                  className="size-8 rounded-lg border border-border bg-background object-contain p-0.5"
                                />
                              ))}
                            </div>
                            <span className="text-caption font-semibold text-muted-foreground">
                              {order.items.length} {order.items.length === 1 ? "item" : "itens"}
                            </span>
                          </div>
                        </td>

                        {/* Payment Method */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-caption font-bold text-foreground uppercase">
                            <PayIcon className="size-3.5 text-brand" />
                            {order.paymentMethod === "pix"
                              ? "PIX"
                              : order.paymentMethod === "card"
                              ? "Cartão"
                              : order.paymentMethod === "boleto"
                              ? "Boleto"
                              : "Outro"}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="px-6 py-4 font-black text-foreground text-small">
                          {formatCurrency(order.total)}
                        </td>

                        {/* Status Dropdown/Badge */}
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                            className={cn(
                              "rounded-xl border px-3 py-1.5 text-caption font-extrabold focus:outline-none cursor-pointer transition-all",
                              STATUS_BADGE_STYLE[order.status]
                            )}
                          >
                            <option value="pending">Aguardando Pagamento</option>
                            <option value="paid">Pagamento Aprovado</option>
                            <option value="processing">Em Separação</option>
                            <option value="shipped">Enviado</option>
                            <option value="delivered">Entregue</option>
                            <option value="canceled">Cancelado</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenTrackingModal(order)}
                              title={order.trackingCode ? `Rastreio: ${order.trackingCode}` : "Adicionar Rastreio"}
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-caption font-bold transition-all cursor-pointer",
                                order.trackingCode
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "border-border bg-background text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <Truck className="size-3.5" />
                              {order.trackingCode ? "Rastreio" : "+ Frete"}
                            </button>

                            <button
                              onClick={() => setSelectedOrder(order)}
                              title="Ver Detalhes do Pedido"
                              className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-caption font-bold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                            >
                              <Eye className="size-3.5" /> Detalhes
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
            /* Empty State */
            <div className="p-12 text-center space-y-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground mx-auto">
                <Package className="size-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-h4 font-bold text-foreground">Nenhum pedido encontrado</h3>
                <p className="text-small text-muted-foreground max-w-sm mx-auto">
                  Não foi encontrado nenhum pedido correspondente aos filtros de busca aplicados.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-small font-bold text-primary-foreground hover:bg-primary/90"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-surface p-6 sm:p-8 space-y-6 shadow-2xl border border-border animate-in fade-in zoom-in duration-200 my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-h3 font-black text-foreground font-mono">
                    #{selectedOrder.code}
                  </h2>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-0.5 text-caption font-extrabold",
                      STATUS_BADGE_STYLE[selectedOrder.status]
                    )}
                  >
                    {ORDER_STATUS_LABEL[selectedOrder.status]}
                  </span>
                </div>
                <p className="text-caption text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="size-3.5" /> Realizado em {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-h4 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Buyer & Shipping Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Buyer details */}
              <div className="rounded-2xl border border-border bg-background p-4 space-y-2">
                <span className="text-caption font-extrabold text-brand uppercase tracking-wider flex items-center gap-1.5">
                  <UserIcon className="size-3.5" /> Dados do Cliente
                </span>
                <p className="font-bold text-foreground text-small">
                  {selectedOrder.customerName || "Cliente Convidado"}
                </p>
                <div className="space-y-1 text-caption text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <Mail className="size-3 text-muted-foreground" />
                    {selectedOrder.customerEmail || "Não informado"}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="size-3 text-muted-foreground" />
                    {selectedOrder.customerPhone || "Não informado"}
                  </p>
                </div>
              </div>

              {/* Shipping address */}
              <div className="rounded-2xl border border-border bg-background p-4 space-y-2">
                <span className="text-caption font-extrabold text-brand uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="size-3.5" /> Endereço de Entrega
                </span>
                <p className="font-bold text-foreground text-small">
                  {selectedOrder.shippingAddress?.street || "Endereço cadastrado"},{" "}
                  {selectedOrder.shippingAddress?.number}
                </p>
                <p className="text-caption text-muted-foreground">
                  {selectedOrder.shippingAddress?.complement && `${selectedOrder.shippingAddress.complement} • `}
                  {selectedOrder.shippingAddress?.district} — {selectedOrder.shippingAddress?.city} /{" "}
                  {selectedOrder.shippingAddress?.state}
                </p>
                <p className="text-caption font-mono text-muted-foreground">
                  CEP: {selectedOrder.shippingAddress?.zipCode || "N/I"}
                </p>
              </div>
            </div>

            {/* Tracking Code Section */}
            <div className="rounded-2xl border border-border bg-background p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-caption font-extrabold text-brand uppercase tracking-wider flex items-center gap-1.5">
                  <Truck className="size-3.5" /> Rastreamento do Envio
                </span>
                <button
                  onClick={() => {
                    const ord = selectedOrder;
                    setSelectedOrder(null);
                    handleOpenTrackingModal(ord);
                  }}
                  className="text-caption font-bold text-brand hover:underline"
                >
                  {selectedOrder.trackingCode ? "Editar Rastreio" : "+ Adicionar Rastreio"}
                </button>
              </div>

              {selectedOrder.trackingCode ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-surface p-3 border border-border text-small">
                  <div>
                    <span className="text-caption text-muted-foreground">Transportadora: </span>
                    <strong className="text-foreground">{selectedOrder.carrier}</strong>
                    <p className="font-mono font-extrabold text-foreground tracking-wider mt-0.5">
                      {selectedOrder.trackingCode}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(selectedOrder.trackingCode!)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-caption font-bold text-foreground hover:bg-muted"
                  >
                    <Copy className="size-3.5" /> Copiar Código
                  </button>
                </div>
              ) : (
                <p className="text-caption text-muted-foreground italic">
                  Nenhum código de rastreamento informado para este pedido ainda.
                </p>
              )}
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <h3 className="text-small font-bold text-foreground border-b border-border pb-2">
                Itens Comprados ({selectedOrder.items.length})
              </h3>

              <div className="divide-y divide-border rounded-2xl border border-border bg-background overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 hover:bg-surface transition-colors">
                    <img
                      src={item.productImage || ""}
                      alt={item.productName}
                      className="size-12 rounded-xl border border-border bg-surface object-contain p-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-small truncate">{item.productName}</p>
                      <p className="text-caption text-muted-foreground">
                        {item.quantity}x {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <span className="font-extrabold text-foreground text-small">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="rounded-2xl border border-border bg-background p-4 space-y-2 text-small">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal dos itens:</span>
                <span className="font-semibold text-foreground">{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Desconto aplicado:</span>
                  <span>-{formatCurrency(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Valor do frete:</span>
                <span className="font-semibold text-foreground">
                  {selectedOrder.shipping === 0 ? "Grátis" : formatCurrency(selectedOrder.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-h4 font-black text-foreground border-t border-border pt-2">
                <span>Total do Pedido:</span>
                <span className="text-brand">{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl border border-border px-5 py-2.5 text-small font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Code Edit Modal */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-surface p-6 sm:p-8 space-y-6 shadow-2xl border border-border animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span className="text-caption font-extrabold text-brand uppercase tracking-wider">
                  Logística & Despacho
                </span>
                <h3 className="text-h3 font-black text-foreground">Código de Rastreamento</h3>
                <p className="text-caption text-muted-foreground">
                  Pedido <strong className="text-foreground font-mono">#{trackingOrder.code}</strong>
                </p>
              </div>
              <button
                onClick={() => setTrackingOrder(null)}
                className="rounded-xl p-2 text-muted-foreground hover:text-foreground text-h4 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTracking} className="space-y-4">
              <div className="space-y-2">
                <label className="text-caption font-bold text-foreground">Empresa Transportadora</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-small text-foreground focus:border-ring focus:outline-none"
                >
                  <option value="SEDEX Express">SEDEX Express (Correios)</option>
                  <option value="PAC Correios">PAC (Correios)</option>
                  <option value="Jadlog">Jadlog Package</option>
                  <option value="Loggi">Loggi Express</option>
                  <option value="Azul Cargo">Azul Cargo Express</option>
                  <option value="Total Express">Total Express</option>
                  <option value="Outra Transportadora">Outra Transportadora</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-caption font-bold text-foreground">Código de Rastreio</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: BR948201948SP ou 123456789"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-small font-mono text-foreground uppercase placeholder:text-muted-foreground focus:border-ring focus:outline-none"
                />
                <p className="text-[11px] text-muted-foreground">
                  Ao salvar, o status do pedido será automaticamente alterado para <strong>"Enviado"</strong>.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setTrackingOrder(null)}
                  className="rounded-xl border border-border px-4 py-2.5 text-small font-bold text-foreground hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingTracking}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-small font-extrabold text-accent-foreground shadow-sm hover:brightness-105"
                >
                  {isSavingTracking ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="size-4" />
                      Salvar Rastreio
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
