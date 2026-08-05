import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Package,
  User as UserIcon,
  MapPin,
  LogOut,
  ChevronRight,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuthContext } from "@/contexts/auth-context";
import { formatCurrency } from "@/utils/format";
import { toast } from "sonner";

export const Route = createFileRoute("/minha-conta")({
  head: () => ({
    meta: [
      { title: "Minha Conta & Meus Pedidos — Aperta Start" },
      { name: "description", content: "Gerencie seus pedidos, dados cadastrais e endereços de entrega na Aperta Start." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const { user, signOut, updateProfile } = useAuthContext();
  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "addresses">("orders");

  // Simulated orders
  const orders = [
    {
      id: "#APS-849201",
      date: "04 de Agosto de 2026",
      status: "Em Trânsito",
      statusColor: "text-amber-500 bg-amber-500/10 border-amber-500/30",
      trackingCode: "BR948201948SP",
      carrier: "SEDEX Express",
      total: 159.8,
      items: [
        { name: "Suporte Duplo para Controles", qty: 1, price: 69.9 },
        { name: "Luminária Bloco de Interrogação", qty: 1, price: 89.9 },
      ],
    },
    {
      id: "#APS-739102",
      date: "18 de Julho de 2026",
      status: "Entregue",
      statusColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
      trackingCode: "BR739102837SP",
      carrier: "Jadlog",
      total: 129.9,
      items: [{ name: "Action Figure Crash Bandicoot", qty: 1, price: 129.9 }],
    },
  ];

  // User form state
  const [name, setName] = useState(user?.name || "Cristiano Alves");
  const [email, setEmail] = useState(user?.email || "cristiano@exemplo.com");
  const [phone, setPhone] = useState("(11) 98765-4321");
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<typeof orders[0] | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, phone });
    toast.success("Dados cadastrais atualizados com sucesso!");
  };

  const handleSignOut = () => {
    signOut();
    toast("Sua sessão foi encerrada.");
    navigate({ to: "/" });
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center text-small text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            Início
          </Link>
          <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground/60" />
          <span className="font-medium text-foreground">Minha Conta</span>
        </nav>

        {/* User Greeting Bar */}
        <div className="mb-8 rounded-2xl border border-border bg-surface p-6 shadow-light flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-foreground font-black text-h3 shadow-sm">
              {name.charAt(0)}
            </div>
            <div>
              <h1 className="text-h3 font-extrabold text-foreground">Olá, {name}!</h1>
              <p className="text-small text-muted-foreground">{email} • Cliente desde 2026</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-small font-semibold text-muted-foreground hover:text-danger hover:border-danger/30 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sair da Conta
          </button>
        </div>

        {/* Grid Layout: Sidebar Navigation + Main Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3 space-y-2">
            <div className="rounded-2xl border border-border bg-surface p-3 shadow-light space-y-1">
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-small font-bold transition-all ${
                  activeTab === "orders"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Package className="h-5 w-5" />
                Meus Pedidos ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-small font-bold transition-all ${
                  activeTab === "profile"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <UserIcon className="h-5 w-5" />
                Meus Dados Cadastrais
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-small font-bold transition-all ${
                  activeTab === "addresses"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <MapPin className="h-5 w-5" />
                Endereços de Entrega
              </button>
            </div>
          </aside>

          {/* Tab Content */}
          <main className="lg:col-span-9 space-y-6">
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-border pb-4">
                  <h2 className="text-h3 font-bold text-foreground">Histórico de Pedidos</h2>
                  <span className="text-caption text-muted-foreground">Mostrando os últimos pedidos</span>
                </div>

                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="rounded-2xl border border-border bg-surface p-6 shadow-light space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-foreground text-h4">{order.id}</span>
                            <span className={`rounded-full border px-3 py-1 text-caption font-extrabold ${order.statusColor}`}>
                              {order.status}
                            </span>
                          </div>
                          <span className="text-caption text-muted-foreground">Realizado em {order.date}</span>
                        </div>
                        <button
                          onClick={() => setSelectedTrackingOrder(order)}
                          className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-small font-bold text-accent-foreground shadow-xs hover:brightness-105"
                        >
                          <Truck className="h-4 w-4" /> Rastrear Pedido
                        </button>
                      </div>

                      {/* Items list */}
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-small">
                            <span className="text-foreground font-medium">
                              {item.qty}x {item.name}
                            </span>
                            <span className="text-muted-foreground">{formatCurrency(item.price)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-border flex justify-between items-center text-small">
                        <span className="text-muted-foreground">Transportadora: <strong className="text-foreground">{order.carrier}</strong></span>
                        <span className="text-h4 font-extrabold text-foreground">Total: {formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-light space-y-6">
                <div className="border-b border-border pb-4">
                  <h2 className="text-h3 font-bold text-foreground">Meus Dados Cadastrais</h2>
                  <p className="text-small text-muted-foreground">Atualize seu nome, telefone e preferências de acesso.</p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
                  <div>
                    <label className="text-caption font-semibold text-foreground">Nome Completo</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-small text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-caption font-semibold text-foreground">E-mail de Cadastro</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="mt-1 w-full rounded-xl border border-input bg-muted px-4 py-2.5 text-small text-muted-foreground cursor-not-allowed"
                    />
                    <span className="text-[11px] text-muted-foreground">O e-mail não pode ser alterado por motivos de segurança.</span>
                  </div>
                  <div>
                    <label className="text-caption font-semibold text-foreground">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-small text-foreground"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-small font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all pt-3"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Salvar Alterações
                  </button>
                </form>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-border pb-4">
                  <div>
                    <h2 className="text-h3 font-bold text-foreground">Endereços de Entrega</h2>
                    <p className="text-small text-muted-foreground">Gerencie seus endereços cadastrados para checkout rápido.</p>
                  </div>
                  <button
                    onClick={() => toast.info("Formulário de novo endereço aberto.")}
                    className="rounded-xl bg-accent px-4 py-2.5 text-small font-bold text-accent-foreground shadow-xs hover:brightness-105"
                  >
                    + Novo Endereço
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border-2 border-brand bg-surface p-5 shadow-light space-y-3 relative">
                    <span className="absolute top-4 right-4 rounded-full bg-brand/10 text-brand px-3 py-1 text-caption font-extrabold">
                      Principal
                    </span>
                    <div className="flex items-center gap-2 font-bold text-foreground text-small">
                      <MapPin className="h-4 w-4 text-brand" /> Casa
                    </div>
                    <p className="text-small text-muted-foreground leading-relaxed">
                      Cristiano Alves<br />
                      Av. Paulista, 1000 — Apto 42<br />
                      Bela Vista — São Paulo / SP<br />
                      CEP: 01310-100
                    </p>
                    <div className="pt-2 flex gap-4 text-caption font-bold text-brand">
                      <button onClick={() => toast("Editar endereço")}>Editar</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Tracking Modal */}
      {selectedTrackingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-surface p-6 sm:p-8 space-y-6 shadow-large border border-border animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start border-b border-border pb-4">
              <div>
                <span className="text-caption font-bold text-brand uppercase">Rastreamento do Pedido</span>
                <h3 className="text-h3 font-black text-foreground">{selectedTrackingOrder.id}</h3>
              </div>
              <button
                onClick={() => setSelectedTrackingOrder(null)}
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground text-h4 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl bg-background p-4 border border-border flex justify-between items-center text-small">
                <div>
                  <span className="text-caption text-muted-foreground">Código de Rastreio:</span>
                  <p className="font-extrabold text-foreground font-mono">{selectedTrackingOrder.trackingCode}</p>
                </div>
                <span className="font-bold text-brand">{selectedTrackingOrder.carrier}</span>
              </div>

              {/* Timeline */}
              <div className="space-y-6 pl-4 border-l-2 border-brand/30 py-2">
                <div className="relative pl-6">
                  <span className="absolute -left-[29px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-brand-foreground text-caption font-bold">
                    ✓
                  </span>
                  <h4 className="font-bold text-foreground text-small">Pedido Entregue à Transportadora</h4>
                  <p className="text-caption text-muted-foreground">São Paulo / SP — 04/08/2026 às 08:30</p>
                </div>
                <div className="relative pl-6">
                  <span className="absolute -left-[29px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground text-caption font-bold">
                    ⚡
                  </span>
                  <h4 className="font-bold text-foreground text-small">Em Trânsito para o Centro de Distribuição</h4>
                  <p className="text-caption text-muted-foreground">Em andamento — Previsão: 2 dias úteis</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedTrackingOrder(null)}
              className="w-full rounded-xl bg-primary py-3 text-small font-bold text-primary-foreground hover:bg-primary/90"
            >
              Fechar Rastreamento
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
