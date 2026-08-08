import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  Link as LinkIcon,
  Trash2,
  Plus,
  ArrowLeft,
  Save,
  Loader2,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Star,
  Layers,
  Tag as TagIcon,
  Globe,
  Package,
  ShoppingBag,
  Weight,
  Ruler,
  Building2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ProductService } from "@/services/product.service";
import { CategoryService, CollectionService } from "@/services/category.service";
import { SupplierService } from "@/services/supplier.service";
import { StorageService } from "@/services/storage.service";
import type { Product, ProductBadgeType, ProductImage, ProductVariant, ProductSpec, Supplier } from "@/types";
import { cn } from "@/lib/utils";
import { RelatedProductsPicker } from "./related-products-picker";

interface ProductFormProps {
  initialData?: Product;
  isEditing?: boolean;
}

const BADGE_OPTIONS: { id: ProductBadgeType; label: string; bg: string }[] = [
  { id: "new", label: "🔥 Lançamento / Novo", bg: "bg-brand/10 text-brand border-brand/30" },
  { id: "sale", label: "🏷️ Oferta / Promoção", bg: "bg-danger/10 text-danger border-danger/30" },
  { id: "bestseller", label: "⭐ Mais Vendido", bg: "bg-accent/20 text-amber-700 dark:text-amber-400 border-accent/40" },
  { id: "exclusive", label: "👑 Exclusivo Aperta Start", bg: "bg-info/10 text-info border-info/30" },
];

