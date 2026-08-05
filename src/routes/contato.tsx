import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  MessageCircle,
  Mail,
  Phone,
  Clock,
  Send,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { APP } from "@/constants";
import { toast } from "sonner";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Fale Conosco & FAQ — Aperta Start" },
      { name: "description", content: "Tire suas dúvidas ou entre em contato com nossa equipe de suporte Aperta Start." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isSent, setIsSent] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Dúvida sobre pedido");
  const [message, setMessage] = useState("");

  const faqs = [
    {
      q: "Qual o prazo de envio do meu pedido?",
      a: "Todos os pedidos são postados em até 24 horas úteis após a confirmação do pagamento. O prazo final depende do seu CEP e da transportadora escolhida (SEDEX ou PAC).",
    },
    {
      q: "Os produtos possuem garantia?",
      a: "Sim! Todos os produtos Aperta Start possuem garantia de 90 dias contra qualquer defeito de fabricação. Basta entrar em contato conosco com o número do seu pedido.",
    },
    {
      q: "Como funciona a troca ou devolução?",
      a: "Você tem até 7 dias corridos após o recebimento para solicitar a devolução ou troca sem nenhum custo adicional, conforme previsto pelo Código de Defesa do Consumidor.",
    },
    {
      q: "Quais são as formas de pagamento aceitas?",
      a: "Aceitamos PIX (com 5% de desconto automático), Cartão de Crédito em até 6x sem juros (Visa, Mastercard, Elo, Amex) e Boleto Bancário.",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setIsSent(true);
    toast.success("Mensagem enviada com sucesso! Responderemos em breve.");
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb */}
        <nav className="flex items-center text-small text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            Início
          </Link>
          <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground/60" />
          <span className="font-medium text-foreground">Fale Conosco</span>
        </nav>

        {/* Page Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-caption font-bold text-brand uppercase tracking-wider">
            Suporte & Atendimento
          </span>
          <h1 className="text-h1 font-black text-foreground">Como podemos ajudar você?</h1>
          <p className="text-small text-muted-foreground">
            Escolha um dos nossos canais de atendimento ou envie uma mensagem direta abaixo.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-border bg-surface p-6 text-center space-y-3 shadow-light hover:border-emerald-500/40 transition-all">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <MessageCircle className="h-6 w-6" />
            </div>
            <h3 className="text-h4 font-bold text-foreground">WhatsApp Oficial</h3>
            <p className="text-caption text-muted-foreground">Atendimento rápido em horário comercial.</p>
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-small font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Iniciar Conversa no WhatsApp <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 text-center space-y-3 shadow-light hover:border-brand/40 transition-all">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="text-h4 font-bold text-foreground">Suporte por E-mail</h3>
            <p className="text-caption text-muted-foreground">Respondemos em até 1 dia útil.</p>
            <a
              href={`mailto:${APP.supportEmail}`}
              className="inline-flex items-center gap-1.5 text-small font-bold text-brand hover:underline"
            >
              {APP.supportEmail}
            </a>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 text-center space-y-3 shadow-light">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <h3 className="text-h4 font-bold text-foreground">Horário de Atendimento</h3>
            <p className="text-caption text-muted-foreground">Segunda a Sexta — 09h às 18h</p>
            <span className="text-small font-semibold text-foreground">SAC: {APP.supportPhone}</span>
          </div>
        </div>

        {/* Form + FAQ Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          {/* FAQ Accordion */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-h3 font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-brand" />
              Perguntas Frequentes (FAQ)
            </h2>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="rounded-2xl border border-border bg-surface overflow-hidden shadow-light">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-foreground text-small"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        openFaq === idx ? "rotate-180 text-brand" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 pt-0 text-small text-muted-foreground leading-relaxed border-t border-border/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-light space-y-6">
              <h2 className="text-h3 font-bold text-foreground">Envie uma Mensagem</h2>

              {isSent ? (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-6 text-center space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                  <h4 className="font-bold text-foreground text-h4">Mensagem Enviada!</h4>
                  <p className="text-small text-muted-foreground">
                    Obrigado por entrar em contato. Responderemos no seu e-mail em até 24 horas úteis.
                  </p>
                  <button
                    onClick={() => setIsSent(false)}
                    className="text-caption font-bold text-brand hover:underline"
                  >
                    Enviar outra mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-caption font-semibold text-foreground">Seu Nome</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Cristiano Alves"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-small text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-caption font-semibold text-foreground">Seu E-mail</label>
                    <input
                      type="email"
                      required
                      placeholder="seu.email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-small text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-caption font-semibold text-foreground">Assunto</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-small text-foreground"
                    >
                      <option value="Dúvida sobre pedido">Dúvida sobre pedido</option>
                      <option value="Troca ou Devolução">Troca ou Devolução</option>
                      <option value="Dúvida Técnica">Dúvida Técnica sobre Produto</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-caption font-semibold text-foreground">Sua Mensagem</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Descreva detalhadamente como podemos te ajudar..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-small text-foreground"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-small font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
                  >
                    <Send className="h-4 w-4" /> Enviar Mensagem
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
