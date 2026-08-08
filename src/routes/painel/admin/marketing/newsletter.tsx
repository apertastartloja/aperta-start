import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Send,
  Download,
  Search,
  Mail,
  Calendar,
  CheckCircle2,
  Trash2,
  Copy,
  Users,
} from "lucide-react";
import { AdminLayout } from "@/components/admin";
import { formatDate } from "@/utils/format";
import { toast } from "sonner";

export const Route = createFileRoute("/painel/admin/marketing/newsletter")({
  head: () => ({
    meta: [{ title: "Newsletter — Painel Aperta Start" }],
  }),
  component: NewsletterPage,
});

interface Subscriber {
  id: string;
  email: string;
  source: string;
  createdAt: string;
  active: boolean;
}

const initialSubscribers: Subscriber[] = [
  {
    id: "sub-1",
    email: "cristiano@exemplo.com",
    source: "Rodapé da Home",
    createdAt: "2026-08-01T14:20:00.000Z",
    active: true,
  },
  {
    id: "sub-2",
    email: "mariana.silva@email.com",
    source: "Rodapé da Home",
    createdAt: "2026-07-28T09:15:00.000Z",
    active: true,
  },
  {
    id: "sub-3",
    email: "lucas.gamer@gmail.com",
    source: "Pop-up Promocional",
    createdAt: "2026-07-15T18:40:00.000Z",
    active: true,
  },
  {
    id: "sub-4",
    email: "bea.oliveira@outlook.com",
    source: "Rodapé da Home",
    createdAt: "2026-07-02T11:05:00.000Z",
    active: true,
  },
  {
    id: "sub-5",
    email: "pedro.setup@gmail.com",
    source: "Pop-up Promocional",
    createdAt: "2026-06-20T16:30:00.000Z",
    active: true,
  },
];

function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((s) => {
      if (searchQuery.trim()) {
        return s.email.toLowerCase().includes(searchQuery.toLowerCase().trim());
      }
      return true;
    });
  }, [subscribers, searchQuery]);

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      toast.error("Não há assinantes para exportar.");
      return;
    }

    const headers = "ID,E-mail,Origem,Data de Inscrição,Status\n";
    const rows = subscribers
      .map(
        (s) =>
          `"${s.id}","${s.email}","${s.source}","${s.createdAt}","${s.active ? "Ativo" : "Inativo"}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `newsletter_assinantes_apertastart_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Arquivo CSV exportado com sucesso!");
  };

  const handleDelete = (id: string) => {
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
    toast.success("Inscrição removida da lista.");
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success(`E-mail ${email} copiado!`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-caption font-extrabold text-brand uppercase tracking-wider">
              <Send className="size-4" /> Marketing & Leads
            </div>
            <h1 className="text-h2 font-black text-foreground tracking-tight">Assinantes de Newsletter</h1>
            <p className="text-small text-muted-foreground">
              Lista de leitores e potenciais compradores inscritos para receber novidades e cupons.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-small font-extrabold text-accent-foreground shadow-medium hover:brightness-105 transition-all cursor-pointer"
          >
            <Download className="size-4.5" /> Exportar Lista para CSV
          </button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Total de Inscritos</span>
              <p className="text-h2 font-black text-foreground">{subscribers.length}</p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Users className="size-6" />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-caption font-bold text-muted-foreground uppercase">Leads Ativos</span>
              <p className="text-h2 font-black text-emerald-500">
                {subscribers.filter((s) => s.active).length}
              </p>
            </div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-6" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="rounded-3xl border border-border bg-surface p-4 shadow-xs">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por endereço de e-mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-input bg-background pl-11 pr-4 py-2.5 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-3xl border border-border bg-surface shadow-xs overflow-hidden">
          {filteredSubscribers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-small border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-caption font-extrabold uppercase text-muted-foreground tracking-wider">
                    <th className="px-6 py-4">Endereço de E-mail</th>
                    <th className="px-6 py-4">Origem do Cadastro</th>
                    <th className="px-6 py-4">Data da Inscrição</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSubscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-muted/20 transition-colors">
                      {/* Email */}
                      <td className="px-6 py-4 font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="size-4 text-brand" />
                          <span>{sub.email}</span>
                          <button
                            onClick={() => copyEmail(sub.email)}
                            title="Copiar e-mail"
                            className="text-muted-foreground hover:text-foreground p-1"
                          >
                            <Copy className="size-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Source */}
                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-background border border-border px-3 py-1 text-caption font-semibold text-muted-foreground">
                          {sub.source}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-caption text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3.5" /> {formatDate(sub.createdAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(sub.id)}
                          title="Remover e-mail"
                          className="p-2 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <Mail className="size-10 text-muted-foreground mx-auto" />
              <p className="text-small text-muted-foreground">Nenhum e-mail encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
