import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Sparkles,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin";
import { CategoryDialog } from "@/components/admin/products/category-dialog";
import { CategoryService } from "@/services/category.service";
import type { Category } from "@/types";

export const Route = createFileRoute("/painel/admin/produtos/categorias")({
  head: () => ({
    meta: [{ title: "Categorias — Painel Aperta Start" }],
  }),
  component: CategoriasPage,
});

function CategoriasPage() {
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => CategoryService.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => CategoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria excluída com sucesso!");
      setCategoryToDelete(null);
    },
  });

  const handleOpenCreate = () => {
    setCategoryToEdit(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setCategoryToEdit(cat);
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Title & Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-caption font-black text-brand uppercase tracking-wider">
              <FolderTree className="size-4 text-accent" /> Estrutura do Catálogo
            </div>
            <h1 className="text-h2 font-black text-foreground">Categorias de Produtos</h1>
            <p className="text-small text-muted-foreground">
              Gerencie a árvore de categorias integradas ao Supabase.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-small font-black text-accent-foreground shadow-medium hover:brightness-105 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="size-5" />
            Nova Categoria
          </button>
        </div>

        {/* Categories List Card */}
        <div className="rounded-3xl border border-border bg-surface shadow-medium overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 space-x-3 text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-accent" />
              <span className="font-bold">Carregando categorias...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <FolderTree className="size-12 mx-auto text-muted-foreground" />
              <h3 className="text-h3 font-black text-foreground">Nenhuma categoria cadastrada</h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-small">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-caption text-muted-foreground">
                    <th className="py-3.5 px-4 font-extrabold">Categoria</th>
                    <th className="py-3.5 px-4 font-extrabold">Slug (URL)</th>
                    <th className="py-3.5 px-4 font-extrabold">Categoria Pai</th>
                    <th className="py-3.5 px-4 font-extrabold">Destaque</th>
                    <th className="py-3.5 px-4 font-extrabold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {categories.map((cat) => {
                    const parentCat = categories.find((c) => c.id === cat.parentId);
                    return (
                      <tr key={cat.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {cat.image ? (
                              <img
                                src={cat.image}
                                alt={cat.name}
                                className="size-10 rounded-xl object-cover bg-background border border-border shrink-0"
                              />
                            ) : (
                              <div className="size-10 rounded-xl bg-accent/20 text-amber-700 dark:text-amber-400 grid place-items-center font-black">
                                <FolderTree className="size-5" />
                              </div>
                            )}
                            <div>
                              <p className="font-extrabold text-foreground">{cat.name}</p>
                              {cat.description && (
                                <p className="text-[11px] text-muted-foreground truncate max-w-xs">
                                  {cat.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[12px] text-muted-foreground">{cat.slug}</td>
                        <td className="py-3.5 px-4 font-bold text-foreground">
                          {parentCat ? (
                            <span className="inline-block rounded-lg bg-muted px-2.5 py-1 text-caption">
                              {parentCat.name}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-[12px]">Nenhuma (Raiz)</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {cat.featured ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-caption font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="size-3" /> Sim
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-[12px]">Não</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEdit(cat)}
                              className="rounded-lg p-2 text-muted-foreground hover:bg-brand/10 hover:text-brand"
                            >
                              <Edit className="size-4" />
                            </button>
                            <button
                              onClick={() => setCategoryToDelete(cat)}
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

      {/* Category Modal */}
      <CategoryDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        categoryToEdit={categoryToEdit}
        allCategories={categories}
      />

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl space-y-5">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-danger/10 text-danger">
              <ShieldAlert className="size-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-h3 font-black text-foreground">Excluir Categoria?</h3>
              <p className="text-small text-muted-foreground">
                Tem certeza que deseja excluir a categoria <strong>"{categoryToDelete.name}"</strong>?
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="w-full rounded-xl border border-border bg-background py-2.5 text-small font-bold text-foreground hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(categoryToDelete.id)}
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
