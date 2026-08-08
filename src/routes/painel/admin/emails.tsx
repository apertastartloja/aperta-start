import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
  ExternalLink,
} from "lucide-react";
import { AdminLayout } from "@/components/admin";
import { EmailService } from "@/services/email.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel/admin/emails")({
  head: () => ({
    meta: [{ title: "E-mails — Painel Aperta Start" }],
  }),
  component: EmailsPage,
});

type TemplateType = "order_confirmation" | "tracking_update" | "welcome";

function EmailsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("order_confirmation");
  const [testEmailRecipient, setTestEmailRecipient] = useState("apertastart.loja@gmail.com");
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Sample order data for preview
  const sampleOrder = {
    code: "APS-849201",
    customerName: "Cristiano Alves",
    customerEmail: testEmailRecipient,
    paymentMethod: "pix" as const,
    subtotal: 189.8,
    discount: 9.49,
    shipping: 0,
    total: 180.31,
    trackingCode: "AA987654321BR",
    carrier: "Correios (SEDEX Express)",
    items: [
      {
        id: "1",
        productId: "p1",
        quantity: 1,
        unitPrice: 129.9,
        productName: "Suporte Duplo para Controles PS5 / Xbox Series",
      },
      {
        id: "2",
        productId: "p2",
        quantity: 1,
        unitPrice: 59.9,
        productName: "Luminária Decorativa Bloco Interrogação",
      },
    ],
    shippingAddress: {
      id: "adr-1",
      label: "Casa",
      street: "Av. Paulista",
      number: "1000",
      complement: "Apto 42",
      district: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-100",
      isDefault: true,
    },
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailRecipient.trim()) {
      toast.error("Informe o e-mail de destino para o teste.");
      return;
    }

    setIsSendingTest(true);
    try {
      let res;
      if (selectedTemplate === "tracking_update") {
        res = await EmailService.sendTrackingUpdate({
          ...sampleOrder,
          customerEmail: testEmailRecipient,
        });
      } else {
        res = await EmailService.sendOrderConfirmation({
          ...sampleOrder,
          customerEmail: testEmailRecipient,
        });
      }

      if (res.success) {
        toast.success(`E-mail de teste enviado com sucesso para ${testEmailRecipient}! (ID: ${res.id})`);
      } else {
        toast.error(res.errorMessage || "Erro ao enviar e-mail de teste via Resend.");
      }
    } catch (err) {
      console.error("Erro no teste de e-mail:", err);
      toast.error("Ocorreu um erro ao disparar o e-mail de teste.");
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-caption font-extrabold text-brand uppercase tracking-wider">
              <Mail className="size-4" /> Comunicação & Transacional
            </div>
            <h1 className="text-h2 font-black text-foreground tracking-tight">E-mails Transacionais (Resend)</h1>
            <p className="text-small text-muted-foreground">
              Customize os modelos de e-mail de confirmação de pedido, rastreamento e faça disparos de teste.
            </p>
          </div>

          {/* Resend Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-caption font-extrabold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-4" /> API Resend Ativa (apertastart.com.br)
          </div>
        </div>

        {/* Sender Info Banner */}
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand shrink-0">
              <Mail className="size-6" />
            </div>
            <div>
              <span className="text-caption font-bold text-muted-foreground uppercase">Remetente Oficial Configurado</span>
              <p className="text-small font-black text-foreground">
                Aperta Start &lt;contato@apertastart.com.br&gt;
              </p>
            </div>
          </div>

          {/* Test Dispatch Form */}
          <form onSubmit={handleSendTestEmail} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="email"
              required
              placeholder="Digite um e-mail de destino..."
              value={testEmailRecipient}
              onChange={(e) => setTestEmailRecipient(e.target.value)}
              className="w-full sm:w-64 rounded-2xl border border-input bg-background px-4 py-2 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSendingTest}
              className="inline-flex items-center gap-2 shrink-0 rounded-2xl bg-accent px-5 py-2 text-small font-extrabold text-accent-foreground shadow-xs hover:brightness-105 transition-all cursor-pointer"
            >
              {isSendingTest ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Enviando...
                </>
              ) : (
                <>
                  <Send className="size-4" /> Enviar Teste
                </>
              )}
            </button>
          </form>
        </div>

        {/* Template Tabs Selector */}
        <div className="rounded-3xl border border-border bg-surface p-2 shadow-xs flex items-center gap-2 overflow-x-auto">
          {[
            {
              id: "order_confirmation",
              label: "📦 Pedido Confirmado",
              desc: "Disparado após conclusão do pedido ou aprovação do PIX",
            },
            {
              id: "tracking_update",
              label: "🚚 Código de Rastreio (Enviado)",
              desc: "Disparado quando o admin adiciona o código de rastreamento",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTemplate(tab.id as TemplateType)}
              className={cn(
                "rounded-2xl px-5 py-3 text-left transition-all cursor-pointer whitespace-nowrap min-w-[220px]",
                selectedTemplate === tab.id
                  ? "bg-brand text-brand-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <p className="font-extrabold text-small">{tab.label}</p>
              <p className="text-caption opacity-80 font-normal line-clamp-1">{tab.desc}</p>
            </button>
          ))}
        </div>

        {/* Template HTML Live Preview Frame */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-caption font-extrabold text-brand uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="size-4" /> Pré-visualização do E-mail HTML
            </span>
            <span className="text-caption font-bold text-muted-foreground">
              Assunto: {selectedTemplate === "tracking_update" ? "🚚 Seu Pedido #APS-849201 Foi Enviado!" : "Pedido #APS-849201 Confirmado — Aperta Start"}
            </span>
          </div>

          {/* Rendered HTML box */}
          <div className="rounded-2xl border border-border bg-slate-950 p-6 max-w-2xl mx-auto space-y-6 text-slate-100 shadow-xl">
            {/* Header */}
            <div className="text-center pb-4 border-b-2 border-amber-500">
              <h2 className="text-h3 font-black text-white tracking-wider">
                APERTA<span className="text-amber-500">START</span>
              </h2>
            </div>

            {/* Content for Order Confirmation */}
            {selectedTemplate === "order_confirmation" && (
              <div className="space-y-4 text-small">
                <div className="rounded-xl bg-slate-900 p-4 text-center border border-slate-800">
                  <span className="text-caption font-extrabold text-amber-500 uppercase tracking-wider">
                    Pedido Confirmado
                  </span>
                  <h3 className="text-h2 font-black text-white mt-1">#APS-849201</h3>
                </div>

                <p>
                  Olá, <strong>Cristiano Alves</strong>! 🎉
                </p>
                <p className="text-slate-400">
                  Recebemos seu pedido com sucesso na Aperta Start! Já estamos preparando tudo para que seus produtos gamer cheguem perfeitos até você.
                </p>

                {/* Items */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                  <div className="p-3 border-b border-slate-800 font-bold text-caption uppercase text-slate-400">
                    Itens do Pedido
                  </div>
                  <div className="divide-y divide-slate-800">
                    <div className="p-3 flex justify-between">
                      <span>1x Suporte Duplo para Controles PS5 / Xbox</span>
                      <span className="font-bold text-white">R$ 129,90</span>
                    </div>
                    <div className="p-3 flex justify-between">
                      <span>1x Luminária Decorativa Bloco Interrogação</span>
                      <span className="font-bold text-white">R$ 59,90</span>
                    </div>
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-small">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span>R$ 189,80</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Desconto PIX (5%):</span>
                    <span>-R$ 9,49</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Frete:</span>
                    <span className="text-emerald-400 font-bold">Grátis</span>
                  </div>
                  <div className="flex justify-between text-h3 font-black text-white border-t border-slate-800 pt-2">
                    <span>Total Pago:</span>
                    <span className="text-amber-500">R$ 180,31</span>
                  </div>
                </div>
              </div>
            )}

            {/* Content for Tracking Update */}
            {selectedTemplate === "tracking_update" && (
              <div className="space-y-4 text-small text-center">
                <span className="text-caption font-extrabold text-emerald-400 uppercase tracking-wider">
                  🚚 Pedido em Trânsito
                </span>
                <h3 className="text-h2 font-black text-white">Seu pedido foi despachado!</h3>

                <p className="text-slate-400">
                  Olá, <strong>Cristiano Alves</strong>! O seu pedido <strong>#APS-849201</strong> já foi entregue à transportadora <strong>Correios (SEDEX Express)</strong>.
                </p>

                {/* Tracking Box */}
                <div className="rounded-2xl bg-slate-900 border border-slate-700 p-6 space-y-2">
                  <span className="text-caption font-bold text-slate-400 uppercase">Código de Rastreamento</span>
                  <p className="text-h2 font-black font-mono text-amber-400 tracking-widest">
                    AA987654321BR
                  </p>
                  <p className="text-caption text-slate-400">Transportadora: Correios (SEDEX)</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-4 border-t border-slate-800 text-caption text-slate-500">
              © 2026 Aperta Start. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
