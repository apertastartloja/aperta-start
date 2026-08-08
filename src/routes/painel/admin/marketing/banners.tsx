import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Image as ImageIcon,
  Plus,
  Search,
  CheckCircle2,
  Edit2,
  Trash2,
  Power,
  ArrowRight,
  ExternalLink,
  Loader2,
  Layers,
  Sparkles,
  MoveUp,
  MoveDown,
} from "lucide-react";
import { AdminLayout } from "@/components/admin";
import { BannerService } from "@/services/banner.service";
import type { Banner } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel/admin/marketing/banners")({
  head: () => ({
    meta: [{ title: "Banners — Painel Aperta Start" }],
  }),
  component: BannersPage,
});

const PLACEMENT_LABELS: Record<Banner["placement"], string> = {
  hero: "Carrossel Hero (Home)",
  strip: "Faixa Promocional",
  category: "Topo de Categoria",
  sidebar: "Barra Lateral",
};

function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [placementFilter, setPlacementFilter] = useState<Banner["placement"] | "all">("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    title: "",
    highlightText: "",
    subtitle: "",
    image: "",
    ctaLabel: "",
    ctaHref: "",
    placement: "hero" as Banner["placement"],
    order: 1,
    active: true,
  });

  const loadBanners = async () => {
    setIsLoading(true);
    try {
      const data = await BannerService.listAll();
      setBanners(data);
    } catch (err) {
      console.error("Erro ao carregar banners:", err);
      toast.error("Erro ao carregar lista de banners.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const filteredBanners = useMemo(() => {
    return banners.filter((b) => {
      if (placementFilter !== "all" && b.placement !== placementFilter) return false;
      return true;
    });
  }, [banners, placementFilter]);

  const handleOpenCreateModal = () => {
    setEditingBanner(null);
    setForm({
      title: "Organize seu setup.",
      highlightText: "Eleve seu game.",
      subtitle: "Suportes para controles, headsets e iluminação premium.",
      image: "/assets/products/suporte-duplo.jpg",
      ctaLabel: "Explorar Loja",
      ctaHref: "/loja",
      placement: "hero",
      order: banners.length + 1,
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title,
      highlightText: banner.highlightText || "",
      subtitle: banner.subtitle || "",
      image: banner.image,
      ctaLabel: banner.ctaLabel || "",
      ctaHref: banner.ctaHref || "",
      placement: banner.placement,
      order: banner.order,
      active: banner.active,
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id: string) => {
    try {
      const updated = await BannerService.toggleActive(id);
      toast.success(
        `Banner "${updated.title}" foi ${updated.active ? "ativado" : "desativado"} com sucesso!`
      );
      loadBanners();
    } catch (err) {
      console.error("Erro ao alterar status do banner:", err);
      toast.error("Erro ao alterar visibilidade do banner.");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await BannerService.delete(id);
      toast.success("Banner excluído com sucesso.");
      loadBanners();
    } catch (err) {
      console.error("Erro ao excluir banner:", err);
      toast.error("Erro ao excluir banner.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.image.trim()) {
      toast.error("Preencha o título e a URL da imagem do banner.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: form.title,
        highlightText: form.highlightText || undefined,
        subtitle: form.subtitle || undefined,
        image: form.image,
        ctaLabel: form.ctaLabel || undefined,
        ctaHref: form.ctaHref || undefined,
        placement: form.placement,
        order: Number(form.order),
        active: form.active,
      };

      if (editingBanner) {
        await BannerService.update(editingBanner.id, payload);
        toast.success("Banner atualizado com sucesso!");
      } else {
        await BannerService.create(payload);
        toast.success("Novo banner cadastrado!");
      }

      setIsModalOpen(false);
      loadBanners();
    } catch (err) {
      console.error("Erro ao salvar banner:", err);
      toast.error("Ocorreu um erro ao salvar o banner.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-caption font-extrabold text-brand uppercase tracking-wider">
              <ImageIcon className="size-4" /> Marketing & Vitrines
            </div>
            <h1 className="text-h2 font-black text-foreground tracking-tight">Banners & Destaques</h1>
            <p className="text-small text-muted-foreground">
              Gerencie os carrosséis principais da home, banners promocionais e chamadas da loja.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-small font-extrabold text-accent-foreground shadow-medium hover:brightness-105 transition-all cursor-pointer"
          >
            <Plus className="size-4.5 stroke-[3]" /> Cadastrar Novo Banner
          </button>
        </div>

        {/* Filter bar */}
        <div className="rounded-3xl border border-border bg-surface p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "Todos os Banners" },
              { id: "hero", label: "Hero (Home Slider)" },
              { id: "strip", label: "Faixas Promocionais" },
              { id: "category", label: "Topo de Categoria" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPlacementFilter(tab.id as any)}
                className={cn(
                  "rounded-xl border px-3.5 py-2 text-caption font-bold whitespace-nowrap transition-all cursor-pointer",
                  placementFilter === tab.id
                    ? "border-brand bg-brand text-brand-foreground shadow-xs"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Banners Grid */}
        {isLoading ? (
          <div className="p-12 text-center space-y-3 rounded-3xl border border-border bg-surface">
            <Loader2 className="size-8 animate-spin text-brand mx-auto" />
            <p className="text-small text-muted-foreground">Carregando banners...</p>
          </div>
        ) : filteredBanners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBanners.map((banner) => (
              <div
                key={banner.id}
                className={cn(
                  "group relative overflow-hidden rounded-3xl border bg-surface shadow-light transition-all hover:shadow-medium flex flex-col justify-between",
                  banner.active ? "border-border" : "border-border opacity-70 bg-muted/20"
                )}
              >
                {/* Banner Image Preview */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="rounded-full bg-brand px-3 py-1 text-caption font-black text-brand-foreground shadow-sm">
                      {PLACEMENT_LABELS[banner.placement]}
                    </span>
                    <span className="rounded-full bg-surface/80 backdrop-blur-md px-2.5 py-0.5 text-caption font-bold text-white border border-white/20">
                      Ordem: #{banner.order}
                    </span>
                  </div>

                  {/* Active Toggle Overlay */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleToggleActive(banner.id)}
                      className={cn(
                        "rounded-full px-3 py-1 text-caption font-black border backdrop-blur-md transition-all cursor-pointer",
                        banner.active
                          ? "bg-emerald-500/80 text-white border-emerald-400"
                          : "bg-slate-900/80 text-slate-400 border-slate-700"
                      )}
                    >
                      {banner.active ? "Ativo" : "Inativo"}
                    </button>
                  </div>

                  {/* Preview Text Content */}
                  <div className="absolute bottom-3 left-4 right-4 text-white space-y-1">
                    <h3 className="text-h4 font-black tracking-tight leading-tight line-clamp-1">
                      {banner.title} {banner.highlightText && <span className="text-amber-400">{banner.highlightText}</span>}
                    </h3>
                    {banner.subtitle && (
                      <p className="text-caption text-slate-300 line-clamp-1 opacity-90">{banner.subtitle}</p>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-surface border-t border-border flex items-center justify-between gap-3 text-caption">
                  <div className="flex items-center gap-2 text-muted-foreground truncate">
                    {banner.ctaLabel ? (
                      <span className="inline-flex items-center gap-1 font-bold text-foreground bg-background px-2.5 py-1 rounded-lg border border-border">
                        Botão: {banner.ctaLabel} <ArrowRight className="size-3 text-brand" />
                      </span>
                    ) : (
                      <span className="italic">Sem botão CTA</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(banner)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      <Edit2 className="size-3.5" /> Editar
                    </button>

                    <button
                      onClick={() => handleDelete(banner.id)}
                      disabled={deletingId === banner.id}
                      className="p-1.5 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                      title="Excluir banner"
                    >
                      {deletingId === banner.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-4 rounded-3xl border border-border bg-surface">
            <ImageIcon className="size-10 text-muted-foreground mx-auto" />
            <p className="text-small text-muted-foreground">Nenhum banner cadastrado para este posicionamento.</p>
          </div>
        )}
      </div>

      {/* Modal Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-surface p-6 sm:p-8 space-y-6 shadow-2xl border border-border animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <span className="text-caption font-extrabold text-brand uppercase tracking-wider">
                  {editingBanner ? "Editar Banner" : "Novo Banner Promocional"}
                </span>
                <h2 className="text-h3 font-black text-foreground">
                  {editingBanner ? editingBanner.title : "Cadastrar Banner"}
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
              {/* Placement */}
              <div className="space-y-1.5">
                <label className="text-caption font-bold text-foreground">Posicionamento na Loja</label>
                <select
                  value={form.placement}
                  onChange={(e) => setForm({ ...form, placement: e.target.value as Banner["placement"] })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
                >
                  <option value="hero">Carrossel Hero (Topo da Home)</option>
                  <option value="strip">Faixa Promocional Intermediária</option>
                  <option value="category">Topo de Páginas de Categoria</option>
                </select>
              </div>

              {/* Title & Highlight */}
              <div className="space-y-1.5">
                <label className="text-caption font-bold text-foreground">Título Principal</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Organize seu setup."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-caption font-bold text-foreground">Texto de Destaque (Amarelo)</label>
                <input
                  type="text"
                  placeholder="Ex: Eleve seu game."
                  value={form.highlightText}
                  onChange={(e) => setForm({ ...form, highlightText: e.target.value })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-1.5">
                <label className="text-caption font-bold text-foreground">Subtítulo / Descrição Curta</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Suportes para controles, headsets e iluminação com acabamento premium."
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none resize-none"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-1.5">
                <label className="text-caption font-bold text-foreground">URL da Imagem do Banner</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: /assets/products/suporte-duplo.jpg ou URL da imagem"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small font-mono text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
                />
              </div>

              {/* CTA Label & Href */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-caption font-bold text-foreground">Texto do Botão CTA</label>
                  <input
                    type="text"
                    placeholder="Ex: Explorar Loja"
                    value={form.ctaLabel}
                    onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-caption font-bold text-foreground">Link de Destino</label>
                  <input
                    type="text"
                    placeholder="Ex: /loja ou /produto/..."
                    value={form.ctaHref}
                    onChange={(e) => setForm({ ...form, ctaHref: e.target.value })}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small font-mono text-foreground focus:border-ring focus:outline-none"
                  />
                </div>
              </div>

              {/* Order & Active */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-caption font-bold text-foreground">Ordem de Exibição</label>
                  <input
                    type="number"
                    min="1"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small font-bold text-foreground focus:border-ring focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    id="banner-active-check"
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="size-4 rounded accent-brand cursor-pointer"
                  />
                  <label htmlFor="banner-active-check" className="text-small font-bold text-foreground cursor-pointer">
                    Banner Ativo
                  </label>
                </div>
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
                      <CheckCircle2 className="size-4" /> {editingBanner ? "Salvar Banner" : "Cadastrar Banner"}
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
