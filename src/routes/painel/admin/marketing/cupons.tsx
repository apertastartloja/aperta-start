import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Ticket,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Percent,
  DollarSign,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  Power,
  Loader2,
  Copy,
  AlertCircle,
} from "lucide-react";
import { AdminLayout } from "@/components/admin";
import { CouponService } from "@/services/coupon.service";
import type { Coupon, CouponDiscountType } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel/admin/marketing/cupons")({
  head: () => ({
    meta: [{ title: "Cupons de Desconto — Painel Aperta Start" }],
  }),
  component: CuponsPage,
});

function CuponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    code: "",
    type: "percentage" as CouponDiscountType,
    value: 10,
    minOrderValue: "",
    maxDiscount: "",
    expiresAt: "",
    usageLimit: "",
    active: true,
  });

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const data = await CouponService.listAll();
      setCoupons(data);
    } catch (err) {
      console.error("Erro ao carregar cupons:", err);
      toast.error("Erro ao carregar lista de cupons.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      if (filterActive === "active" && !c.active) return false;
      if (filterActive === "inactive" && c.active) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return c.code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [coupons, filterActive, searchQuery]);

  const stats = useMemo(() => {
    const totalCount = coupons.length;
    const activeCount = coupons.filter((c) => c.active).length;
    const totalUsages = coupons.reduce((sum, c) => sum + c.usageCount, 0);
    return { totalCount, activeCount, totalUsages };
  }, [coupons]);

  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setForm({
      code: "",
      type: "percentage",
      value: 10,
      minOrderValue: "",
      maxDiscount: "",
      expiresAt: "",
      usageLimit: "",
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrderValue: coupon.minOrderValue ? String(coupon.minOrderValue) : "",
      maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : "",
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split("T")[0]! : "",
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
      active: coupon.active,
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id: string) => {
    try {
      const updated = await CouponService.toggleActive(id);
      toast.success(
        `Cupom ${updated.code} foi ${updated.active ? "ativado" : "desativado"} com sucesso!`
      );
      loadCoupons();
    } catch (err) {
      console.error("Erro ao alterar status:", err);
      toast.error("Não foi possível alterar o status do cupom.");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await CouponService.delete(id);
      toast.success("Cupom excluído com sucesso.");
      loadCoupons();
    } catch (err) {
      console.error("Erro ao excluir cupom:", err);
      toast.error("Erro ao excluir cupom.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) {
      toast.error("Informe o código do cupom.");
      return;
    }
    if (form.value <= 0) {
      toast.error("O valor do desconto deve ser maior que zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : undefined,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        expiresAt: form.expiresAt ? `${form.expiresAt}T23:59:59.000Z` : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        active: form.active,
      };

      if (editingCoupon) {
        await CouponService.update(editingCoupon.id, payload);
        toast.success(`Cupom ${payload.code.toUpperCase()} atualizado!`);
      } else {
        await CouponService.create(payload);
        toast.success(`Cupom ${payload.code.toUpperCase()} criado com sucesso!`);
      }

      setIsModalOpen(false);
      loadCoupons();
    } catch (err) {
      console.error("Erro ao salvar cupom:", err);
      toast.error("Ocorreu um erro ao salvar o cupom.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Código "${code}" copiado!`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-caption font-extrabold text-brand uppercase tracking-wider">
              <Ticket className="size-4" /> Marketing & Promoções
            </div>
            <h1 className="text-h2 font-black text-foreground tracking-tight">Cupons de Desconto</h1>
            <p className="text-small text-muted-foreground">
              Crie regras de descontos em porcentagem ou valor fixo para alavancar suas vendas.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-small font-extrabold text-accent-foreground shadow-medium hover:brightness-105 transition-all cursor-pointer"
          >
            <Plus className="size-4.5 stroke-[3]" /> Criar Novo Cupom
          </button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Total de Cupons</span>
              <p className="text-h2 font-black text-foreground">{stats.totalCount}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Ticket className="size-6" />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Cupons Ativos</span>
              <p className="text-h2 font-black text-emerald-500">{stats.activeCount}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-6" />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Usos Acumulados</span>
              <p className="text-h2 font-black text-indigo-500">{stats.totalUsages}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <Percent className="size-6" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="rounded-3xl border border-border bg-surface p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por código de cupom (ex: START10)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-input bg-background pl-11 pr-4 py-2.5 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: "all", label: "Todos" },
              { id: "active", label: "Ativos" },
              { id: "inactive", label: "Inativos" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterActive(f.id as any)}
                className={cn(
                  "rounded-xl border px-3.5 py-2 text-caption font-bold transition-all cursor-pointer",
                  filterActive === f.id
                    ? "border-brand bg-brand text-brand-foreground shadow-xs"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-3xl border border-border bg-surface shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <Loader2 className="size-8 animate-spin text-brand mx-auto" />
              <p className="text-small text-muted-foreground">Carregando cupons...</p>
            </div>
          ) : filteredCoupons.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-small border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-caption font-extrabold uppercase text-muted-foreground tracking-wider">
                    <th className="px-6 py-4">Código / Status</th>
                    <th className="px-6 py-4">Desconto</th>
                    <th className="px-6 py-4">Regra Mínima</th>
                    <th className="px-6 py-4">Usos Realizados</th>
                    <th className="px-6 py-4">Validade</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-muted/20 transition-colors">
                      {/* Code & Status */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => copyCode(coupon.code)}
                            title="Clique para copiar o código"
                            className="font-black text-foreground font-mono text-small flex items-center gap-1.5 hover:text-brand transition-colors cursor-pointer"
                          >
                            <span className="rounded-lg bg-muted px-2.5 py-1 border border-border">
                              {coupon.code}
                            </span>
                            <Copy className="size-3.5 text-muted-foreground" />
                          </button>

                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-caption font-extrabold border",
                              coupon.active
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "border-muted bg-muted text-muted-foreground"
                            )}
                          >
                            {coupon.active ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                      </td>

                      {/* Discount Value */}
                      <td className="px-6 py-4 font-black text-foreground text-small">
                        {coupon.type === "percentage" ? (
                          <span className="text-brand flex items-center gap-1">
                            <Percent className="size-4" /> {coupon.value}% OFF
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(coupon.value)} OFF
                          </span>
                        )}
                      </td>

                      {/* Min Order Value */}
                      <td className="px-6 py-4 text-muted-foreground">
                        {coupon.minOrderValue ? (
                          <span>Min: <strong className="text-foreground">{formatCurrency(coupon.minOrderValue)}</strong></span>
                        ) : (
                          <span className="italic text-caption">Sem mínimo</span>
                        )}
                      </td>

                      {/* Usages */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-foreground">
                          {coupon.usageCount}
                        </span>
                        {coupon.usageLimit ? (
                          <span className="text-muted-foreground"> / {coupon.usageLimit} limitados</span>
                        ) : (
                          <span className="text-muted-foreground"> usos</span>
                        )}
                      </td>

                      {/* Expiry */}
                      <td className="px-6 py-4 text-muted-foreground text-caption">
                        {coupon.expiresAt ? (
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3.5" /> {formatDate(coupon.expiresAt)}
                          </span>
                        ) : (
                          <span className="italic">Indeterminado</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleActive(coupon.id)}
                            title={coupon.active ? "Desativar cupom" : "Ativar cupom"}
                            className={cn(
                              "p-2 rounded-xl border transition-colors cursor-pointer",
                              coupon.active
                                ? "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
                                : "border-border text-muted-foreground hover:bg-muted"
                            )}
                          >
                            <Power className="size-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(coupon)}
                            title="Editar cupom"
                            className="p-2 rounded-xl border border-border bg-background text-foreground hover:bg-muted transition-colors cursor-pointer"
                          >
                            <Edit2 className="size-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(coupon.id)}
                            disabled={deletingId === coupon.id}
                            title="Excluir cupom"
                            className="p-2 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                          >
                            {deletingId === coupon.id ? (
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
          ) : (
            <div className="p-12 text-center space-y-4">
              <Ticket className="size-10 text-muted-foreground mx-auto" />
              <p className="text-small text-muted-foreground">Nenhum cupom encontrado com os filtros aplicados.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-surface p-6 sm:p-8 space-y-6 shadow-2xl border border-border animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span className="text-caption font-extrabold text-brand uppercase tracking-wider">
                  {editingCoupon ? "Editar Cupom" : "Novo Cupom de Desconto"}
                </span>
                <h2 className="text-h3 font-black text-foreground">
                  {editingCoupon ? editingCoupon.code : "Criar Cupom"}
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
              {/* Code */}
              <div className="space-y-1.5">
                <label className="text-caption font-bold text-foreground">Código do Cupom</label>
                <input
                  type="text"
                  required
                  placeholder="EX: START10 ou FRETEGRATIS"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small font-mono font-bold text-foreground uppercase placeholder:text-muted-foreground focus:border-ring focus:outline-none"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-caption font-bold text-foreground">Tipo de Desconto</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as CouponDiscountType })}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
                  >
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-caption font-bold text-foreground">
                    Valor ({form.type === "percentage" ? "%" : "R$"})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small font-bold text-foreground focus:border-ring focus:outline-none"
                  />
                </div>
              </div>

              {/* Min Order & Usage Limit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-caption font-bold text-foreground">Valor Mínimo (R$)</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="Opcional (ex: 50)"
                    value={form.minOrderValue}
                    onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-caption font-bold text-foreground">Limite de Usos</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="Opcional (ex: 100)"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div className="space-y-1.5">
                <label className="text-caption font-bold text-foreground">Data de Expiração</label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
                />
                <p className="text-[11px] text-muted-foreground">Deixe em branco para o cupom não expirar.</p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  id="coupon-active-check"
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="size-4 rounded accent-brand cursor-pointer"
                />
                <label htmlFor="coupon-active-check" className="text-small font-bold text-foreground cursor-pointer">
                  Cupom Ativo e disponível para uso imediato
                </label>
              </div>

              {/* Submit Buttons */}
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
                      <CheckCircle2 className="size-4" /> {editingCoupon ? "Salvar Alterações" : "Criar Cupom"}
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
