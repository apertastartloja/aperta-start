import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Eye,
  Code,
  Sparkles,
  Loader2,
  ShieldCheck,
  Package,
  Truck,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layout,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Laptop,
  Smartphone,
  ChevronLeft,
  Save,
  Sliders,
  DollarSign,
  UserCheck,
  ShoppingBag,
  ExternalLink,
  Info,
} from "lucide-react";
import { AdminLayout } from "@/components/admin";
import { EmailService } from "@/services/email.service";
import {
  EmailTemplateService,
  emailVariablesList,
  sampleTemplateContext,
  type EmailTemplate,
  type EmailBlock,
  type EmailBlockType,
} from "@/services/email-template.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel/admin/emails")({
  head: () => ({
    meta: [{ title: "E-mails Transacionais — Painel Aperta Start" }],
  }),
  component: EmailsPage,
});

function EmailsPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Active View Mode: 'catalog' or 'builder'
  const [viewMode, setViewMode] = useState<"catalog" | "builder">("catalog");
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [builderTab, setBuilderTab] = useState<"blocks" | "inspector" | "vars">("blocks");
  const [devicePreview, setDevicePreview] = useState<"desktop" | "mobile">("desktop");
  const [isSaving, setIsSaving] = useState(false);

  // Test Email Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState("apertastart.loja@gmail.com");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [targetTemplateForTest, setTargetTemplateForTest] = useState<EmailTemplate | null>(null);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await EmailTemplateService.listAll();
      setTemplates(data);
    } catch (err) {
      console.error("Erro ao carregar templates:", err);
      toast.error("Falha ao carregar catálogo de templates.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (template: EmailTemplate) => {
    try {
      const updated = await EmailTemplateService.updateTemplate(template.id, {
        active: !template.active,
      });
      setTemplates((prev) => prev.map((t) => (t.id === template.id ? updated : t)));
      toast.success(
        `Template "${template.name}" ${updated.active ? "ativado" : "desativado"} com sucesso!`
      );
    } catch (err) {
      toast.error("Erro ao atualizar status do template.");
    }
  };

  // Open Visual Builder
  const handleOpenBuilder = (template: EmailTemplate) => {
    setEditingTemplate(JSON.parse(JSON.stringify(template)));
    setSelectedBlockId(template.blocks[0]?.id || null);
    setBuilderTab("blocks");
    setViewMode("builder");
  };

  // Save changes from Visual Builder
  const handleSaveBuilderChanges = async () => {
    if (!editingTemplate) return;
    setIsSaving(true);
    try {
      const updated = await EmailTemplateService.updateTemplate(editingTemplate.id, {
        name: editingTemplate.name,
        subject: editingTemplate.subject,
        blocks: editingTemplate.blocks,
        active: editingTemplate.active,
      });

      setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      toast.success("Template salvo com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar template:", err);
      toast.error("Erro ao salvar alterações do template.");
    } finally {
      setIsSaving(false);
    }
  };

  // Block Editing Helpers
  const handleAddBlock = (type: EmailBlockType) => {
    if (!editingTemplate) return;
    const newBlock: EmailBlock = {
      id: `block-${Date.now()}`,
      type,
      content:
        type === "heading"
          ? "Novo Título Personalizado"
          : type === "text"
            ? "Digite seu texto personalizado aqui com variáveis como {cliente.nome}."
            : type === "button"
              ? "Clique Aqui"
              : undefined,
      fontSize: type === "heading" ? 22 : type === "text" ? 14 : 14,
      textColor: type === "heading" ? "#ffffff" : "#f4f4f5",
      bgColor: type === "button" ? "#eab308" : undefined,
      align: "center",
    };

    setEditingTemplate((prev) =>
      prev ? { ...prev, blocks: [...prev.blocks, newBlock] } : prev
    );
    setSelectedBlockId(newBlock.id);
    setBuilderTab("inspector");
    toast.success("Novo bloco adicionado!");
  };

  const handleMoveBlock = (index: number, direction: "up" | "down") => {
    if (!editingTemplate) return;
    const newBlocks = [...editingTemplate.blocks];
    const targetIdx = direction === "up" ? index - 1 : index + 1;

    if (targetIdx < 0 || targetIdx >= newBlocks.length) return;

    const temp = newBlocks[index]!;
    newBlocks[index] = newBlocks[targetIdx]!;
    newBlocks[targetIdx] = temp;

    setEditingTemplate((prev) => (prev ? { ...prev, blocks: newBlocks } : prev));
  };

  const handleDeleteBlock = (blockId: string) => {
    if (!editingTemplate) return;
    if (editingTemplate.blocks.length <= 1) {
      toast.error("O template precisa ter pelo menos 1 bloco.");
      return;
    }

    const filtered = editingTemplate.blocks.filter((b) => b.id !== blockId);
    setEditingTemplate((prev) => (prev ? { ...prev, blocks: filtered } : prev));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(filtered[0]?.id || null);
    }
    toast.success("Bloco removido.");
  };

  const handleUpdateSelectedBlock = (patch: Partial<EmailBlock>) => {
    if (!editingTemplate || !selectedBlockId) return;
    setEditingTemplate((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        blocks: prev.blocks.map((b) => (b.id === selectedBlockId ? { ...b, ...patch } : b)),
      };
    });
  };

  // Insert Variable Chip into active block text/heading
  const handleInsertVariable = (variableKey: string) => {
    if (!editingTemplate || !selectedBlockId) {
      toast.info("Selecione um bloco de Texto, Título ou Botão para inserir a variável.");
      return;
    }

    const block = editingTemplate.blocks.find((b) => b.id === selectedBlockId);
    if (!block || (block.type !== "heading" && block.type !== "text" && block.type !== "button")) {
      toast.info("Selecione um bloco de Texto ou Título para inserir a variável.");
      return;
    }

    const currentContent = block.content || "";
    handleUpdateSelectedBlock({ content: `${currentContent} ${variableKey}` });
    toast.success(`Variável ${variableKey} inserida no bloco!`);
  };

  // Open Test Modal
  const handleOpenTestModal = (template: EmailTemplate) => {
    setTargetTemplateForTest(template);
    setIsTestModalOpen(true);
  };

  // Send Test Email via Resend API
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const templateToUse = targetTemplateForTest || editingTemplate;
    if (!templateToUse) return;

    if (!testRecipient.trim()) {
      toast.error("Informe um e-mail de destino válido.");
      return;
    }

    setIsSendingTest(true);
    try {
      const compiledHtml = EmailTemplateService.compileBlocksToHtml(templateToUse.blocks);
      const res = await EmailService.sendEmail({
        to: testRecipient.trim(),
        subject: templateToUse.subject.replace(/\{pedido\.codigo\}/g, "APS-849201"),
        html: compiledHtml,
      });

      if (res.success) {
        toast.success(
          `E-mail de teste disparado com sucesso para ${testRecipient}! (Resend ID: ${res.id})`
        );
        setIsTestModalOpen(false);
      } else {
        toast.error(res.errorMessage || "Erro ao enviar e-mail via API do Resend.");
      }
    } catch (err) {
      console.error("Erro no teste de e-mail:", err);
      toast.error("Erro ao enviar e-mail de teste.");
    } finally {
      setIsSendingTest(false);
    }
  };

  // Filtered Templates for Catalog
  const filteredTemplates = useMemo(() => {
    if (selectedCategory === "all") return templates;
    return templates.filter((t) => t.category === selectedCategory);
  }, [templates, selectedCategory]);

  const activeCount = useMemo(() => templates.filter((t) => t.active).length, [templates]);

  const selectedBlock = useMemo(() => {
    if (!editingTemplate || !selectedBlockId) return null;
    return editingTemplate.blocks.find((b) => b.id === selectedBlockId) || null;
  }, [editingTemplate, selectedBlockId]);

  const liveHtmlOutput = useMemo(() => {
    if (!editingTemplate) return "";
    return EmailTemplateService.compileBlocksToHtml(editingTemplate.blocks);
  }, [editingTemplate]);

  return (
    <AdminLayout>
      {viewMode === "catalog" ? (
        /* CATALOG VIEW */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-caption font-extrabold text-brand uppercase tracking-wider">
                <Mail className="size-4" /> Comunicação Transacional & Automação
              </div>
              <h1 className="text-h2 font-black text-foreground tracking-tight">
                Gerenciador de E-mails Transacionais
              </h1>
              <p className="text-small text-muted-foreground">
                Construtor visual de e-mails, catálogo de templates do e-commerce e testes via API Resend.
              </p>
            </div>

            {/* Resend Status Badge */}
            <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-caption font-extrabold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-4" /> Resend API Ativa (apertastart.com.br)
            </div>
          </div>

          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-caption font-extrabold text-muted-foreground uppercase">Templates Ativos</span>
                <p className="text-h2 font-black text-foreground mt-0.5">{activeCount} / {templates.length}</p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="size-6" />
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-caption font-extrabold text-muted-foreground uppercase">Remetente Oficial</span>
                <p className="text-small font-black text-foreground mt-1">contato@apertastart.com.br</p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <Mail className="size-6" />
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-caption font-extrabold text-muted-foreground uppercase">Motor de Renderização</span>
                <p className="text-small font-black text-foreground mt-1">HTML Bulletproof Responsivo</p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500">
                <Layout className="size-6" />
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="rounded-3xl border border-border bg-surface p-2 shadow-xs flex items-center gap-2 overflow-x-auto">
            {[
              { id: "all", label: "Todos os Templates" },
              { id: "pedidos", label: "📦 Pedidos" },
              { id: "pagamentos", label: "💳 Pagamentos" },
              { id: "logistica", label: "🚚 Logística & Rastreio" },
              { id: "clientes", label: "👤 Clientes & Conta" },
              { id: "marketing", label: "🎁 Marketing & Ofertas" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "rounded-2xl px-4 py-2.5 text-small font-extrabold transition-all cursor-pointer whitespace-nowrap",
                  selectedCategory === cat.id
                    ? "bg-brand text-brand-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Catalog Grid */}
          {isLoading ? (
            <div className="flex py-12 justify-center">
              <Loader2 className="size-8 animate-spin text-brand" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="rounded-3xl border border-border bg-surface p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-brand/50 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-caption font-extrabold text-brand uppercase tracking-wider">
                          {template.category}
                        </span>
                        <h3 className="text-h3 font-black text-foreground mt-0.5">{template.name}</h3>
                      </div>

                      {/* Active Toggle */}
                      <button
                        onClick={() => handleToggleActive(template)}
                        className={cn(
                          "rounded-full px-3 py-1 text-caption font-black transition-all cursor-pointer shrink-0",
                          template.active
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                            : "bg-muted text-muted-foreground border border-border"
                        )}
                      >
                        {template.active ? "● Ativo" : "○ Inativo"}
                      </button>
                    </div>

                    <p className="text-small text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>

                    <div className="rounded-2xl border border-border bg-background p-3 text-caption font-bold text-foreground">
                      <span className="text-muted-foreground font-normal">Assunto: </span>
                      {template.subject}
                    </div>
                  </div>

                  {/* Template Actions */}
                  <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenTestModal(template)}
                      className="inline-flex items-center gap-1.5 rounded-2xl border border-input bg-background px-3.5 py-2 text-caption font-extrabold text-foreground hover:bg-muted transition-all cursor-pointer"
                    >
                      <Send className="size-3.5 text-brand" /> Testar Envio
                    </button>

                    <button
                      onClick={() => handleOpenBuilder(template)}
                      className="inline-flex items-center gap-1.5 rounded-2xl bg-brand px-4 py-2 text-caption font-extrabold text-brand-foreground shadow-xs hover:brightness-105 transition-all cursor-pointer"
                    >
                      <Layout className="size-3.5" /> Editar no Construtor Visual
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* VISUAL BUILDER SPLIT VIEW */
        editingTemplate && (
          <div className="space-y-4">
            {/* Top Bar Header */}
            <div className="rounded-3xl border border-border bg-surface p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode("catalog")}
                  className="flex size-10 items-center justify-center rounded-2xl border border-border bg-background text-foreground hover:bg-muted transition-all cursor-pointer shrink-0"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <div>
                  <span className="text-caption font-extrabold text-brand uppercase tracking-wider">
                    Construtor Visual de E-mails
                  </span>
                  <input
                    type="text"
                    value={editingTemplate.name}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, name: e.target.value })
                    }
                    className="text-h3 font-black text-foreground bg-transparent border-none focus:outline-none w-full"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Device Switcher */}
                <div className="flex items-center gap-1 rounded-2xl border border-border bg-background p-1">
                  <button
                    onClick={() => setDevicePreview("desktop")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-caption font-extrabold transition-all cursor-pointer",
                      devicePreview === "desktop"
                        ? "bg-brand text-brand-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Laptop className="size-3.5" /> Desktop (600px)
                  </button>
                  <button
                    onClick={() => setDevicePreview("mobile")}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-caption font-extrabold transition-all cursor-pointer",
                      devicePreview === "mobile"
                        ? "bg-brand text-brand-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Smartphone className="size-3.5" /> Mobile (375px)
                  </button>
                </div>

                <button
                  onClick={() => handleOpenTestModal(editingTemplate)}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-input bg-background px-4 py-2 text-small font-extrabold text-foreground hover:bg-muted transition-all cursor-pointer"
                >
                  <Send className="size-4 text-brand" /> Testar Envio
                </button>

                <button
                  onClick={handleSaveBuilderChanges}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-brand px-5 py-2 text-small font-extrabold text-brand-foreground shadow-xs hover:brightness-105 transition-all cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="size-4" /> Salvar Template
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Subject Line Bar */}
            <div className="rounded-2xl border border-border bg-surface p-3 shadow-xs flex items-center gap-3">
              <span className="text-caption font-extrabold text-muted-foreground uppercase shrink-0">
                Assunto do E-mail:
              </span>
              <input
                type="text"
                value={editingTemplate.subject}
                onChange={(e) =>
                  setEditingTemplate({ ...editingTemplate, subject: e.target.value })
                }
                className="w-full bg-background border border-input rounded-xl px-3 py-1.5 text-small text-foreground font-semibold focus:outline-none focus:border-ring"
              />
            </div>

            {/* Main Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Sidebar Tools (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Tabs Header */}
                <div className="rounded-2xl border border-border bg-surface p-1.5 shadow-xs grid grid-cols-3 gap-1">
                  <button
                    onClick={() => setBuilderTab("blocks")}
                    className={cn(
                      "rounded-xl py-2 text-caption font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                      builderTab === "blocks"
                        ? "bg-brand text-brand-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Layout className="size-3.5" /> Blocos
                  </button>
                  <button
                    onClick={() => setBuilderTab("inspector")}
                    className={cn(
                      "rounded-xl py-2 text-caption font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                      builderTab === "inspector"
                        ? "bg-brand text-brand-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Sliders className="size-3.5" /> Estilos
                  </button>
                  <button
                    onClick={() => setBuilderTab("vars")}
                    className={cn(
                      "rounded-xl py-2 text-caption font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                      builderTab === "vars"
                        ? "bg-brand text-brand-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Code className="size-3.5" /> Variáveis
                  </button>
                </div>

                {/* Tab 1: Blocks Palette & Reordering */}
                {builderTab === "blocks" && (
                  <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs space-y-5">
                    <div>
                      <h4 className="text-small font-black text-foreground uppercase tracking-wider mb-2">
                        Adicionar Novo Bloco
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { type: "heading", label: "🔤 Título" },
                          { type: "text", label: "📝 Texto" },
                          { type: "button", label: "🔘 Botão CTA" },
                          { type: "image", label: "📷 Imagem" },
                          { type: "products_table", label: "🛒 Tabela Produtos" },
                          { type: "order_summary", label: "💵 Resumo Total" },
                          { type: "payment_info", label: "💳 Pagamento" },
                          { type: "shipping_info", label: "🚚 Endereço/Rastreio" },
                          { type: "social_links", label: "📱 Redes Sociais" },
                          { type: "divider", label: "➖ Linha Divisória" },
                          { type: "spacer", label: "📐 Espaçador" },
                        ].map((btn) => (
                          <button
                            key={btn.type}
                            onClick={() => handleAddBlock(btn.type as EmailBlockType)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background p-2.5 text-caption font-bold text-foreground hover:bg-muted hover:border-brand transition-all cursor-pointer text-left"
                          >
                            <Plus className="size-3.5 text-brand" /> {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <h4 className="text-small font-black text-foreground uppercase tracking-wider mb-2">
                        Estrutura Atual de Blocos ({editingTemplate.blocks.length})
                      </h4>
                      <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                        {editingTemplate.blocks.map((block, idx) => (
                          <div
                            key={block.id}
                            onClick={() => setSelectedBlockId(block.id)}
                            className={cn(
                              "rounded-2xl border p-3 flex items-center justify-between gap-2 transition-all cursor-pointer",
                              selectedBlockId === block.id
                                ? "border-brand bg-brand/10"
                                : "border-border bg-background hover:bg-muted"
                            )}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-caption font-black text-brand">
                                #{idx + 1}
                              </span>
                              <span className="text-caption font-bold text-foreground capitalize truncate">
                                {block.type.replace("_", " ")}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveBlock(idx, "up");
                                }}
                                disabled={idx === 0}
                                className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp className="size-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveBlock(idx, "down");
                                }}
                                disabled={idx === editingTemplate.blocks.length - 1}
                                className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="size-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteBlock(block.id);
                                }}
                                className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Property Inspector for Selected Block */}
                {builderTab === "inspector" && (
                  <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs space-y-4">
                    {selectedBlock ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                          <span className="text-caption font-extrabold text-brand uppercase">
                            Editando Bloco: {selectedBlock.type}
                          </span>
                        </div>

                        {/* Content text */}
                        {(selectedBlock.type === "heading" ||
                          selectedBlock.type === "text" ||
                          selectedBlock.type === "button") && (
                          <div className="space-y-1.5">
                            <label className="text-caption font-bold text-muted-foreground">
                              Conteúdo do Texto:
                            </label>
                            <textarea
                              rows={4}
                              value={selectedBlock.content || ""}
                              onChange={(e) =>
                                handleUpdateSelectedBlock({ content: e.target.value })
                              }
                              className="w-full rounded-2xl border border-input bg-background p-3 text-small text-foreground focus:outline-none focus:border-ring"
                            />
                          </div>
                        )}

                        {/* Button URL */}
                        {selectedBlock.type === "button" && (
                          <div className="space-y-1.5">
                            <label className="text-caption font-bold text-muted-foreground">
                              URL do Link do Botão:
                            </label>
                            <input
                              type="text"
                              value={selectedBlock.buttonUrl || ""}
                              onChange={(e) =>
                                handleUpdateSelectedBlock({ buttonUrl: e.target.value })
                              }
                              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-small text-foreground focus:outline-none"
                            />
                          </div>
                        )}

                        {/* Alignment */}
                        <div className="space-y-1.5">
                          <label className="text-caption font-bold text-muted-foreground">
                            Alinhamento:
                          </label>
                          <div className="flex items-center gap-2">
                            {[
                              { id: "left", icon: AlignLeft, label: "Esquerda" },
                              { id: "center", icon: AlignCenter, label: "Centro" },
                              { id: "right", icon: AlignRight, label: "Direita" },
                            ].map((item) => {
                              const IconComponent = item.icon;
                              return (
                                <button
                                  key={item.id}
                                  onClick={() =>
                                    handleUpdateSelectedBlock({
                                      align: item.id as "left" | "center" | "right",
                                    })
                                  }
                                  className={cn(
                                    "flex-1 flex items-center justify-center gap-1.5 rounded-xl border p-2 text-caption font-bold cursor-pointer transition-all",
                                    selectedBlock.align === item.id
                                      ? "border-brand bg-brand/10 text-brand"
                                      : "border-border bg-background text-muted-foreground"
                                  )}
                                >
                                  <IconComponent className="size-3.5" /> {item.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Text Color */}
                        <div className="space-y-1.5">
                          <label className="text-caption font-bold text-muted-foreground">
                            Cor do Texto:
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={selectedBlock.textColor || "#ffffff"}
                              onChange={(e) =>
                                handleUpdateSelectedBlock({ textColor: e.target.value })
                              }
                              className="size-8 rounded-lg border border-border cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={selectedBlock.textColor || "#ffffff"}
                              onChange={(e) =>
                                handleUpdateSelectedBlock({ textColor: e.target.value })
                              }
                              className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-small text-foreground font-mono"
                            />
                          </div>
                        </div>

                        {/* Font Size */}
                        <div className="space-y-1.5">
                          <label className="text-caption font-bold text-muted-foreground">
                            Tamanho da Fonte: {selectedBlock.fontSize || 14}px
                          </label>
                          <input
                            type="range"
                            min={12}
                            max={32}
                            value={selectedBlock.fontSize || 14}
                            onChange={(e) =>
                              handleUpdateSelectedBlock({
                                fontSize: parseInt(e.target.value, 10),
                              })
                            }
                            className="w-full accent-brand cursor-pointer"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-small text-muted-foreground text-center py-6">
                        Selecione um bloco para inspecionar e personalizar seus estilos.
                      </p>
                    )}
                  </div>
                )}

                {/* Tab 3: Dynamic Variables Chips Toolbar */}
                {builderTab === "vars" && (
                  <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <span className="text-caption font-extrabold text-brand uppercase">
                        Inserir Variáveis Dinâmicas
                      </span>
                      <Info className="size-4 text-muted-foreground" />
                    </div>

                    <p className="text-caption text-muted-foreground">
                      Clique em qualquer variável abaixo para inseri-la instantaneamente no bloco de texto atualmente selecionado:
                    </p>

                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                      {["Cliente", "Pedido", "Pagamento", "Entrega", "Loja"].map((catName) => (
                        <div key={catName} className="space-y-1.5">
                          <span className="text-caption font-black text-brand uppercase">
                            {catName}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {emailVariablesList
                              .filter((v) => v.category === catName)
                              .map((v) => (
                                <button
                                  key={v.key}
                                  onClick={() => handleInsertVariable(v.key)}
                                  className="rounded-xl border border-border bg-background px-2.5 py-1 text-caption font-semibold text-foreground hover:border-brand hover:bg-brand/10 transition-all cursor-pointer"
                                >
                                  {v.label} <code className="text-brand font-mono text-[11px]">{v.key}</code>
                                </button>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Live Responsive Canvas (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between text-caption font-extrabold text-muted-foreground uppercase">
                  <span>Pré-Visualização em Tempo Real</span>
                  <span>Modo: {devicePreview === "desktop" ? "Desktop (600px)" : "Mobile (375px)"}</span>
                </div>

                {/* Canvas Container */}
                <div className="rounded-3xl border border-border bg-slate-950 p-6 flex justify-center min-h-[600px] shadow-2xl overflow-x-auto">
                  <div
                    className={cn(
                      "transition-all duration-300 w-full",
                      devicePreview === "mobile" ? "max-w-[375px]" : "max-w-[600px]"
                    )}
                  >
                    {/* Rendered HTML inside Frame */}
                    <div
                      className="bg-[#18181b] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl"
                      dangerouslySetInnerHTML={{ __html: liveHtmlOutput }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Test Email Dispatch Modal */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-small font-black text-foreground">
                <Send className="size-4 text-brand" /> Disparar E-mail de Teste via Resend
              </div>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="text-muted-foreground hover:text-foreground font-extrabold text-small cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendTestEmail} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-caption font-bold text-muted-foreground">
                  Template Selecionado:
                </label>
                <p className="text-small font-black text-brand">
                  {targetTemplateForTest?.name || editingTemplate?.name}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-caption font-bold text-muted-foreground">
                  E-mail de Destino para Teste:
                </label>
                <input
                  type="email"
                  required
                  placeholder="Seu e-mail..."
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  className="w-full rounded-2xl border border-input bg-background p-3 text-small text-foreground focus:outline-none focus:border-ring"
                />
              </div>

              <div className="rounded-2xl bg-muted/50 p-3 text-caption text-muted-foreground">
                O e-mail será disparado usando o servidor oficial do Resend da loja Aperta Start.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="rounded-2xl border border-input bg-background px-4 py-2 text-small font-bold text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSendingTest}
                  className="inline-flex items-center gap-2 rounded-2xl bg-brand px-5 py-2 text-small font-extrabold text-brand-foreground shadow-xs hover:brightness-105 transition-all cursor-pointer"
                >
                  {isSendingTest ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Disparando...
                    </>
                  ) : (
                    <>
                      <Send className="size-4" /> Disparar Agora
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
