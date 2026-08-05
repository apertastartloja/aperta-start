import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Save, Layers, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CollectionService } from "@/services/category.service";
import { ProductService } from "@/services/product.service";
import { StorageService } from "@/services/storage.service";
import type { Collection, Product } from "@/types";

interface CollectionDialogProps {
  open: boolean;
  onClose: () => void;
  collectionToEdit?: Collection | null;
  allProducts?: Product[];
}

export function CollectionDialog({
  open,
  onClose,
  collectionToEdit,
  allProducts = [],
}: CollectionDialogProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (collectionToEdit) {
      setName(collectionToEdit.name || "");
      setSlug(collectionToEdit.slug || "");
      setDescription(collectionToEdit.description || "");
      setImage(collectionToEdit.image || "");
      setSelectedProductIds(collectionToEdit.productIds || []);
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setImage("");
      setSelectedProductIds([]);
    }
  }, [collectionToEdit, open]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!collectionToEdit) {
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
      toast.success("Imagem da coleção enviada!");
    } catch {
      toast.error("Erro no upload da imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleProduct = (prodId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(prodId) ? prev.filter((id) => id !== prodId) : [...prev, prodId]
    );
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Informe o nome da coleção.");
      if (!slug.trim()) throw new Error("Informe o slug da coleção.");

      const payload = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim() || undefined,
        image: image.trim() || undefined,
        productIds: selectedProductIds,
      };

      if (collectionToEdit?.id) {
        return await CollectionService.update(collectionToEdit.id, payload);
      } else {
        return await CollectionService.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success(collectionToEdit ? "Coleção atualizada!" : "Coleção criada!");
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Erro ao salvar coleção.");
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-6 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-h4 font-black text-foreground flex items-center gap-2">
            <Layers className="size-5 text-accent" />
            {collectionToEdit ? "Editar Coleção" : "Nova Coleção"}
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
            <label className="text-caption font-bold text-foreground">Nome da Coleção</label>
            <input
              type="text"
              required
              placeholder="Ex: Kits de Alto Desempenho"
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
              placeholder="kits-alto-desempenho"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-small text-foreground focus:outline-none"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <label className="text-caption font-bold text-foreground">Descrição</label>
            <textarea
              rows={3}
              placeholder="Pequeno texto promocional da coleção..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-input bg-background p-3 text-small text-foreground"
            />
          </div>

          {/* Imagem Banner da Coleção */}
          <div className="space-y-1.5">
            <label className="text-caption font-bold text-foreground">Imagem da Coleção</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="https://exemplo.com/banner-colecao.jpg"
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

          {/* Seleção de Produtos */}
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="text-caption font-bold text-foreground">
              Produtos Inclusos na Coleção ({selectedProductIds.length} selecionados)
            </label>
            <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded-xl p-3 bg-background">
              {allProducts.map((prod) => (
                <label key={prod.id} className="flex items-center gap-2.5 text-small font-medium cursor-pointer hover:bg-muted/50 p-1 rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(prod.id)}
                    onChange={() => toggleProduct(prod.id)}
                    className="rounded accent-accent size-4"
                  />
                  <span className="truncate">{prod.name} (R$ {prod.price.toFixed(2)})</span>
                </label>
              ))}
            </div>
          </div>

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
              <span>Salvar Coleção</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
