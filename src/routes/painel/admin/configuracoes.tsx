import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Settings,
  Building2,
  Share2,
  Target,
  ShieldCheck,
  Save,
  Loader2,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Instagram,
  Youtube,
  Facebook,
  MessageSquare,
  Sparkles,
  Info,
  Bell,
} from "lucide-react";
import { AdminLayout } from "@/components/admin";
import { StoreSettingsService, type StoreSettings } from "@/services/store-settings.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel/admin/configuracoes")({
  head: () => ({
    meta: [{ title: "Configurações — Painel Aperta Start" }],
  }),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<"general" | "pixels" | "social" | "preferences">("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState<StoreSettings>({
    storeName: "",
    corporateName: "",
    cnpj: "",
    stateRegistration: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    metaPixelId: "",
    googleAnalyticsId: "",
    gtmId: "",
    tiktokPixelId: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    facebook: "",
    whatsappLink: "",
    topBarNotice: "",
    showLowStockAlert: true,
    enableLgpdNotice: true,
  });

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await StoreSettingsService.getSettings();
      setForm(data);
    } catch (err) {
      console.error("Erro ao carregar configurações:", err);
      toast.error("Erro ao carregar dados da loja.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await StoreSettingsService.updateSettings(form);
      toast.success("Configurações salvas com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
      toast.error("Erro ao salvar preferências.");
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
              <Settings className="size-4" /> Configurações Gerais
            </div>
            <h1 className="text-h2 font-black text-foreground tracking-tight">Preferências da Loja</h1>
            <p className="text-small text-muted-foreground">
              Ajuste dados cadastrais, pixels de rastreamento, redes sociais e textos informativos da loja.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
            className="inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-small font-extrabold text-accent-foreground shadow-medium hover:brightness-105 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Save className="size-4.5" /> Salvar Configurações
              </>
            )}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="rounded-3xl border border-border bg-surface p-2 shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { id: "general", label: "🏢 Dados Cadastrais & Loja", icon: Building2 },
            { id: "pixels", label: "🎯 Pixels & Rastreamento", icon: Target },
            { id: "social", label: "📱 Redes Sociais & Canais", icon: Share2 },
            { id: "preferences", label: "⚙️ Avisos & LGPD", icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 rounded-2xl px-4 py-2.5 text-small font-bold transition-all cursor-pointer whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-brand text-brand-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Container */}
        {isLoading ? (
          <div className="p-12 text-center space-y-3 rounded-3xl border border-border bg-surface">
            <Loader2 className="size-8 animate-spin text-brand mx-auto" />
            <p className="text-small text-muted-foreground">Carregando configurações...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* TAB 1: General & Store Info */}
            {activeTab === "general" && (
              <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="border-b border-border pb-4">
                  <h2 className="text-h3 font-black text-foreground flex items-center gap-2">
                    <Building2 className="size-5 text-brand" /> Dados Cadastrais da Empresa
                  </h2>
                  <p className="text-small text-muted-foreground">
                    Informações exibidas no rodapé da loja e nas notas de pedido.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Store Name */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-caption font-bold text-foreground">Nome Fantasia da Loja</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Aperta Start - Suportes & Decoração Gamer"
                      value={form.storeName}
                      onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
                    />
                  </div>

                  {/* Corporate Name */}
                  <div className="space-y-1.5">
                    <label className="text-caption font-bold text-foreground">Razão Social (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ex: Aperta Start Comércio Digital LTDA"
                      value={form.corporateName}
                      onChange={(e) => setForm({ ...form, corporateName: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
                    />
                  </div>

                  {/* CNPJ (Explicitly Optional!) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-caption font-bold text-foreground">CNPJ</label>
                      <span className="text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.2 rounded-md">
                        Opcional / Em Emissão
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="00.000.000/0001-00 (Opcional por enquanto)"
                      value={form.cnpj}
                      onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small font-mono text-foreground focus:border-ring focus:outline-none"
                    />
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Info className="size-3 text-brand" /> Você pode cadastrar o CNPJ posteriormente quando o processo estiver concluído.
                    </p>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-caption font-bold text-foreground">E-mail de Atendimento</label>
                    <input
                      type="email"
                      required
                      placeholder="contato@apertastart.com.br"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
                    />
                  </div>

                  {/* Phone / WhatsApp */}
                  <div className="space-y-1.5">
                    <label className="text-caption font-bold text-foreground">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="(11) 98765-4321"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-caption font-bold text-foreground">Endereço Físico / Sede</label>
                    <input
                      type="text"
                      placeholder="Ex: Av. Paulista, 1000 - Bela Vista, São Paulo/SP"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Tracking Pixels */}
            {activeTab === "pixels" && (
              <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="border-b border-border pb-4">
                  <h2 className="text-h3 font-black text-foreground flex items-center gap-2">
                    <Target className="size-5 text-brand" /> Pixels & Ferramentas de Rastreamento
                  </h2>
                  <p className="text-small text-muted-foreground">
                    Insira as chaves de rastreamento para mensurar campanhas no Facebook Ads, Google e TikTok.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Meta Pixel */}
                  <div className="space-y-1.5">
                    <label className="text-caption font-bold text-foreground">ID do Meta Pixel (Facebook Ads)</label>
                    <input
                      type="text"
                      placeholder="Ex: 123456789012345"
                      value={form.metaPixelId}
                      onChange={(e) => setForm({ ...form, metaPixelId: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small font-mono text-foreground focus:border-ring focus:outline-none"
                    />
                    <p className="text-[11px] text-muted-foreground">Dispara eventos automáticos de PageView, AddToCart e Purchase.</p>
                  </div>

                  {/* Google Analytics 4 */}
                  <div className="space-y-1.5">
                    <label className="text-caption font-bold text-foreground">Google Analytics 4 (GA4 Tag ID)</label>
                    <input
                      type="text"
                      placeholder="Ex: G-XXXXXXXXXX"
                      value={form.googleAnalyticsId}
                      onChange={(e) => setForm({ ...form, googleAnalyticsId: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small font-mono text-foreground focus:border-ring focus:outline-none"
                    />
                  </div>

                  {/* GTM */}
                  <div className="space-y-1.5">
                    <label className="text-caption font-bold text-foreground">Google Tag Manager (GTM Container ID)</label>
                    <input
                      type="text"
                      placeholder="Ex: GTM-XXXXXXX"
                      value={form.gtmId}
                      onChange={(e) => setForm({ ...form, gtmId: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small font-mono text-foreground focus:border-ring focus:outline-none"
                    />
                  </div>

                  {/* TikTok Pixel */}
                  <div className="space-y-1.5">
                    <label className="text-caption font-bold text-foreground">TikTok Pixel ID</label>
                    <input
                      type="text"
                      placeholder="Ex: CXXXXXXXXXXXXXX"
                      value={form.tiktokPixelId}
                      onChange={(e) => setForm({ ...form, tiktokPixelId: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small font-mono text-foreground focus:border-ring focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Social Media & Channels */}
            {activeTab === "social" && (
              <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="border-b border-border pb-4">
                  <h2 className="text-h3 font-black text-foreground flex items-center gap-2">
                    <Share2 className="size-5 text-brand" /> Redes Sociais & Canais Oficiais
                  </h2>
                  <p className="text-small text-muted-foreground">
                    Links exibidos no cabeçalho, rodapé e botão flutuante de WhatsApp.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Instagram */}
                  <div className="space-y-1.5">
                    <label className="text-caption font-bold text-foreground flex items-center gap-1.5">
                      <Instagram className="size-4 text-pink-500" /> Perfil do Instagram
                    </label>
                    <input
                      type="text"
                      placeholder="apertastart.oficial"
                      value={form.instagram}
                      onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
                    />
                  </div>

                  {/* TikTok */}
                  <div className="space-y-1.5">
                    <label className="text-caption font-bold text-foreground flex items-center gap-1.5">
                      <Share2 className="size-4 text-foreground" /> Perfil do TikTok
                    </label>
                    <input
                      type="text"
                      placeholder="@apertastart"
                      value={form.tiktok}
                      onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small text-foreground focus:border-ring focus:outline-none"
                    />
                  </div>

                  {/* WhatsApp Link */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-caption font-bold text-foreground flex items-center gap-1.5">
                      <MessageSquare className="size-4 text-emerald-500" /> Link Direto WhatsApp de Vendas
                    </label>
                    <input
                      type="text"
                      placeholder="https://wa.me/5511987654321?text=Olá,%20vim%20pelo%20site"
                      value={form.whatsappLink}
                      onChange={(e) => setForm({ ...form, whatsappLink: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small font-mono text-foreground focus:border-ring focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Preferences & Announcements */}
            {activeTab === "preferences" && (
              <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="border-b border-border pb-4">
                  <h2 className="text-h3 font-black text-foreground flex items-center gap-2">
                    <Bell className="size-5 text-brand" /> Avisos da Loja & Preferências LGPD
                  </h2>
                  <p className="text-small text-muted-foreground">
                    Personalize a mensagem da barra do topo e regras do sistema.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Top Bar Notice */}
                  <div className="space-y-1.5">
                    <label className="text-caption font-bold text-foreground">Mensagem da Barra Superior (Top Bar)</label>
                    <textarea
                      rows={2}
                      placeholder="⚡ Frete Grátis para todo o Sudeste acima de R$ 199,00! Cupom: START10"
                      value={form.topBarNotice}
                      onChange={(e) => setForm({ ...form, topBarNotice: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-small text-foreground focus:border-ring focus:outline-none resize-none"
                    />
                  </div>

                  {/* Toggles */}
                  <div className="space-y-4 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-bold text-foreground text-small">Alertas Visuais de Estoque Baixo</p>
                        <p className="text-caption text-muted-foreground">
                          Exibir aviso "Últimas unidades em estoque" nas páginas dos produtos com menos de 5 itens.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.showLowStockAlert}
                        onChange={(e) => setForm({ ...form, showLowStockAlert: e.target.checked })}
                        className="size-5 rounded accent-brand cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-4">
                      <div className="space-y-0.5">
                        <p className="font-bold text-foreground text-small">Banner de Consentimento LGPD (Cookies)</p>
                        <p className="text-caption text-muted-foreground">
                          Exibir aviso de privacidade e aceite de cookies para visitantes novos.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.enableLgpdNotice}
                        onChange={(e) => setForm({ ...form, enableLgpdNotice: e.target.checked })}
                        className="size-5 rounded accent-brand cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Save Bar */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-small font-extrabold text-accent-foreground shadow-medium hover:brightness-105 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" /> Salvar Configurações
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
