import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Package,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin";
import { CollectionDialog } from "@/components/admin/products/collection-dialog";
import { CollectionService } from "@/services/category.service";
import { ProductService } from "@/services/product.service";
import type { Collection } from "@/types";

export const Route = createFileRoute("/painel/admin/produtos/colecoes")({
  head: () => ({
    meta: [{ title: "Coleções — Painel Aperta Start" }],
  }),
  component: ColecoesPage,
});

function ColecoesPage() {
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [collectionToEdit, setCollectionToEdit] = useState<Collection | null>(null);
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null);

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: () => CollectionService.list(),
  });

  const { data: paginatedProducts } = useQuery({
    queryKey: ["admin-products-all"],
    queryFn: () => ProductService.list({ perPage: 1000, includeInactive: true }),
  });
  const allProducts = paginatedProducts?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => CollectionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("Coleção excluída com sucesso!");
      setCollectionToDelete(null);
    },
  });

  const handleOpenCreate = () => {
    setCollectionToEdit(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (col: Collection) => {
    setCollectionToEdit(col);
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Title & Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-caption font-black text-brand uppercase tracking-wider">
              <Layers className="size-4 text-accent" /> Agrupamentos Temáticos
            </div>
            <h1 className="text-h2 font-black text-foreground">Coleções de Produtos</h1>
            <p className="text-small text-muted-foreground">
              Crie e gerencie agrupamentos especiais de produtos (ex: Ofertas da Semana, Linha Pro).
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-small font-black text-accent-foreground shadow-medium hover:brightness-105 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="size-5" />
            Nova Coleção
          </button>
        </div>

        {/* Collections Grid / List Card */}
        <div className="rounded-3xl border border-border bg-surface shadow-medium overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 space-x-3 text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-accent" />
              <span className="font-bold">Carregando coleções...</span>
            </div>
          ) : collections.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <Layers className="size-12 mx-auto text-muted-foreground" />
              <h3 className="text-h3 font-black text-foreground">Nenhuma coleção cadastrada</h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-small">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-caption text-muted-foreground">
                    <th className="py-3.5 px-4 font-extrabold">Coleção</th>
                    <th className="py-3.5 px-4 font-extrabold">Slug (URL)</th>
                    <th className="py-3.5 px-4 font-extrabold">Produtos Inclusos</th>
                    <th className="py-3.5 px-4 font-extrabold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {collections.map((col) => (
                    <tr key={col.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {col.image ? (
                            <img
                              src={col.image}
                              alt={col.name}
                              className="size-10 rounded-xl object-cover bg-background border border-border shrink-0"
                            />
                          ) : (
                            <div className="size-10 rounded-xl bg-accent/20 text-amber-700 dark:text-amber-400 grid place-items-center font-black">
                              <Layers className="size-5" />
                            </div>
                          )}
                          <div>
                            <p className="font-extrabold text-foreground">{col.name}</p>
                            {col.description && (
                              <p className="text-[11px] text-muted-foreground truncate max-w-xs">
                                {col.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[12px] text-muted-foreground">{col.slug}</td>
                      <td className="py-3.5 px-4 font-bold text-foreground">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-accent/20 px-2.5 py-1 text-caption text-amber-800 dark:text-amber-300">
                          <Package className="size-3" /> {col.productIds?.length || 0} produtos
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(col)}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-brand/10 hover:text-brand"
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            onClick={() => setCollectionToDelete(col)}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-danger/20 hover:text-danger"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Collection Modal */}
      <CollectionDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        collectionToEdit={collectionToEdit}
        allProducts={allProducts}
      />

      {/* Delete Confirmation Modal */}
      {collectionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl space-y-5">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-danger/10 text-danger">
              <ShieldAlert className="size-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-h3 font-black text-foreground">Excluir Coleção?</h3>
              <p className="text-small text-muted-foreground">
                Tem certeza que deseja excluir a coleção <strong>"{collectionToDelete.name}"</strong>?
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCollectionToDelete(null)}
                className="w-full rounded-xl border border-border bg-background py-2.5 text-small font-bold text-foreground hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(collectionToDelete.id)}
                disabled={deleteMutation.isPending}
                className="w-full rounded-xl bg-danger py-2.5 text-small font-black text-white hover:brightness-110"
              >
                {deleteMutation.isPending ? "Excluindo..." : "Sim, Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
