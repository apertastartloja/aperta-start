import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Copy,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Package,
  Layers,
  Sparkles,
  ArrowUpDown,
  MoreVertical,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin";
import { ProductService } from "@/services/product.service";
import { CategoryService } from "@/services/category.service";
import { SupplierService } from "@/services/supplier.service";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel/admin/produtos/lista")({
  head: () => ({
    meta: [{ title: "Lista de Produtos — Painel Aperta Start" }],
  }),
  component: ProdutosListaPage,
});

function ProdutosListaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "archived">("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Batch selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Fetch all products (including inactive for admin)
  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ["admin-products", searchTerm, statusFilter, stockFilter, categoryFilter],
    queryFn: () =>
      ProductService.list({
        search: searchTerm,
        perPage: 100,
        includeInactive: true,
      }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => CategoryService.list(),
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => SupplierService.listAll(),
  });

  const products = paginatedData?.data || [];

  // Filter products by status, stock level and category
  const filteredProducts = products.filter((p) => {
    // Status filter
    if (statusFilter !== "all") {
      const prodStatus = p.status || "active";
      if (prodStatus !== statusFilter) return false;
    }

    // Stock filter
    if (stockFilter === "in_stock" && p.stock <= 5) return false;
    if (stockFilter === "low_stock" && (p.stock <= 0 || p.stock > 5)) return false;
    if (stockFilter === "out_of_stock" && p.stock > 0) return false;

    // Category filter
    if (categoryFilter !== "all" && p.categoryId !== categoryFilter) return false;

    return true;
  });

  // Toggle selection
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Mutations for single delete, duplicate, bulk delete, bulk status update
  const deleteMutation = useMutation({
    mutationFn: (id: string) => ProductService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto excluído com sucesso!");
      setProductToDelete(null);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => ProductService.deleteMany(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`${selectedIds.length} produtos excluídos com sucesso!`);
      setSelectedIds([]);
      setIsBulkDeleteModalOpen(false);
    },
  });

  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: "active" | "draft" | "archived" }) =>
      ProductService.updateStatusMany(ids, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`Status de ${variables.ids.length} produtos atualizado para ${variables.status}!`);
      setSelectedIds([]);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (prod: Product) => {
      const copyInput = {
        name: `${prod.name} (Cópia)`,
        slug: `${prod.slug}-copia-${Date.now().toString().slice(-4)}`,
        sku: `${prod.sku}-COPY`,
        description: prod.description,
        shortDescription: prod.shortDescription,
        price: prod.price,
        compareAtPrice: prod.compareAtPrice,
        categoryId: prod.categoryId,
        collectionIds: prod.collectionIds,
        images: prod.images,
        badges: prod.badges,
        stock: prod.stock,
        variants: prod.variants,
        tags: prod.tags,
        status: "draft" as const,
        rating: prod.rating ?? 5.0,
        reviewsCount: 0,
      };
      return await ProductService.create(copyInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Produto duplicado com sucesso em modo Rascunho!");
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Title & Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-caption font-black text-brand uppercase tracking-wider">
              <Package className="size-4 text-accent" /> Gestão do Catálogo
            </div>
            <h1 className="text-h2 font-black text-foreground">Produtos</h1>
            <p className="text-small text-muted-foreground">
              {filteredProducts.length} produtos cadastrados na plataforma Aperta Start.
            </p>
          </div>

          <Link
            to="/painel/admin/produtos/novo"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-small font-black text-accent-foreground shadow-medium hover:brightness-105 transition-all self-start sm:self-auto"
          >
            <Plus className="size-5" />
            Cadastrar Novo Produto
          </Link>
        </div>

        {/* Filters & Tabs Bar */}
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-medium space-y-4">
          {/* Top Status Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
            <button
              onClick={() => setStatusFilter("all")}
              className={cn(
                "rounded-xl px-4 py-2 text-small font-bold transition-all",
                statusFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              Todos os Produtos
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={cn(
                "rounded-xl px-4 py-2 text-small font-bold transition-all",
                statusFilter === "active"
                  ? "bg-emerald-500 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              🟢 Ativos ({products.filter((p) => (p.status || "active") === "active").length})
            </button>
            <button
              onClick={() => setStatusFilter("draft")}
              className={cn(
                "rounded-xl px-4 py-2 text-small font-bold transition-all",
                statusFilter === "draft"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              🟡 Rascunhos ({products.filter((p) => p.status === "draft").length})
            </button>
            <button
              onClick={() => setStatusFilter("archived")}
              className={cn(
                "rounded-xl px-4 py-2 text-small font-bold transition-all",
                statusFilter === "archived"
                  ? "bg-slate-600 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              🔴 Arquivados ({products.filter((p) => p.status === "archived").length})
            </button>
          </div>

          {/* Search Bar & Dropdown Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nome, SKU ou tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
              />
            </div>

            {/* Stock Level Dropdown */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-small font-bold text-foreground focus:outline-none"
            >
              <option value="all">📦 Todo Nível de Estoque</option>
              <option value="in_stock">✅ Em Estoque (&gt; 5 un)</option>
              <option value="low_stock">⚠️ Estoque Baixo (≤ 5 un)</option>
              <option value="out_of_stock">❌ Esgotado (0 un)</option>
            </select>

            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-small font-bold text-foreground focus:outline-none"
            >
              <option value="all">📂 Todas as Categorias</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Batch Actions Bar (if any selected) */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between rounded-2xl border border-accent/40 bg-accent/10 p-4 animate-in fade-in slide-in-from-top-2 duration-150">
            <span className="text-small font-black text-accent-foreground">
              {selectedIds.length} produtos selecionados
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => bulkStatusMutation.mutate({ ids: selectedIds, status: "active" })}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-caption font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20"
              >
                Mudar p/ Ativo
              </button>
              <button
                type="button"
                onClick={() => bulkStatusMutation.mutate({ ids: selectedIds, status: "draft" })}
                className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-caption font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500/20"
              >
                Mudar p/ Rascunho
              </button>
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-1.5 text-caption font-bold text-danger hover:bg-danger/20"
              >
                Excluir Selecionados
              </button>
            </div>
          </div>
        )}

        {/* Products Table Card */}
        <div className="rounded-3xl border border-border bg-surface shadow-medium overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 space-x-3 text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-accent" />
              <span className="font-bold">Carregando catálogo do Supabase...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
                <Package className="size-8" />
              </div>
              <h3 className="text-h3 font-black text-foreground">Nenhum produto encontrado</h3>
              <p className="text-small text-muted-foreground max-w-sm mx-auto">
                Tente ajustar seus termos de busca ou filtros para localizar os itens desejados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-small">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-caption text-muted-foreground">
                    <th className="py-3.5 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded accent-accent size-4"
                      />
                    </th>
                    <th className="py-3.5 px-4 font-extrabold">Produto</th>
                    <th className="py-3.5 px-4 font-extrabold">Categoria</th>
                    <th className="py-3.5 px-4 font-extrabold">Preço</th>
                    <th className="py-3.5 px-4 font-extrabold">Estoque</th>
                    <th className="py-3.5 px-4 font-extrabold">Visibilidade</th>
                    <th className="py-3.5 px-4 font-extrabold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedIds.includes(product.id);
                    const categoryName = categories.find((c) => c.id === product.categoryId)?.name || "Geral";
                    const prodStatus = product.status || "active";

                    return (
                      <tr
                        key={product.id}
                        className={cn(
                          "hover:bg-muted/40 transition-colors",
                          isSelected && "bg-accent/10"
                        )}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectId(product.id)}
                            className="rounded accent-accent size-4"
                          />
                        </td>

                        {/* Product info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={product.images[0]?.url || "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&auto=format&fit=crop&q=80"}
                              alt={product.name}
                              className="size-12 rounded-xl object-contain bg-background border border-border p-1 shrink-0"
                            />
                            <div className="min-w-0">
                              <Link
                                to={`/painel/admin/produtos/${product.id}/edit` as any}
                                className="font-extrabold text-foreground hover:text-brand truncate block"
                              >
                                {product.name}
                              </Link>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                                <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-[10px]">
                                  SKU: {product.sku}
                                </span>
                                {product.variants && product.variants.length > 0 && (
                                  <span className="font-bold text-accent">
                                    {product.variants.length} variações
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category & Supplier */}
                        <td className="py-3.5 px-4 text-small text-muted-foreground font-medium">
                          <div>{categoryName}</div>
                          {(() => {
                            const supplier = suppliers.find((s) => s.id === product.supplierId);
                            return supplier ? (
                              <div className="text-[11px] text-brand font-bold flex items-center gap-1 mt-0.5">
                                🏢 {supplier.name}
                              </div>
                            ) : null;
                          })()}
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 text-small font-bold text-foreground">
                          R$ {product.price.toFixed(2)}
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="block text-[11px] text-muted-foreground line-through font-normal">
                              R$ {product.compareAtPrice.toFixed(2)}
                            </span>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="py-3.5 px-4 text-small">
                          <span
                            className={cn(
                              "font-extrabold px-2 py-0.5 rounded-md text-[11px]",
                              product.stock > 5
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : product.stock > 0
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-destructive/10 text-destructive"
                            )}
                          >
                            {product.stock} un
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-small">
                          {prodStatus === "active" && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Ativo
                            </span>
                          )}
                          {prodStatus === "draft" && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
                              <span className="size-1.5 rounded-full bg-amber-500" />
                              Rascunho
                            </span>
                          )}
                          {prodStatus === "archived" && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                              <span className="size-1.5 rounded-full bg-muted-foreground" />
                              Arquivado
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to="/produto/$slug"
                              params={{ slug: product.slug }}
                              target="_blank"
                              title="Ver na loja pública"
                              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <Eye className="size-4" />
                            </Link>

                            <Link
                              to={`/painel/admin/produtos/${product.id}/edit` as any}
                              title="Editar produto"
                              className="rounded-lg p-2 text-muted-foreground hover:bg-brand/10 hover:text-brand"
                            >
                              <Edit className="size-4" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => duplicateMutation.mutate(product)}
                              title="Duplicar produto"
                              className="rounded-lg p-2 text-muted-foreground hover:bg-accent/20 hover:text-accent-foreground"
                            >
                              <Copy className="size-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setProductToDelete(product)}
                              title="Excluir produto"
                              className="rounded-lg p-2 text-muted-foreground hover:bg-danger/20 hover:text-danger"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Single Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl space-y-5">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-danger/10 text-danger">
              <ShieldAlert className="size-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-h3 font-black text-foreground">Excluir Produto?</h3>
              <p className="text-small text-muted-foreground">
                Tem certeza que deseja remover <strong>"{productToDelete.name}"</strong>? Esta ação excluirá o item no Supabase.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="w-full rounded-xl border border-border bg-background py-2.5 text-small font-bold text-foreground hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(productToDelete.id)}
                disabled={deleteMutation.isPending}
                className="w-full rounded-xl bg-danger py-2.5 text-small font-black text-white hover:brightness-110"
              >
                {deleteMutation.isPending ? "Excluindo..." : "Sim, Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl space-y-5">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-danger/10 text-danger">
              <ShieldAlert className="size-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-h3 font-black text-foreground">Excluir {selectedIds.length} Produtos?</h3>
              <p className="text-small text-muted-foreground">
                Esta ação removerá permanentemente os itens selecionados do banco de dados no Supabase.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="w-full rounded-xl border border-border bg-background py-2.5 text-small font-bold text-foreground hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => bulkDeleteMutation.mutate(selectedIds)}
                disabled={bulkDeleteMutation.isPending}
                className="w-full rounded-xl bg-danger py-2.5 text-small font-black text-white hover:brightness-110"
              >
                {bulkDeleteMutation.isPending ? "Excluindo..." : "Confirmar Exclusão"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
