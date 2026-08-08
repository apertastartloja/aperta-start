import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Truck,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Power,
  Copy,
  ExternalLink,
  MapPin,
  Loader2,
  ShieldCheck,
  Zap,
  Globe,
} from "lucide-react";
import { AdminLayout } from "@/components/admin";
import { ShippingService, type ShippingRule, type CarrierConfig } from "@/services/shipping.service";
import { OrderService } from "@/services/order.service";
import type { Order } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel/admin/entregas")({
  head: () => ({
    meta: [{ title: "Entregas — Painel Aperta Start" }],
  }),
  component: EntregasPage,
});

function EntregasPage() {
  const [rules, setRules] = useState<ShippingRule[]>([]);
  const [carriers, setCarriers] = useState<CarrierConfig[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for Rule Editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ShippingRule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    region: "",
    statesStr: "",
    fixedPrice: 15,
    freeShippingMinAmount: "199",
    minDays: 2,
    maxDays: 4,
    active: true,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rulesData, carriersData, ordersRes] = await Promise.all([
        ShippingService.listRules(),
        ShippingService.listCarriers(),
        OrderService.listAll({ perPage: 200 }),
      ]);
      setRules(rulesData);
      setCarriers(carriersData);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error("Erro ao carregar dados de logística:", err);
      toast.error("Erro ao carregar configurações de frete.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Shipped / Delivered Dispatches
  const dispatches = useMemo(() => {
    return orders.filter(
      (o) => o.status === "shipped" || o.status === "delivered" || o.status === "processing"
    );
  }, [orders]);

  // Overall Statistics
  const stats = useMemo(() => {
    const inTransitCount = orders.filter((o) => o.status === "shipped").length;
    const totalDeliveredCount = orders.filter((o) => o.status === "delivered").length;
    const sudesteRule = rules.find((r) => r.region === "Sudeste");
    const freeShippingMin = sudesteRule?.freeShippingMinAmount || 199;

    return { inTransitCount, totalDeliveredCount, freeShippingMin };
  }, [orders, rules]);

  // Carrier toggle
  const handleToggleCarrier = async (id: string) => {
    try {
      const updated = await ShippingService.toggleCarrier(id);
      toast.success(
        `Transportadora "${updated.name}" foi ${updated.active ? "ativada" : "desativada"}!`
      );
      loadData();
    } catch (err) {
      console.error("Erro ao alternar transportadora:", err);
      toast.error("Erro ao alterar status da transportadora.");
    }
  };

  // Open Create / Edit Modal
  const handleOpenCreateModal = () => {
    setEditingRule(null);
    setForm({
      region: "",
      statesStr: "",
      fixedPrice: 19.9,
      freeShippingMinAmount: "249",
      minDays: 2,
      maxDays: 5,
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rule: ShippingRule) => {
    setEditingRule(rule);
    setForm({
      region: rule.region,
      statesStr: rule.states.join(", "),
      fixedPrice: rule.fixedPrice,
      freeShippingMinAmount: rule.freeShippingMinAmount ? String(rule.freeShippingMinAmount) : "",
      minDays: rule.minDays,
      maxDays: rule.maxDays,
      active: rule.active,
    });
    setIsModalOpen(true);
  };

  const handleDeleteRule = async (id: string) => {
    setDeletingId(id);
    try {
      await ShippingService.deleteRule(id);
      toast.success("Regra de frete excluída.");
      loadData();
    } catch (err) {
      console.error("Erro ao excluir regra:", err);
      toast.error("Erro ao excluir regra de frete.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.region.trim()) {
      toast.error("Informe a região.");
      return;
    }

    setIsSubmitting(true);
    try {
      const states = form.statesStr
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      const payload = {
        region: form.region.trim(),
        states,
        fixedPrice: Number(form.fixedPrice),
        freeShippingMinAmount: form.freeShippingMinAmount
          ? Number(form.freeShippingMinAmount)
          : null,
        minDays: Number(form.minDays),
        maxDays: Number(form.maxDays),
        active: form.active,
      };

      if (editingRule) {
        await ShippingService.updateRule(editingRule.id, payload);
        toast.success(`Regra para a Região ${payload.region} atualizada!`);
      } else {
        await ShippingService.createRule(payload);
        toast.success(`Nova regra de frete para ${payload.region} criada!`);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error("Erro ao salvar regra de frete:", err);
      toast.error("Erro ao salvar regra de frete.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Código de rastreio "${code}" copiado!`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-caption font-extrabold text-brand uppercase tracking-wider">
              <Truck className="size-4" /> Logística & Fretes
            </div>
            <h1 className="text-h2 font-black text-foreground tracking-tight">
              Gestão de Entregas & Frete
            </h1>
            <p className="text-small text-muted-foreground">
              Configure regras de frete por região, alterne transportadoras ativas e acompanhe envios.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-small font-extrabold text-accent-foreground shadow-medium hover:brightness-105 transition-all cursor-pointer"
          >
            <Plus className="size-4.5 stroke-[3]" /> Nova Regra de Região
          </button>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">
                Envios em Trânsito
              </span>
              <p className="text-h2 font-black text-indigo-500">{stats.inTransitCount}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <Truck className="size-6" />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">
                Entregas Concluídas
              </span>
              <p className="text-h2 font-black text-emerald-500">{stats.totalDeliveredCount}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-6" />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">
                Frete Grátis Sudeste
              </span>
              <p className="text-h3 font-black text-brand">
                {formatCurrency(stats.freeShippingMin)}
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Zap className="size-6" />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">
                Prazo Médio Brasil
              </span>
              <p className="text-h3 font-black text-foreground">2 a 5 dias</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Clock className="size-6" />
            </div>
          </div>
        </div>

        {/* Section 1: Active Carriers */}
        <div className="space-y-3">
          <h2 className="text-small font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="size-4 text-brand" /> Transportadoras & Opções de Envio
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {carriers.map((carrier) => (
              <div
                key={carrier.id}
                className={cn(
                  "rounded-3xl border p-5 shadow-xs transition-all flex flex-col justify-between space-y-3",
                  carrier.active ? "border-border bg-surface" : "border-border bg-muted/20 opacity-70"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="font-bold text-foreground text-small flex items-center gap-2">
                      <Truck className="size-4 text-brand" /> {carrier.name}
                    </span>
                    <p className="text-caption text-muted-foreground leading-relaxed">
                      {carrier.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span
                    className={cn(
                      "text-caption font-extrabold px-2.5 py-0.5 rounded-full border",
                      carrier.active
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-muted bg-muted text-muted-foreground"
                    )}
                  >
                    {carrier.active ? "Ativo no Checkout" : "Inativo"}
                  </span>

                  <button
                    onClick={() => handleToggleCarrier(carrier.id)}
                    className={cn(
                      "p-2 rounded-xl border transition-colors cursor-pointer",
                      carrier.active
                        ? "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                    title={carrier.active ? "Desativar transportadora" : "Ativar transportadora"}
                  >
                    <Power className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Regional Shipping Rates Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-small font-bold text-foreground flex items-center gap-2">
              <Globe className="size-4 text-brand" /> Tabela de Fretes por Região do Brasil
            </h2>
          </div>

          <div className="rounded-3xl border border-border bg-surface shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-small border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-caption font-extrabold uppercase text-muted-foreground tracking-wider">
                    <th className="px-6 py-4">Região / Estados</th>
                    <th className="px-6 py-4">Valor Base Frete</th>
                    <th className="px-6 py-4">Frete Grátis Acima De</th>
                    <th className="px-6 py-4">Prazo Estimado</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-muted/20 transition-colors">
                      {/* Region & States */}
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-foreground">{rule.region}</span>
                          <div className="flex flex-wrap gap-1">
                            {rule.states.map((st) => (
                              <span
                                key={st}
                                className="rounded bg-muted border border-border px-1.5 py-0.2 text-[11px] font-mono font-bold text-muted-foreground"
                              >
                                {st}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Base Price */}
                      <td className="px-6 py-4 font-black text-foreground">
                        {formatCurrency(rule.fixedPrice)}
                      </td>

                      {/* Free Shipping threshold */}
                      <td className="px-6 py-4">
                        {rule.freeShippingMinAmount ? (
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            A partir de {formatCurrency(rule.freeShippingMinAmount)}
                          </span>
                        ) : (
                          <span className="text-caption text-muted-foreground italic">Sem frete grátis</span>
                        )}
                      </td>

                      {/* Days */}
                      <td className="px-6 py-4 text-muted-foreground text-caption font-medium">
                        {rule.minDays} a {rule.maxDays} dias úteis
                      </td>

                      {/* Active Status */}
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-caption font-extrabold border",
                            rule.active
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "border-muted bg-muted text-muted-foreground"
                          )}
                        >
                          {rule.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(rule)}
                            className="p-2 rounded-xl border border-border bg-background text-foreground hover:bg-muted transition-colors cursor-pointer"
                            title="Editar regra de frete"
                          >
                            <Edit2 className="size-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            disabled={deletingId === rule.id}
                            className="p-2 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                            title="Excluir regra"
                          >
                            {deletingId === rule.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Trash2 className="size-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 3: Dispatches Tracking Table */}
        <div className="space-y-3">
          <h2 className="text-small font-bold text-foreground flex items-center gap-2">
            <Package className="size-4 text-brand" /> Acompanhamento de Despachos & Rastreamento
          </h2>

          <div className="rounded-3xl border border-border bg-surface shadow-xs overflow-hidden">
            {dispatches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-small border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-caption font-extrabold uppercase text-muted-foreground tracking-wider">
                      <th className="px-6 py-4">Pedido / Data</th>
                      <th className="px-6 py-4">Cliente / Destino</th>
                      <th className="px-6 py-4">Transportadora</th>
                      <th className="px-6 py-4">Código de Rastreio</th>
                      <th className="px-6 py-4 text-right">Status do Envio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {dispatches.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-mono font-extrabold text-foreground">
                          #{order.code}
                          <p className="text-caption font-normal text-muted-foreground font-sans">
                            {formatDate(order.createdAt)}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-bold text-foreground">{order.customerName || "Cliente"}</p>
                          <p className="text-caption text-muted-foreground flex items-center gap-1">
                            <MapPin className="size-3 text-brand" />
                            {order.shippingAddress?.city || "Cidade"} / {order.shippingAddress?.state || "UF"}
                          </p>
                        </td>

                        <td className="px-6 py-4 font-semibold text-foreground">
                          {order.carrier || "SEDEX Express"}
                        </td>

                        <td className="px-6 py-4 font-mono">
                          {order.trackingCode ? (
                            <button
                              onClick={() => copyCode(order.trackingCode!)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-caption font-bold text-foreground hover:text-brand transition-colors cursor-pointer"
                            >
                              {order.trackingCode} <Copy className="size-3 text-muted-foreground" />
                            </button>
                          ) : (
                            <span className="text-caption text-muted-foreground italic">Aguardando código</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-caption font-extrabold border",
                              order.status === "delivered"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : order.status === "shipped"
                                ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            )}
                          >
                            {order.status === "delivered"
                              ? "Entregue"
                              : order.status === "shipped"
                              ? "Em Trânsito"
                              : "Aguardando Postagem"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground text-small">
                Nenhum envio recente para acompanhamento.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rule Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-surface p-6 sm:p-8 space-y-6 shadow-2xl border border-border animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span className="text-caption font-extrabold text-brand uppercase tracking-wider">
                  {editingRule ? "Editar Regra de Frete" : "Nova Regra por Região"}
                </span>
                <h3 className="text-h3 font-black text-foreground">
                  {editingRule ? editingRule.region : "Regra de Frete"}
                </h3>
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
                <label className="text-caption font-bold text-foreground">Nome da Região</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sudeste, Sul, Capital SP"
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-caption font-bold text-foreground">Estados Abrangidos (UFs separadas por vírgula)</label>
                <input
                  type="text"
                  placeholder="Ex: SP, RJ, MG, ES"
                  value={form.statesStr}
                  onChange={(e) => setForm({ ...form, statesStr: e.target.value })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small font-mono uppercase text-foreground focus:border-ring focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-caption font-bold text-foreground">Valor Base do Frete (R$)</label>
                  <input
                    type="number"
                    step="0.10"
                    required
                    value={form.fixedPrice}
                    onChange={(e) => setForm({ ...form, fixedPrice: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small font-bold text-foreground focus:border-ring focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-caption font-bold text-foreground">Frete Grátis A Partir De (R$)</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="Ex: 199"
                    value={form.freeShippingMinAmount}
                    onChange={(e) => setForm({ ...form, freeShippingMinAmount: e.target.value })}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small font-bold text-foreground focus:border-ring focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-caption font-bold text-foreground">Prazo Mínimo (dias)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.minDays}
                    onChange={(e) => setForm({ ...form, minDays: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-caption font-bold text-foreground">Prazo Máximo (dias)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.maxDays}
                    onChange={(e) => setForm({ ...form, maxDays: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  id="rule-active-check"
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="size-4 rounded accent-brand cursor-pointer"
                />
                <label htmlFor="rule-active-check" className="text-small font-bold text-foreground cursor-pointer">
                  Regra ativa no cálculo da loja
                </label>
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
                      <CheckCircle2 className="size-4" /> Salvar Regra
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
