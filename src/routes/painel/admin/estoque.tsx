import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Boxes,
  Search,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  DollarSign,
  Plus,
  Minus,
  Save,
  Download,
  Loader2,
  RefreshCw,
  Layers,
  Edit3,
} from "lucide-react";
import { AdminLayout } from "@/components/admin";
import { ProductService } from "@/services/product.service";
import { mockCategories } from "@/mocks/categories.mock";
import type { Product, ProductVariant } from "@/types";
import { formatCurrency } from "@/utils/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel/admin/estoque")({
  head: () => ({
    meta: [{ title: "Estoque — Painel Aperta Start" }],
  }),
  component: EstoquePage,
});

function EstoquePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockLevelFilter, setStockLevelFilter] = useState<"all" | "critical" | "out" | "normal">("all");

  // Track modified stock values locally before saving
  const [stockChanges, setStockChanges] = useState<Record<string, number>>({});
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});

  // Variants modal state
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);
  const [variantDrafts, setVariantDrafts] = useState<ProductVariant[]>([]);
  const [isSavingVariants, setIsSavingVariants] = useState(false);

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const res = await ProductService.list({ perPage: 1000, includeInactive: true });
      setProducts(res.data);
      // Reset local changes on reload
      const initialChanges: Record<string, number> = {};
      res.data.forEach((p) => {
        initialChanges[p.id] = p.stock;
      });
      setStockChanges(initialChanges);
    } catch (err) {
      console.error("Erro ao carregar inventário:", err);
      toast.error("Erro ao carregar estoque.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const currentStock = stockChanges[p.id] !== undefined ? stockChanges[p.id]! : p.stock;

      if (stockLevelFilter === "critical" && !(currentStock > 0 && currentStock <= 5)) return false;
      if (stockLevelFilter === "out" && currentStock !== 0) return false;
      if (stockLevelFilter === "normal" && currentStock <= 5) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        const matchTag = p.tags.some((t) => t.toLowerCase().includes(q));
        return matchName || matchSku || matchTag;
      }
      return true;
    });
  }, [products, stockChanges, stockLevelFilter, searchQuery]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalItemsCount = products.reduce(
      (sum, p) => sum + (stockChanges[p.id] !== undefined ? stockChanges[p.id]! : p.stock),
      0
    );
    const criticalCount = products.filter((p) => {
      const s = stockChanges[p.id] !== undefined ? stockChanges[p.id]! : p.stock;
      return s > 0 && s <= 5;
    }).length;
    const outOfStockCount = products.filter((p) => {
      const s = stockChanges[p.id] !== undefined ? stockChanges[p.id]! : p.stock;
      return s === 0;
    }).length;
    const totalAssetValue = products.reduce((sum, p) => {
      const s = stockChanges[p.id] !== undefined ? stockChanges[p.id]! : p.stock;
      return sum + s * p.price;
    }, 0);

    return { totalItemsCount, criticalCount, outOfStockCount, totalAssetValue };
  }, [products, stockChanges]);

  // Category name resolver
  const getCategoryName = (catId: string) => {
    const cat = mockCategories.find((c) => c.id === catId);
    return cat ? cat.name : "Geral";
  };

  // Stock change handler
  const handleStockInputChange = (productId: string, val: number) => {
    const validValue = Math.max(0, val);
    setStockChanges((prev) => ({ ...prev, [productId]: validValue }));
  };

  const handleIncrement = (productId: string, delta: number) => {
    const current = stockChanges[productId] !== undefined ? stockChanges[productId]! : 0;
    handleStockInputChange(productId, current + delta);
  };

  // Save single product stock
  const handleSaveStock = async (product: Product) => {
    const newStock = stockChanges[product.id];
    if (newStock === undefined || newStock === product.stock) return;

    setSavingIds((prev) => ({ ...prev, [product.id]: true }));
    try {
      const updatedBadges = [...product.badges];
      if (newStock === 0 && !updatedBadges.includes("outOfStock")) {
        updatedBadges.push("outOfStock");
      } else if (newStock > 0 && updatedBadges.includes("outOfStock")) {
        const idx = updatedBadges.indexOf("outOfStock");
        updatedBadges.splice(idx, 1);
      }

      await ProductService.update(product.id, {
        stock: newStock,
        badges: updatedBadges,
      });

      toast.success(`Estoque de "${product.name}" atualizado para ${newStock} un.`);
      loadInventory();
    } catch (err) {
      console.error("Erro ao salvar estoque:", err);
      toast.error("Não foi possível salvar a alteração de estoque.");
    } finally {
      setSavingIds((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  // Batch restock (+10 units)
  const handleQuickRestock = (productId: string) => {
    handleIncrement(productId, 10);
    toast.info("10 unidades adicionadas ao rascunho! Clique em 'Salvar' para aplicar.");
  };

  // Variants modal open
  const handleOpenVariantsModal = (product: Product) => {
    setVariantProduct(product);
    setVariantDrafts(product.variants ? [...product.variants] : []);
  };

  const handleSaveVariants = async () => {
    if (!variantProduct) return;
    setIsSavingVariants(true);
    try {
      const totalVariantStock = variantDrafts.reduce((sum, v) => sum + v.stock, 0);
      await ProductService.update(variantProduct.id, {
        variants: variantDrafts,
        stock: totalVariantStock,
      });

      toast.success(`Estoque por variações de "${variantProduct.name}" atualizado!`);
      setVariantProduct(null);
      loadInventory();
    } catch (err) {
      console.error("Erro ao salvar variações:", err);
      toast.error("Erro ao atualizar variações de estoque.");
    } finally {
      setIsSavingVariants(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (products.length === 0) {
      toast.error("Não há produtos no inventário para exportar.");
      return;
    }

    const headers = "ID,SKU,Nome do Produto,Categoria,Preço (R$),Estoque Atual,Status\n";
    const rows = products
      .map((p) => {
        const s = stockChanges[p.id] !== undefined ? stockChanges[p.id]! : p.stock;
        const status = s === 0 ? "Esgotado" : s <= 5 ? "Alerta Crítico" : "Normal";
        return `"${p.id}","${p.sku}","${p.name}","${getCategoryName(p.categoryId)}","${p.price.toFixed(
          2
        )}","${s}","${status}"`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `relatorio_estoque_apertastart_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Relatório de estoque exportado para CSV!");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-caption font-extrabold text-brand uppercase tracking-wider">
              <Boxes className="size-4" /> Operações & Inventário
            </div>
            <h1 className="text-h2 font-black text-foreground tracking-tight">Controle de Estoque</h1>
            <p className="text-small text-muted-foreground">
              Monitore os saldos em tempo real, receba alertas de escassez e ajuste quantidades instantaneamente.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-2.5 text-small font-bold text-foreground shadow-xs hover:bg-muted transition-colors cursor-pointer"
            >
              <Download className="size-4 text-brand" /> Exportar CSV
            </button>
            <button
              onClick={loadInventory}
              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-2.5 text-small font-extrabold text-accent-foreground shadow-medium hover:brightness-105 transition-all cursor-pointer"
            >
              <RefreshCw className="size-4" /> Recarregar
            </button>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Pieces */}
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Total de Peças em Estoque</span>
              <p className="text-h2 font-black text-foreground">{stats.totalItemsCount}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Boxes className="size-6" />
            </div>
          </div>

          {/* Critical Alert */}
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Alerta Crítico (≤ 5 un.)</span>
              <p className="text-h2 font-black text-amber-500">{stats.criticalCount}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
              <AlertTriangle className="size-6" />
            </div>
          </div>

          {/* Out of Stock */}
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Produtos Esgotados</span>
              <p className="text-h2 font-black text-rose-500">{stats.outOfStockCount}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
              <XCircle className="size-6" />
            </div>
          </div>

          {/* Total Asset Value */}
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Valor do Patrimônio</span>
              <p className="text-h3 font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(stats.totalAssetValue)}
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <DollarSign className="size-6" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="rounded-3xl border border-border bg-surface p-4 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar produto por nome, SKU (ex: APS-1000) ou tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-input bg-background pl-11 pr-4 py-2.5 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none shadow-xs"
            />
          </div>

          {/* Level Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: "all", label: "Todos os Produtos" },
              { id: "critical", label: "⚠️ Alerta Crítico" },
              { id: "out", label: "🚨 Esgotados" },
              { id: "normal", label: "✅ Estoque Normal" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStockLevelFilter(tab.id as any)}
                className={cn(
                  "rounded-xl border px-3.5 py-2 text-caption font-bold whitespace-nowrap transition-all cursor-pointer",
                  stockLevelFilter === tab.id
                    ? "border-brand bg-brand text-brand-foreground shadow-xs"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Matrix Table */}
        <div className="rounded-3xl border border-border bg-surface shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <Loader2 className="size-8 animate-spin text-brand mx-auto" />
              <p className="text-small text-muted-foreground">Carregando dados do inventário...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-small border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-caption font-extrabold uppercase text-muted-foreground tracking-wider">
                    <th className="px-6 py-4">Produto</th>
                    <th className="px-6 py-4">Categoria</th>
                    <th className="px-6 py-4">Preço Unit.</th>
                    <th className="px-6 py-4">Saúde do Estoque</th>
                    <th className="px-6 py-4 text-center">Ajuste Rápido de Quantidade</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((product) => {
                    const currentStock =
                      stockChanges[product.id] !== undefined ? stockChanges[product.id]! : product.stock;
                    const isChanged = currentStock !== product.stock;
                    const isSaving = savingIds[product.id];

                    return (
                      <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                        {/* Product Image & SKU */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images[0]?.url || ""}
                              alt={product.name}
                              className="size-12 rounded-xl border border-border bg-background object-contain p-1 shrink-0"
                            />
                            <div className="space-y-0.5">
                              <p className="font-bold text-foreground line-clamp-1">{product.name}</p>
                              <span className="text-caption font-mono font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                                {product.sku}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4 text-caption font-medium text-muted-foreground">
                          {getCategoryName(product.categoryId)}
                        </td>

                        {/* Unit Price */}
                        <td className="px-6 py-4 font-black text-foreground text-small">
                          {formatCurrency(product.price)}
                        </td>

                        {/* Stock Health Badge & Bar */}
                        <td className="px-6 py-4">
                          <div className="space-y-1.5 min-w-[130px]">
                            <div className="flex items-center justify-between">
                              <span
                                className={cn(
                                  "rounded-full px-2.5 py-0.5 text-caption font-extrabold border",
                                  currentStock === 0
                                    ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                    : currentStock <= 5
                                    ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                )}
                              >
                                {currentStock === 0
                                  ? "🚨 Esgotado"
                                  : currentStock <= 5
                                  ? `⚠️ Alerta (${currentStock} un.)`
                                  : `✅ OK (${currentStock} un.)`}
                              </span>
                            </div>

                            {/* Progress bar indicator */}
                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className={cn(
                                  "h-full transition-all duration-300 rounded-full",
                                  currentStock === 0
                                    ? "w-0 bg-rose-500"
                                    : currentStock <= 5
                                    ? "w-1/3 bg-amber-500"
                                    : "w-full bg-emerald-500"
                                )}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Inline Stock Counter Adjustment */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleIncrement(product.id, -1)}
                              disabled={currentStock <= 0}
                              className="flex size-8 items-center justify-center rounded-xl border border-border bg-background text-foreground hover:bg-muted disabled:opacity-30 cursor-pointer"
                              title="Diminuir 1 unidade"
                            >
                              <Minus className="size-3.5 stroke-[3]" />
                            </button>

                            <input
                              type="number"
                              min="0"
                              value={currentStock}
                              onChange={(e) => handleStockInputChange(product.id, parseInt(e.target.value) || 0)}
                              className="w-16 rounded-xl border border-input bg-background py-1.5 text-center text-small font-black text-foreground focus:border-ring focus:outline-none"
                            />

                            <button
                              onClick={() => handleIncrement(product.id, 1)}
                              className="flex size-8 items-center justify-center rounded-xl border border-border bg-background text-foreground hover:bg-muted cursor-pointer"
                              title="Adicionar 1 unidade"
                            >
                              <Plus className="size-3.5 stroke-[3]" />
                            </button>

                            {/* Save button if changed */}
                            {isChanged && (
                              <button
                                onClick={() => handleSaveStock(product)}
                                disabled={isSaving}
                                className="inline-flex items-center gap-1 rounded-xl bg-accent px-3 py-1.5 text-caption font-extrabold text-accent-foreground shadow-xs hover:brightness-105 ml-2 cursor-pointer"
                              >
                                {isSaving ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <Save className="size-3.5" /> Salvar
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {product.variants && product.variants.length > 0 && (
                              <button
                                onClick={() => handleOpenVariantsModal(product)}
                                className="inline-flex items-center gap-1 rounded-xl border border-border bg-background px-3 py-1.5 text-caption font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                                title="Ajustar saldo de cada cor/variação"
                              >
                                <Layers className="size-3.5 text-brand" /> Variações
                              </button>
                            )}

                            <button
                              onClick={() => handleQuickRestock(product.id)}
                              className="inline-flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-caption font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                              title="Adicionar +10 unidades"
                            >
                              +10 un.
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
              <Boxes className="size-10 text-muted-foreground mx-auto" />
              <p className="text-small text-muted-foreground">Nenhum produto encontrado com os filtros selecionados.</p>
            </div>
          )}
        </div>
      </div>

      {/* Variants Stock Modal */}
      {variantProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-surface p-6 sm:p-8 space-y-6 shadow-2xl border border-border animate-in fade-in zoom-in duration-200">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span className="text-caption font-extrabold text-brand uppercase tracking-wider">
                  Estoque por Variação
                </span>
                <h3 className="text-h3 font-black text-foreground">{variantProduct.name}</h3>
              </div>
              <button
                onClick={() => setVariantProduct(null)}
                className="rounded-xl p-2 text-muted-foreground hover:text-foreground text-h4 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-caption text-muted-foreground">
                Defina o saldo de estoque para cada cor ou variação deste produto:
              </p>

              <div className="space-y-3 divide-y divide-border rounded-2xl border border-border bg-background p-4">
                {variantDrafts.map((v, idx) => (
                  <div key={v.id} className="flex items-center justify-between pt-3 first:pt-0">
                    <div>
                      <span className="font-bold text-foreground text-small">{v.name}: {v.value}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          const updated = [...variantDrafts];
                          updated[idx] = { ...updated[idx]!, stock: val };
                          setVariantDrafts(updated);
                        }}
                        className="w-20 rounded-xl border border-input bg-surface px-3 py-1.5 text-center text-small font-black text-foreground focus:border-ring focus:outline-none"
                      />
                      <span className="text-caption text-muted-foreground">un.</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setVariantProduct(null)}
                className="rounded-xl border border-border px-4 py-2.5 text-small font-bold text-foreground hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveVariants}
                disabled={isSavingVariants}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-small font-extrabold text-accent-foreground shadow-sm hover:brightness-105"
              >
                {isSavingVariants ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" /> Salvar Variações
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
