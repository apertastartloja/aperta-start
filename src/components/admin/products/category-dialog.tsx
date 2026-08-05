import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Save, FolderTree, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CategoryService } from "@/services/category.service";
import { StorageService } from "@/services/storage.service";
import type { Category } from "@/types";

interface CategoryDialogProps {
  open: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
  allCategories?: Category[];
}

export function CategoryDialog({
  open,
  onClose,
  categoryToEdit,
  allCategories = [],
}: CategoryDialogProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [image, setImage] = useState("");
  const [featured, setFeatured] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name || "");
      setSlug(categoryToEdit.slug || "");
      setDescription(categoryToEdit.description || "");
      setParentId(categoryToEdit.parentId || null);
      setImage(categoryToEdit.image || "");
      setFeatured(categoryToEdit.featured || false);
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setParentId(null);
      setImage("");
      setFeatured(false);
    }
  }, [categoryToEdit, open]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!categoryToEdit) {
      const generatedSlug = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generatedSlug);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const url = await StorageService.uploadProductImage(files[0]);
      setImage(url);
      toast.success("Imagem da categoria enviada!");
    } catch {
      toast.error("Erro no upload da imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Informe o nome da categoria.");
      if (!slug.trim()) throw new Error("Informe o slug da categoria.");

      const payload = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim() || undefined,
        parentId: parentId || null,
        image: image.trim() || undefined,
        featured,
        order: categoryToEdit?.order ?? 0,
      };

      if (categoryToEdit?.id) {
        return await CategoryService.update(categoryToEdit.id, payload);
      } else {
        return await CategoryService.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(categoryToEdit ? "Categoria atualizada!" : "Categoria criada!");
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Erro ao salvar categoria.");
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-6 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-h4 font-black text-foreground flex items-center gap-2">
            <FolderTree className="size-5 text-accent" />
            {categoryToEdit ? "Editar Categoria" : "Nova Categoria"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
        >
          {/* Nome */}
          <div className="space-y-1.5">
            <label className="text-caption font-bold text-foreground">Nome da Categoria</label>
            <input
              type="text"
              required
              placeholder="Ex: Ferramentas Elétricas"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-small font-semibold text-foreground focus:outline-none"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <label className="text-caption font-bold text-foreground">Slug (URL)</label>
            <input
              type="text"
              required
              placeholder="ferramentas-eletricas"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-small text-foreground focus:outline-none"
            />
          </div>

          {/* Categoria Pai */}
          <div className="space-y-1.5">
            <label className="text-caption font-bold text-foreground">Categoria Pai (Opcional)</label>
            <select
              value={parentId || ""}
              onChange={(e) => setParentId(e.target.value || null)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-small text-foreground focus:outline-none"
            >
              <option value="">Nenhuma (Categoria Raiz)</option>
              {allCategories
                .filter((c) => c.id !== categoryToEdit?.id)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <label className="text-caption font-bold text-foreground">Descrição</label>
            <textarea
              rows={3}
              placeholder="Descrição resumida da categoria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-input bg-background p-3 text-small text-foreground"
            />
          </div>

          {/* Imagem */}
          <div className="space-y-1.5">
            <label className="text-caption font-bold text-foreground">Imagem da Categoria</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="https://exemplo.com/imagem.jpg"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-small text-foreground"
              />
              <label className="shrink-0 rounded-xl border border-border bg-background px-3 py-2 text-small font-bold cursor-pointer hover:bg-muted transition-all">
                {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Destaque */}
          <label className="flex items-center gap-2 pt-2 text-small font-bold text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="rounded accent-accent size-4"
            />
            <span>Destacar categoria no menu e na Home</span>
          </label>

          {/* Action Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-small font-bold text-foreground hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-small font-black text-accent-foreground shadow-medium hover:brightness-105"
            >
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              <span>Salvar Categoria</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