export function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Load categories and collections
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => CategoryService.list(),
  });

  const { data: collections = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: () => CollectionService.list(),
  });

  const { data: suppliers = [], refetch: refetchSuppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => SupplierService.listAll(),
  });

  const { data: allProductsData } = useQuery({
    queryKey: ["products", "all-for-bump"],
    queryFn: () => ProductService.list({ perPage: 200, includeInactive: true }),
  });
  const allProducts = allProductsData?.data ?? [];

  // Form States
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [price, setPrice] = useState<number | string>(initialData?.price ?? "");
  const [costPrice, setCostPrice] = useState<number | string>(initialData?.costPrice ?? "");
  const [supplierId, setSupplierId] = useState<string>(initialData?.supplierId || "");
  const [compareAtPrice, setCompareAtPrice] = useState<number | string>(initialData?.compareAtPrice ?? "");
  const [stock, setStock] = useState<number | string>(initialData?.stock ?? 10);
  const [categoryId, setCategoryId] = useState<string>(initialData?.categoryId || "");

  // Quick Supplier Creation Modal State
  const [isQuickSupplierOpen, setIsQuickSupplierOpen] = useState(false);
  const [isSavingQuickSupplier, setIsSavingQuickSupplier] = useState(false);
  const [quickSupplierData, setQuickSupplierData] = useState({
    name: "",
    companyName: "",
    email: "",
    whatsapp: "",
  });
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(initialData?.collectionIds || []);
  const [selectedBadges, setSelectedBadges] = useState<ProductBadgeType[]>(initialData?.badges || []);
  const [tagsInput, setTagsInput] = useState<string>(initialData?.tags?.join(", ") || "");
  const [status, setStatus] = useState<"active" | "draft" | "archived">(initialData?.status || "active");
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || "");

  // New fields
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>(initialData?.relatedProductIds || []);
  const [relatedSearch, setRelatedSearch] = useState("");
  const [orderBumpProductId, setOrderBumpProductId] = useState<string>(initialData?.orderBumpProductId || "");
  const [orderBumpMessage, setOrderBumpMessage] = useState(initialData?.orderBumpMessage || "");
  const [orderBumpSearch, setOrderBumpSearch] = useState("");
  const [specs, setSpecs] = useState<ProductSpec[]>(initialData?.specs || []);
  const [shippingWeight, setShippingWeight] = useState<number | string>(initialData?.shippingWeight ?? "");
  const [shippingLength, setShippingLength] = useState<number | string>(initialData?.shippingLength ?? "");
  const [shippingWidth, setShippingWidth] = useState<number | string>(initialData?.shippingWidth ?? "");
  const [shippingHeight, setShippingHeight] = useState<number | string>(initialData?.shippingHeight ?? "");

  // Images state
  const [images, setImages] = useState<ProductImage[]>(
    initialData?.images || [
      {
        id: "img-1",
        url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80",
        alt: "Imagem do produto",
      },
    ]
  );
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Variants state
  const [hasVariants, setHasVariants] = useState<boolean>(Boolean(initialData?.variants && initialData.variants.length > 0));
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialData?.variants || [
      { id: "var-1", name: "Voltagem", value: "110V", stock: 10, priceDiff: 0 },
      { id: "var-2", name: "Voltagem", value: "220V", stock: 10, priceDiff: 0 },
    ]
  );

  // Auto-generate slug when name changes (if creating new)
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing || !slug) {
      const generatedSlug = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generatedSlug);
    }
  };

  // Generate Automatic SKU
  const generateAutoSku = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const prefix = name ? name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "SKU") : "PROD";
    const generated = `AS-${prefix}-${randomNum}`;
    setSku(generated);
    toast.info(`SKU gerado: ${generated}`);
  };

  // Default first category if not set
  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  // Image Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const url = await StorageService.uploadProductImage(files[i]);
        setImages((prev) => [
          ...prev,
          {
            id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            url,
            alt: files[i].name || name || "Imagem do produto",
          },
        ]);
      }
      toast.success("Imagem enviada com sucesso!");
    } catch {
      toast.error("Erro ao realizar upload da imagem.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddExternalUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [
      ...prev,
      {
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        url: imageUrlInput.trim(),
        alt: name || "Imagem do produto",
      },
    ]);
    setImageUrlInput("");
    toast.success("URL de imagem adicionada!");
  };

  const handleRemoveImage = (index: number) => {
    if (images.length <= 1) {
      toast.warning("O produto precisa ter pelo menos 1 imagem.");
      return;
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetCoverImage = (index: number) => {
    if (index === 0) return;
    const reordered = [...images];
    const [selected] = reordered.splice(index, 1);
    reordered.unshift(selected);
    setImages(reordered);
    toast.success("Foto de capa atualizada!");
  };

  // Toggle Collection selection
  const toggleCollection = (colId: string) => {
    setSelectedCollectionIds((prev) =>
      prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
    );
  };

  // Toggle Badge selection
  const toggleBadge = (badge: ProductBadgeType) => {
    setSelectedBadges((prev) =>
      prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge]
    );
  };

  // Variant helper functions
  const handleAddVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: "Voltagem",
        value: "220V",
        stock: 5,
        priceDiff: 0,
      },
    ]);
  };

  const handleUpdateVariant = (id: string, field: keyof ProductVariant, val: any) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: val } : v))
    );
  };

  const handleRemoveVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  // Mutation to create or update product
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Informe o nome do produto.");
      if (!slug.trim()) throw new Error("Informe o slug do produto.");
      if (!price || Number(price) <= 0) throw new Error("Informe um preço válido maior que zero.");

      const tagsArray = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        sku: sku.trim() || `AS-PROD-${Math.floor(1000 + Math.random() * 9000)}`,
        description: description.trim() || "Descrição do produto Aperta Start.",
        shortDescription: shortDescription.trim() || undefined,
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        categoryId: categoryId || (categories[0]?.id ?? "cat-ferramentas"),
        collectionIds: selectedCollectionIds,
        images,
        badges: selectedBadges,
        rating: initialData?.rating ?? 5.0,
        reviewsCount: initialData?.reviewsCount ?? 0,
        stock: Number(stock) || 0,
        variants: hasVariants ? variants : [],
        tags: tagsArray.length > 0 ? tagsArray : ["ferramentas", "aperta-start"],
        status,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
        relatedProductIds,
        orderBumpProductId: orderBumpProductId || null,
        orderBumpMessage: orderBumpMessage.trim() || undefined,
        supplierId: supplierId || undefined,
        costPrice: costPrice !== "" ? Number(costPrice) : undefined,
        shippingWeight: shippingWeight !== "" ? Number(shippingWeight) : undefined,
        shippingLength: shippingLength !== "" ? Number(shippingLength) : undefined,
        shippingWidth: shippingWidth !== "" ? Number(shippingWidth) : undefined,
        shippingHeight: shippingHeight !== "" ? Number(shippingHeight) : undefined,
      };

      if (isEditing && initialData?.id) {
        return await ProductService.update(initialData.id, payload);
      } else {
        return await ProductService.create(payload);
      }
    },
    onSuccess: (savedProduct) => {
      queryClient.invalidateQueries();
      toast.success(isEditing ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!");
      navigate({ to: "/painel/admin/produtos/lista" });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Erro ao salvar produto no Supabase.");
    },
  });

  const handleSaveQuickSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSupplierData.name.trim()) {
      toast.error("Informe o Nome Fantasia do fornecedor.");
      return;
    }

    setIsSavingQuickSupplier(true);
    try {
      const created = await SupplierService.create({
        name: quickSupplierData.name.trim(),
        companyName: quickSupplierData.companyName.trim() || undefined,
        email: quickSupplierData.email.trim() || "contato@fornecedor.com.br",
        whatsapp: quickSupplierData.whatsapp.replace(/\D/g, "") || undefined,
        status: "active",
        leadTimeDays: 3,
      });

      await refetchSuppliers();
      setSupplierId(created.id);
      setIsQuickSupplierOpen(false);
      setQuickSupplierData({ name: "", companyName: "", email: "", whatsapp: "" });
      toast.success(`Fornecedor "${created.name}" cadastrado e selecionado!`);
    } catch (err) {
      toast.error("Erro ao cadastrar fornecedor rápido.");
    } finally {
      setIsSavingQuickSupplier(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/painel/admin/produtos/lista"
            className="rounded-xl border border-border bg-surface p-2.5 text-foreground hover:bg-muted transition-all"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <span className="text-caption font-bold text-brand uppercase tracking-wider block">
              {isEditing ? "Edição de Produto" : "Novo Cadastro"}
            </span>
            <h1 className="text-h2 font-black text-foreground">
              {isEditing ? name || "Editar Produto" : "Cadastrar Novo Produto"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Selector */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="rounded-xl border border-input bg-surface px-3 py-2 text-small font-bold text-foreground focus:outline-none focus:border-ring"
          >
            <option value="active">🟢 Publicado (Ativo)</option>
            <option value="draft">🟡 Rascunho (Oculto)</option>
            <option value="archived">🔴 Arquivado</option>
          </select>

          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-small font-black text-accent-foreground shadow-medium hover:brightness-105 transition-all cursor-pointer disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="size-4" />
                <span>{isEditing ? "Salvar Alterações" : "Publicar Produto"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Main Info & Images) - 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Box 1: Informações Principais */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-medium space-y-5">
            <h3 className="text-h4 font-black text-foreground flex items-center gap-2">
              <Sparkles className="size-5 text-accent" /> Informações do Produto
            </h3>

            {/* Nome */}
            <div className="space-y-1.5">
              <label className="text-caption font-bold text-foreground">
                Nome do Produto <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Kit Parafusadeira e Furadeira de Impacto 20V Aperta Start"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none shadow-xs font-semibold"
              />
            </div>

            {/* Slug e SKU em grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-caption font-bold text-foreground">
                  URL Amigável (Slug)
                </label>
                <input
                  type="text"
                  required
                  placeholder="kit-parafusadeira-20v"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-caption font-bold text-foreground">Código SKU</label>
                  <button
                    type="button"
                    onClick={generateAutoSku}
                    className="text-[11px] font-bold text-brand hover:underline"
                  >
                    Gerar Automático
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="AS-PROD-9842"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Descrição Curta */}
            <div className="space-y-1.5">
              <label className="text-caption font-bold text-foreground">Descrição Curta (Resumo)</label>
              <input
                type="text"
                placeholder="Resumo rápido exibido ao lado das fotos na página do produto"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
              />
            </div>

            {/* Descrição Completa */}
            <div className="space-y-1.5">
              <label className="text-caption font-bold text-foreground">Descrição Completa</label>
              <textarea
                rows={5}
                placeholder="Descreva detalhadamente as especificações técnicas, itens inclusos e benefícios do produto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-2xl border border-input bg-background p-4 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none shadow-xs"
              />
            </div>
          </div>

          {/* Box 2: Imagens do Produto (Supabase Storage + URL) */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-medium space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-h4 font-black text-foreground">Galeria de Imagens</h3>
                <p className="text-caption text-muted-foreground">
                  A primeira foto será utilizada como capa principal no catálogo
                </p>
              </div>
            </div>

            {/* Dropzone Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Local File Upload */}
              <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background/50 p-6 text-center hover:bg-muted/40 transition-all cursor-pointer group">
                <Upload className="size-8 text-muted-foreground group-hover:text-brand transition-colors mb-2" />
                <span className="text-small font-bold text-foreground">
                  {isUploadingImage ? "Enviando arquivo..." : "Clique para Upload de Fotos"}
                </span>
                <span className="text-[11px] text-muted-foreground mt-1">PNG, JPG, WEBP até 10MB</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploadingImage}
                />
              </label>

              {/* Add via URL */}
              <div className="flex flex-col justify-center rounded-2xl border border-border bg-background/50 p-4 space-y-3">
                <span className="text-caption font-bold text-foreground flex items-center gap-1.5">
                  <LinkIcon className="size-3.5 text-brand" /> Adicionar via URL da Web
                </span>
                <input
                  type="url"
                  placeholder="https://exemplo.com/foto.jpg"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="w-full rounded-xl border border-input bg-surface px-3 py-2 text-small text-foreground focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddExternalUrl}
                  className="rounded-xl border border-border bg-surface py-2 text-small font-bold text-foreground hover:bg-muted transition-all"
                >
                  Adicionar URL
                </button>
              </div>
            </div>

            {/* Thumbnails List */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {images.map((img, index) => (
                <div
                  key={img.id || index}
                  className={cn(
                    "relative group rounded-2xl border bg-background p-2 transition-all",
                    index === 0 ? "border-accent ring-2 ring-accent/40" : "border-border"
                  )}
                >
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="h-28 w-full object-contain rounded-xl bg-white/50"
                  />
                  {index === 0 && (
                    <span className="absolute top-3 left-3 rounded-full bg-accent px-2 py-0.5 text-[10px] font-black text-accent-foreground shadow-xs">
                      Capa
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-2">
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetCoverImage(index)}
                        title="Definir como capa"
                        className="rounded-lg bg-surface p-2 text-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        <Star className="size-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      title="Remover foto"
                      className="rounded-lg bg-danger p-2 text-white hover:brightness-110"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Box 3: Variações de Produto */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-medium space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-h4 font-black text-foreground">Variações do Produto</h3>
                <p className="text-caption text-muted-foreground">
                  Opções de Voltagem (110V/220V), Cor, Tamanho ou Modelo
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasVariants}
                  onChange={(e) => setHasVariants(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>

            {hasVariants && (
              <div className="space-y-4 pt-2">
                <div className="space-y-3">
                  {variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center rounded-2xl border border-border bg-background p-3"
                    >
                      <input
                        type="text"
                        placeholder="Tipo ex: Voltagem"
                        value={variant.name}
                        onChange={(e) => handleUpdateVariant(variant.id, "name", e.target.value)}
                        className="rounded-xl border border-input bg-surface px-3 py-2 text-small text-foreground"
                      />
                      <input
                        type="text"
                        placeholder="Valor ex: 110V ou 220V"
                        value={variant.value}
                        onChange={(e) => handleUpdateVariant(variant.id, "value", e.target.value)}
                        className="rounded-xl border border-input bg-surface px-3 py-2 text-small text-foreground font-bold"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-caption font-bold">Estoque:</span>
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => handleUpdateVariant(variant.id, "stock", Number(e.target.value))}
                          className="w-20 rounded-xl border border-input bg-surface px-2 py-2 text-small text-foreground text-center font-bold"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-caption font-bold">Δ R$:</span>
                          <input
                            type="number"
                            placeholder="0"
                            value={variant.priceDiff || 0}
                            onChange={(e) => handleUpdateVariant(variant.id, "priceDiff", Number(e.target.value))}
                            className="w-20 rounded-xl border border-input bg-surface px-2 py-2 text-small text-foreground text-center"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(variant.id)}
                          className="rounded-lg p-2 text-danger hover:bg-danger/10"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddVariantRow}
                  className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-2.5 text-small font-bold text-foreground hover:bg-muted transition-all"
                >
                  <Plus className="size-4 text-brand" /> Adicionar Outra Variação
                </button>
              </div>
            )}
          </div>

          {/* Box 4: SEO */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-medium space-y-5">
            <h3 className="text-h4 font-black text-foreground flex items-center gap-2">
              <Globe className="size-5 text-info" /> Otimização para Buscadores (SEO)
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-caption font-bold text-foreground">Meta Título (Google)</label>
                <input
                  type="text"
                  placeholder={name || "Título exibido na aba do navegador e no Google"}
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-small text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-caption font-bold text-foreground">Meta Descrição</label>
                <textarea
                  rows={3}
                  placeholder="Resumo atraente exibido abaixo do título nos resultados de busca..."
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background p-3 text-small text-foreground"
                />
              </div>

              {/* Google Live Preview */}
              <div className="rounded-2xl border border-border bg-background p-4 space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Pré-visualização do resultado no Google:
                </span>
                <p className="text-small font-bold text-blue-600 dark:text-blue-400 truncate">
                  {seoTitle || name || "Nome do Produto — Aperta Start"}
                </p>

                <p className="text-[12px] text-emerald-700 dark:text-emerald-400 truncate">
                  https://apertastart.com.br/produto/{slug || "exemplo-produto"}
                </p>
                <p className="text-caption text-muted-foreground line-clamp-2">
                  {seoDescription || shortDescription || description || "Descrição do produto..."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Price, Category, Badges, Status) - 1 col */}
        <div className="space-y-6">
          {/* Preços e Estoque */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-medium space-y-5">
            <h3 className="text-h4 font-black text-foreground">Preços & Estoque</h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-caption font-bold text-foreground">
                  Preço de Venda (R$) <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-muted-foreground text-small">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="299.90"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-2xl border border-input bg-background pl-10 pr-4 py-3 text-h4 font-black text-foreground focus:border-ring focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-caption font-bold text-foreground">
                  Preço De / Comparação (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-muted-foreground text-small">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="399.90"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-small text-muted-foreground focus:border-ring focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Exibe o preço riscado para simular oferta</p>
              </div>

              {/* Preço de Custo */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <label className="text-caption font-bold text-foreground">
                  Preço de Custo / Aquisição (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-muted-foreground text-small">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="120.00"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-small font-bold text-foreground focus:border-ring focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">Valor pago ao fornecedor para cálculo de margem</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border">
                <label className="text-caption font-bold text-foreground">Estoque Total</label>
                <input
                  type="number"
                  required
                  placeholder="10"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-small font-black text-foreground focus:border-ring focus:outline-none"
                />
                {Number(stock) <= 5 && Number(stock) > 0 && (
                  <p className="text-[11px] font-bold text-amber-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="size-3" /> Alerta de Estoque Baixo (≤ 5 un)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Categorização e Fornecedor */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-medium space-y-5">
            <h3 className="text-h4 font-black text-foreground">Categorização & Fornecedor</h3>

            <div className="space-y-4">
              {/* Fornecedor Responsável */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-caption font-bold text-foreground">Fornecedor Responsável</label>
                  <button
                    type="button"
                    onClick={() => setIsQuickSupplierOpen(true)}
                    className="text-[11px] font-extrabold text-brand hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="size-3" /> + Novo Fornecedor
                  </button>
                </div>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-small font-bold text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="">Nenhum fornecedor vinculado</option>
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name} {sup.companyName ? `(${sup.companyName})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border">
                <label className="text-caption font-bold text-foreground">Categoria Principal</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-small font-bold text-foreground focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Coleções */}
              <div className="space-y-2 pt-2">
                <label className="text-caption font-bold text-foreground">Coleções Associadas</label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {collections.map((col) => (
                    <label key={col.id} className="flex items-center gap-2.5 text-small font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCollectionIds.includes(col.id)}
                        onChange={() => toggleCollection(col.id)}
                        className="rounded accent-accent size-4"
                      />
                      <span>{col.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Selos & Badges */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-medium space-y-4">
            <h3 className="text-h4 font-black text-foreground">Selos & Destaques</h3>
            <div className="space-y-2.5">
              {BADGE_OPTIONS.map((opt) => {
                const active = selectedBadges.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleBadge(opt.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-small font-bold border transition-all text-left",
                      active ? opt.bg : "border-border bg-background text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>{opt.label}</span>
                    {active && <CheckCircle2 className="size-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-medium space-y-3">
            <h3 className="text-h4 font-black text-foreground">Tags do Produto</h3>
            <input
              type="text"
              placeholder="ferramentas, kit, 20v, profissional"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-small text-foreground"
            />
            <p className="text-[11px] text-muted-foreground">Separe as palavras-chave por vírgula</p>
          </div>

          {/* Order Bump */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-medium space-y-4">
            <h3 className="text-h4 font-black text-foreground flex items-center gap-2">
              <ShoppingBag className="size-5 text-accent" /> Order Bump
            </h3>
            <p className="text-[12px] text-muted-foreground">
              Produto exibido no mini-carrinho para incentivar a compra adicional. Deixe vazio para não exibir bump.
            </p>

            <div className="space-y-3">
              {/* Search field */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar produto para bump por nome ou SKU..."
                  value={orderBumpSearch}
                  onChange={(e) => setOrderBumpSearch(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background pl-9 pr-4 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
                />
              </div>

              {/* Current selection */}
              {orderBumpProductId && (() => {
                const selected = allProducts.find((p) => p.id === orderBumpProductId);
                if (!selected) return null;
                return (
                  <div className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
                    <img
                      src={selected.images[0]?.url}
                      alt={selected.name}
                      className="h-10 w-10 rounded-xl object-contain bg-white border border-border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-small font-bold text-foreground truncate">{selected.name}</p>
                      <p className="text-caption text-muted-foreground">R$ {selected.price.toFixed(2).replace(".", ",")}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setOrderBumpProductId(""); setOrderBumpSearch(""); }}
                      className="rounded-lg p-1.5 text-danger hover:bg-danger/10"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                );
              })()}

              {/* Dropdown results */}
              {orderBumpSearch.trim() && (
                <div className="rounded-xl border border-border bg-background divide-y divide-border max-h-56 overflow-y-auto">
                  {allProducts
                    .filter((p) => {
                      const term = orderBumpSearch.toLowerCase();
                      return p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
                    })
                    .slice(0, 20)
                    .map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => { setOrderBumpProductId(p.id); setOrderBumpSearch(""); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors"
                      >
                        <img
                          src={p.images[0]?.url}
                          alt={p.name}
                          className="h-9 w-9 shrink-0 rounded-xl object-contain bg-white border border-border"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-small font-bold text-foreground truncate">{p.name}</p>
                          <p className="text-caption text-muted-foreground">SKU: {p.sku}</p>
                        </div>
                        <span className="text-small font-bold text-foreground shrink-0">
                          R$ {p.price.toFixed(2).replace(".", ",")}
                        </span>
                      </button>
                    ))}
                  {allProducts.filter((p) => {
                    const term = orderBumpSearch.toLowerCase();
                    return p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
                  }).length === 0 && (
                    <p className="px-4 py-3 text-caption text-muted-foreground italic">Nenhum produto encontrado.</p>
                  )}
                </div>
              )}

              {/* Bump message */}
              <div className="space-y-1.5">
                <label className="text-caption font-bold text-foreground">Mensagem do Bump</label>
                <input
                  type="text"
                  placeholder="Adicione por apenas +R$ 29,90!"
                  value={orderBumpMessage}
                  onChange={(e) => setOrderBumpMessage(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
                />
                <p className="text-[11px] text-muted-foreground">Esta mensagem será exibida no mini-carrinho abaixo do produto bump.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Full-width sections below the 2-column grid ── */}
      <div className="mt-8 space-y-6">

        {/* Produtos Relacionados */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-medium space-y-5">
          <h3 className="text-h4 font-black text-foreground flex items-center gap-2">
            <Package className="size-5 text-info" /> Produtos Relacionados
          </h3>
          <p className="text-[12px] text-muted-foreground">
            Selecione até 6 produtos para exibir na seção "Produtos Relacionados" na página pública deste produto.
          </p>

          <RelatedProductsPicker
            selectedIds={relatedProductIds}
            onToggle={(id) =>
              setRelatedProductIds((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(0, 6)
              )
            }
            currentProductId={initialData?.id}
          />
        </div>

        {/* Especificações Técnicas */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-medium space-y-5">
          <h3 className="text-h4 font-black text-foreground flex items-center gap-2">
            <Ruler className="size-5 text-brand" /> Especificações Técnicas
          </h3>
          <p className="text-[12px] text-muted-foreground">
            Pares chave → valor exibidos na aba "Especificações" da página do produto.
          </p>

          <div className="space-y-3">
            {specs.map((spec, idx) => (
              <div key={idx} className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Atributo (ex: Material)"
                  value={spec.key}
                  onChange={(e) => setSpecs((prev) => prev.map((s, i) => i === idx ? { ...s, key: e.target.value } : s))}
                  className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2.5 text-small font-bold text-foreground focus:border-ring focus:outline-none"
                />
                <span className="text-muted-foreground font-bold shrink-0">→</span>
                <input
                  type="text"
                  placeholder="Valor (ex: Polímero ABS)"
                  value={spec.value}
                  onChange={(e) => setSpecs((prev) => prev.map((s, i) => i === idx ? { ...s, value: e.target.value } : s))}
                  className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setSpecs((prev) => prev.filter((_, i) => i !== idx))}
                  className="rounded-lg p-2 text-danger hover:bg-danger/10 shrink-0"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setSpecs((prev) => [...prev, { key: "", value: "" }])}
              className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-2.5 text-small font-bold text-foreground hover:bg-muted transition-all"
            >
              <Plus className="size-4 text-brand" /> Adicionar Especificação
            </button>
          </div>
        </div>

        {/* Dimensões para Frete */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-medium space-y-5">
          <h3 className="text-h4 font-black text-foreground flex items-center gap-2">
            <Weight className="size-5 text-muted-foreground" /> Dimensões para Frete
          </h3>
          <p className="text-[12px] text-muted-foreground">
            Informações utilizadas para cálculo de frete por Correios e transportadoras.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-caption font-bold text-foreground">Peso (kg)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.340"
                value={shippingWeight}
                onChange={(e) => setShippingWeight(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-caption font-bold text-foreground">Comprimento (cm)</label>
              <input
                type="number"
                step="0.1"
                placeholder="22"
                value={shippingLength}
                onChange={(e) => setShippingLength(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-caption font-bold text-foreground">Largura (cm)</label>
              <input
                type="number"
                step="0.1"
                placeholder="15"
                value={shippingWidth}
                onChange={(e) => setShippingWidth(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-caption font-bold text-foreground">Altura (cm)</label>
              <input
                type="number"
                step="0.1"
                placeholder="12"
                value={shippingHeight}
                onChange={(e) => setShippingHeight(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
              />
            </div>
          </div>
        </div>

      </div>

      {/* QUICK SUPPLIER CREATION MODAL */}
      {isQuickSupplierOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-small font-black text-foreground">
                <Building2 className="size-4 text-brand" /> Cadastro Rápido de Fornecedor
              </div>
              <button
                type="button"
                onClick={() => setIsQuickSupplierOpen(false)}
                className="text-muted-foreground hover:text-foreground font-black text-small cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuickSupplier} className="space-y-3">
              <div className="space-y-1">
                <label className="text-caption font-bold text-muted-foreground">
                  Nome Fantasia / Fornecedor *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Hero 3D Studio"
                  value={quickSupplierData.name}
                  onChange={(e) =>
                    setQuickSupplierData({ ...quickSupplierData, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-small text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-caption font-bold text-muted-foreground">Razão Social</label>
                <input
                  type="text"
                  placeholder="Ex: Hero Impressão 3D LTDA"
                  value={quickSupplierData.companyName}
                  onChange={(e) =>
                    setQuickSupplierData({ ...quickSupplierData, companyName: e.target.value })
                  }
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-small text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-caption font-bold text-muted-foreground">E-mail *</label>
                  <input
                    type="email"
                    required
                    placeholder="contato@empresa.com"
                    value={quickSupplierData.email}
                    onChange={(e) =>
                      setQuickSupplierData({ ...quickSupplierData, email: e.target.value })
                    }
                    className="w-full rounded-xl border border-input bg-background p-2.5 text-small text-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-caption font-bold text-muted-foreground">WhatsApp</label>
                  <input
                    type="text"
                    placeholder="11987654321"
                    value={quickSupplierData.whatsapp}
                    onChange={(e) =>
                      setQuickSupplierData({ ...quickSupplierData, whatsapp: e.target.value })
                    }
                    className="w-full rounded-xl border border-input bg-background p-2.5 text-small text-foreground font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsQuickSupplierOpen(false)}
                  className="rounded-xl border border-input bg-background px-4 py-2 text-small font-bold text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuickSupplier}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-small font-extrabold text-brand-foreground shadow-xs hover:brightness-105 transition-all cursor-pointer"
                >
                  {isSavingQuickSupplier ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Building2 className="size-4" />
                  )}
                  Salvar e Selecionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
