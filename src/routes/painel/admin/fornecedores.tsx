import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Building2,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  Package,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronRight,
  UserCheck,
  FileText,
  Tag,
  DollarSign,
  Boxes,
} from "lucide-react";
import { AdminLayout } from "@/components/admin";
import { SupplierService } from "@/services/supplier.service";
import type { Supplier, SupplierStatus, Product } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel/admin/fornecedores")({
  head: () => ({
    meta: [{ title: "Fornecedores — Painel Aperta Start" }],
  }),
  component: FornecedoresPage,
});

const statusLabels: Record<SupplierStatus, { label: string; style: string }> = {
  active: { label: "Ativo", style: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" },
  inactive: { label: "Inativo", style: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
  suspended: { label: "Suspenso", style: "bg-red-500/10 text-red-500 border-red-500/30" },
};

function FornecedoresPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Supplier Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Supplier Details Drawer
  const [selectedDrawerSupplier, setSelectedDrawerSupplier] = useState<Supplier | null>(null);
  const [supplierProducts, setSupplierProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    cpfCnpj: "",
    contactName: "",
    email: "",
    phone: "",
    whatsapp: "",
    productCategories: "",
    leadTimeDays: 3,
    status: "active" as SupplierStatus,
    notes: "",
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setIsLoading(true);
    try {
      const data = await SupplierService.listAll();
      setSuppliers(data);
    } catch (err) {
      console.error("Erro ao carregar fornecedores:", err);
      toast.error("Erro ao carregar lista de fornecedores.");
    } finally {
      setIsLoading(false);
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: "",
      companyName: "",
      cpfCnpj: "",
      contactName: "",
      email: "",
      phone: "",
      whatsapp: "",
      productCategories: "Impressão 3D, Suportes Gamer",
      leadTimeDays: 3,
      status: "active",
      notes: "",
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      companyName: supplier.companyName || "",
      cpfCnpj: supplier.cpfCnpj || "",
      contactName: supplier.contactName || "",
      email: supplier.email,
      phone: supplier.phone || "",
      whatsapp: supplier.whatsapp || "",
      productCategories: (supplier.productCategories || []).join(", "),
      leadTimeDays: supplier.leadTimeDays || 3,
      status: supplier.status,
      notes: supplier.notes || "",
    });
    setIsModalOpen(true);
  };

  // Save Supplier (Create or Edit)
  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Informe o Nome Fantasia do fornecedor.");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Informe o e-mail do fornecedor.");
      return;
    }

    const categoriesArray = formData.productCategories
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    setIsSaving(true);
    try {
      if (editingSupplier) {
        const updated = await SupplierService.update(editingSupplier.id, {
          name: formData.name.trim(),
          companyName: formData.companyName.trim() || undefined,
          cpfCnpj: formData.cpfCnpj.trim() || undefined,
          contactName: formData.contactName.trim() || undefined,
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          whatsapp: formData.whatsapp.replace(/\D/g, "") || undefined,
          productCategories: categoriesArray,
          leadTimeDays: Number(formData.leadTimeDays) || 3,
          status: formData.status,
          notes: formData.notes.trim() || undefined,
        });

        setSuppliers((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        toast.success("Fornecedor atualizado com sucesso!");
      } else {
        const created = await SupplierService.create({
          name: formData.name.trim(),
          companyName: formData.companyName.trim() || undefined,
          cpfCnpj: formData.cpfCnpj.trim() || undefined,
          contactName: formData.contactName.trim() || undefined,
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          whatsapp: formData.whatsapp.replace(/\D/g, "") || undefined,
          productCategories: categoriesArray,
          leadTimeDays: Number(formData.leadTimeDays) || 3,
          status: formData.status,
          notes: formData.notes.trim() || undefined,
        });

        setSuppliers((prev) => [created, ...prev]);
        toast.success("Novo fornecedor cadastrado com sucesso!");
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("Erro ao salvar fornecedor:", err);
      toast.error("Erro ao salvar dados do fornecedor.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Supplier
  const handleDeleteSupplier = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o fornecedor "${name}"?`)) return;

    try {
      await SupplierService.delete(id);
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      toast.success("Fornecedor removido com sucesso.");
      if (selectedDrawerSupplier?.id === id) {
        setSelectedDrawerSupplier(null);
      }
    } catch (err) {
      toast.error("Erro ao excluir fornecedor.");
    }
  };

  // Open Drawer Details
  const handleOpenDrawer = async (supplier: Supplier) => {
    setSelectedDrawerSupplier(supplier);
    setIsLoadingProducts(true);
    try {
      const products = await SupplierService.getSupplierProducts(supplier.id);
      setSupplierProducts(products);
    } catch (err) {
      console.error("Erro ao buscar produtos do fornecedor:", err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const matchesSearch =
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (supplier.companyName &&
          supplier.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (supplier.cpfCnpj && supplier.cpfCnpj.includes(searchQuery)) ||
        supplier.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === "all" ? true : supplier.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchQuery, selectedStatus]);

  // Metrics
  const activeCount = useMemo(() => suppliers.filter((s) => s.status === "active").length, [suppliers]);
  const avgLeadTime = useMemo(() => {
    if (suppliers.length === 0) return 0;
    const total = suppliers.reduce((acc, s) => acc + (s.leadTimeDays || 3), 0);
    return Math.round(total / suppliers.length);
  }, [suppliers]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-caption font-extrabold text-brand uppercase tracking-wider">
              <Building2 className="size-4" /> Gestão de Parceiros & Fornecedores
            </div>
            <h1 className="text-h2 font-black text-foreground tracking-tight">Fornecedores</h1>
            <p className="text-small text-muted-foreground">
              Cadastre, gerencie contatos e visualize os produtos vinculados a cada fornecedor da Aperta Start.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 shrink-0 rounded-2xl bg-brand px-5 py-2.5 text-small font-extrabold text-brand-foreground shadow-xs hover:brightness-105 transition-all cursor-pointer"
          >
            <Plus className="size-4" /> Cadastrar Novo Fornecedor
          </button>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-caption font-extrabold text-muted-foreground uppercase">Fornecedores Ativos</span>
              <p className="text-h2 font-black text-foreground mt-0.5">{activeCount} / {suppliers.length}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Building2 className="size-6" />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-caption font-extrabold text-muted-foreground uppercase">Prazo Médio Geral</span>
              <p className="text-h2 font-black text-foreground mt-0.5">{avgLeadTime} dias</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Clock className="size-6" />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-caption font-extrabold text-muted-foreground uppercase">Gestão de Suprimentos</span>
              <p className="text-small font-black text-foreground mt-1">Multi-Categorias Gamer</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500">
              <Boxes className="size-6" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="rounded-3xl border border-border bg-surface p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome, razão social, CNPJ ou e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-input bg-background pl-10 pr-4 py-2 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              { id: "all", label: "Todos os Status" },
              { id: "active", label: "● Ativos" },
              { id: "inactive", label: "○ Inativos" },
              { id: "suspended", label: "✕ Suspensos" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={cn(
                  "rounded-2xl px-3.5 py-1.5 text-caption font-extrabold transition-all cursor-pointer whitespace-nowrap",
                  selectedStatus === tab.id
                    ? "bg-brand text-brand-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Suppliers Table */}
        <div className="rounded-3xl border border-border bg-surface shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="flex py-12 justify-center">
              <Loader2 className="size-8 animate-spin text-brand" />
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground space-y-2">
              <Building2 className="size-10 mx-auto opacity-40 text-brand" />
              <p className="text-small font-bold">Nenhum fornecedor encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-small">
                <thead className="bg-muted/50 text-caption font-extrabold text-muted-foreground uppercase border-b border-border">
                  <tr>
                    <th className="px-6 py-4">Fornecedor / Razão Social</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Contato Comercial</th>
                    <th className="px-6 py-4">WhatsApp 1-Clique</th>
                    <th className="px-6 py-4 text-center">Prazo Médio</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSuppliers.map((supplier) => {
                    const statusObj = statusLabels[supplier.status];
                    const cleanPhone = (supplier.whatsapp || supplier.phone || "").replace(/\D/g, "");

                    return (
                      <tr key={supplier.id} className="hover:bg-muted/30 transition-colors">
                        {/* Name & Company */}
                        <td className="px-6 py-4">
                          <div className="font-extrabold text-foreground text-small">
                            {supplier.name}
                          </div>
                          {supplier.companyName && (
                            <div className="text-caption text-muted-foreground font-medium">
                              {supplier.companyName}
                            </div>
                          )}
                          {supplier.cpfCnpj && (
                            <div className="text-caption font-mono text-muted-foreground/70">
                              CNPJ/CPF: {supplier.cpfCnpj}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-caption font-extrabold",
                              statusObj.style
                            )}
                          >
                            {statusObj.label}
                          </span>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-foreground">
                            {supplier.contactName || "Comercial"}
                          </div>
                          <div className="text-caption text-muted-foreground flex items-center gap-1">
                            <Mail className="size-3 text-muted-foreground" /> {supplier.email}
                          </div>
                        </td>

                        {/* WhatsApp Button */}
                        <td className="px-6 py-4">
                          {cleanPhone ? (
                            <a
                              href={`https://wa.me/55${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-caption font-black text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all"
                            >
                              <MessageCircle className="size-3.5" /> Conversar no Whats
                            </a>
                          ) : (
                            <span className="text-caption text-muted-foreground">—</span>
                          )}
                        </td>

                        {/* Lead Time */}
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 rounded-2xl bg-muted px-2.5 py-1 text-caption font-black text-foreground">
                            <Clock className="size-3 text-brand" /> {supplier.leadTimeDays || 3} dias
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenDrawer(supplier)}
                              title="Visualizar Ficha e Produtos"
                              className="p-2 rounded-xl text-muted-foreground hover:text-brand hover:bg-brand/10 transition-colors cursor-pointer"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(supplier)}
                              title="Editar Fornecedor"
                              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                            >
                              <Edit className="size-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}
                              title="Excluir Fornecedor"
                              className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
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

      {/* CREATE / EDIT SUPPLIER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-surface p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-small font-black text-foreground">
                <Building2 className="size-5 text-brand" />
                {editingSupplier ? "Editar Fornecedor" : "Cadastrar Novo Fornecedor"}
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground font-extrabold text-small cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-4">
              {/* Seção 1: Identificação */}
              <div className="space-y-3">
                <span className="text-caption font-extrabold text-brand uppercase tracking-wider">
                  1. Identificação do Fornecedor
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-caption font-bold text-muted-foreground">
                      Nome Fantasia / Nome do Fornecedor *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Hero 3D Studio"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background p-2.5 text-small text-foreground focus:outline-none focus:border-ring"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-caption font-bold text-muted-foreground">
                      Razão Social
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Hero Impressão 3D LTDA"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background p-2.5 text-small text-foreground focus:outline-none focus:border-ring"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-caption font-bold text-muted-foreground">
                      CNPJ / CPF
                    </label>
                    <input
                      type="text"
                      placeholder="00.000.000/0001-00"
                      value={formData.cpfCnpj}
                      onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background p-2.5 text-small text-foreground focus:outline-none focus:border-ring font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-caption font-bold text-muted-foreground">
                      Status do Fornecedor
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as SupplierStatus })
                      }
                      className="w-full rounded-2xl border border-input bg-background p-2.5 text-small text-foreground focus:outline-none focus:border-ring cursor-pointer"
                    >
                      <option value="active">● Ativo (Atende pedidos normalmente)</option>
                      <option value="inactive">○ Inativo (Desativado temporariamente)</option>
                      <option value="suspended">✕ Suspenso (Com restrições)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Seção 2: Contatos */}
              <div className="space-y-3 pt-2 border-t border-border">
                <span className="text-caption font-extrabold text-brand uppercase tracking-wider">
                  2. Contatos Comercial & Atendimento
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-caption font-bold text-muted-foreground">
                      Nome do Contato Comercial
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Lucas Mendonça"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background p-2.5 text-small text-foreground focus:outline-none focus:border-ring"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-caption font-bold text-muted-foreground">
                      E-mail Comercial *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="contato@fornecedor.com.br"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background p-2.5 text-small text-foreground focus:outline-none focus:border-ring"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-caption font-bold text-muted-foreground">
                      Telefone Comercial
                    </label>
                    <input
                      type="text"
                      placeholder="(11) 3456-7890"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background p-2.5 text-small text-foreground focus:outline-none focus:border-ring"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-caption font-bold text-muted-foreground">
                      WhatsApp de Pedidos (Apenas Números)
                    </label>
                    <input
                      type="text"
                      placeholder="11987654321"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background p-2.5 text-small text-foreground focus:outline-none focus:border-ring font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 3: Operações */}
              <div className="space-y-3 pt-2 border-t border-border">
                <span className="text-caption font-extrabold text-brand uppercase tracking-wider">
                  3. Condições Operacionais
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-caption font-bold text-muted-foreground">
                      Categorias de Produtos (Separadas por vírgula)
                    </label>
                    <input
                      type="text"
                      placeholder="Impressão 3D, Suportes Gamer, Acessórios"
                      value={formData.productCategories}
                      onChange={(e) => setFormData({ ...formData, productCategories: e.target.value })}
                      className="w-full rounded-2xl border border-input bg-background p-2.5 text-small text-foreground focus:outline-none focus:border-ring"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-caption font-bold text-muted-foreground">
                      Prazo Médio de Entrega (em dias)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={formData.leadTimeDays}
                      onChange={(e) => setFormData({ ...formData, leadTimeDays: parseInt(e.target.value, 10) })}
                      className="w-full rounded-2xl border border-input bg-background p-2.5 text-small text-foreground focus:outline-none focus:border-ring"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 4: Observações */}
              <div className="space-y-1 pt-2 border-t border-border">
                <label className="text-caption font-bold text-muted-foreground">
                  Observações Internas (Privadas)
                </label>
                <textarea
                  rows={3}
                  placeholder="Anotações internas sobre termos de pagamento, acordos de margem ou qualidade da entrega..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-2xl border border-input bg-background p-3 text-small text-foreground focus:outline-none focus:border-ring"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-2xl border border-input bg-background px-4 py-2 text-small font-bold text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-brand px-5 py-2 text-small font-extrabold text-brand-foreground shadow-xs hover:brightness-105 transition-all cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Salvando...
                    </>
                  ) : (
                    <>
                      <Building2 className="size-4" /> {editingSupplier ? "Salvar Alterações" : "Cadastrar Fornecedor"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPPLIER DETAILS DRAWER */}
      {selectedDrawerSupplier && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-surface border-l border-border h-full overflow-y-auto p-6 space-y-6 shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                  <Building2 className="size-6" />
                </div>
                <div>
                  <h2 className="text-h3 font-black text-foreground">
                    {selectedDrawerSupplier.name}
                  </h2>
                  {selectedDrawerSupplier.companyName && (
                    <p className="text-caption text-muted-foreground">
                      {selectedDrawerSupplier.companyName}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedDrawerSupplier(null)}
                className="text-muted-foreground hover:text-foreground font-black text-small cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {selectedDrawerSupplier.whatsapp && (
                <a
                  href={`https://wa.me/55${selectedDrawerSupplier.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-small font-extrabold text-white shadow-xs hover:brightness-105 transition-all"
                >
                  <MessageCircle className="size-4" /> Abrir no WhatsApp
                </a>
              )}
              <a
                href={`mailto:${selectedDrawerSupplier.email}`}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-input bg-background px-4 py-2.5 text-small font-extrabold text-foreground hover:bg-muted transition-all"
              >
                <Mail className="size-4 text-brand" /> Enviar E-mail
              </a>
            </div>

            {/* Supplier Details Card */}
            <div className="rounded-3xl border border-border bg-background p-5 space-y-3">
              <span className="text-caption font-extrabold text-brand uppercase tracking-wider">
                Ficha Técnica do Fornecedor
              </span>
              <div className="grid grid-cols-2 gap-3 text-small">
                <div>
                  <span className="text-caption text-muted-foreground block">Contato Comercial:</span>
                  <span className="font-bold text-foreground">
                    {selectedDrawerSupplier.contactName || "Não especificado"}
                  </span>
                </div>
                <div>
                  <span className="text-caption text-muted-foreground block">CNPJ / CPF:</span>
                  <span className="font-mono text-foreground font-semibold">
                    {selectedDrawerSupplier.cpfCnpj || "Não informado"}
                  </span>
                </div>
                <div>
                  <span className="text-caption text-muted-foreground block">Telefone:</span>
                  <span className="text-foreground">{selectedDrawerSupplier.phone || "—"}</span>
                </div>
                <div>
                  <span className="text-caption text-muted-foreground block">Prazo Médio:</span>
                  <span className="font-extrabold text-brand">
                    {selectedDrawerSupplier.leadTimeDays || 3} dias úteis
                  </span>
                </div>
              </div>

              {selectedDrawerSupplier.productCategories && selectedDrawerSupplier.productCategories.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <span className="text-caption text-muted-foreground block mb-1">Categorias Fornecidas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDrawerSupplier.productCategories.map((cat) => (
                      <span key={cat} className="rounded-xl border border-border bg-surface px-2.5 py-1 text-caption font-bold text-foreground">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedDrawerSupplier.notes && (
                <div className="pt-2 border-t border-border">
                  <span className="text-caption text-muted-foreground block mb-1">Observações Internas:</span>
                  <p className="text-caption text-foreground bg-surface p-3 rounded-xl border border-border">
                    {selectedDrawerSupplier.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Linked Products List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-small font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Package className="size-4 text-brand" /> Produtos Vinculados ({supplierProducts.length})
                </h3>
              </div>

              {isLoadingProducts ? (
                <div className="flex py-6 justify-center">
                  <Loader2 className="size-6 animate-spin text-brand" />
                </div>
              ) : supplierProducts.length === 0 ? (
                <p className="text-caption text-muted-foreground text-center py-6 bg-background rounded-2xl border border-border">
                  Nenhum produto cadastrado para este fornecedor ainda.
                </p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {supplierProducts.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-2xl border border-border bg-background p-3 flex items-center justify-between gap-3 hover:border-brand/50 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {product.images[0]?.url ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="size-12 rounded-xl object-cover border border-border shrink-0"
                          />
                        ) : (
                          <div className="size-12 rounded-xl bg-muted grid place-items-center shrink-0">
                            <Package className="size-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-foreground text-small truncate">{product.name}</p>
                          <p className="text-caption font-mono text-muted-foreground">SKU: {product.sku}</p>
                          <div className="flex items-center gap-2 text-caption mt-0.5">
                            <span className="text-foreground font-extrabold">{formatCurrency(product.price)}</span>
                            {product.costPrice && (
                              <span className="text-muted-foreground">
                                (Custo: {formatCurrency(product.costPrice)})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-caption font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Estoque: {product.stock} un.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
