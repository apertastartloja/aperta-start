import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, RefreshCw, FileText, ChevronRight, Check } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { APP } from "@/constants";

export const Route = createFileRoute("/politicas")({
  head: () => ({
    meta: [
      { title: "Políticas & Termos de Uso — Aperta Start" },
      { name: "description", content: "Conheça nossas políticas de troca, termos de uso e privacidade em conformidade com o CDC e LGPD." },
    ],
  }),
  component: PoliciesPage,
});

function PoliciesPage() {
  const [activeTab, setActiveTab] = useState<"exchanges" | "privacy" | "terms">("exchanges");

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-small text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            Início
          </Link>
          <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground/60" />
          <span className="font-medium text-foreground">Políticas & Termos</span>
        </nav>

        {/* Header */}
        <div className="border-b border-border pb-6">
          <span className="text-caption font-bold text-brand uppercase tracking-wider">
            Transparência & Segurança
          </span>
          <h1 className="text-h1 font-black text-foreground">Políticas & Termos de Uso</h1>
          <p className="mt-1 text-small text-muted-foreground">
            Tudo o que você precisa saber sobre compras, trocas e privacidade na Aperta Start.
          </p>
        </div>

        {/* Grid: Navigation Tabs + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3 space-y-2">
            <div className="rounded-2xl border border-border bg-surface p-3 shadow-light space-y-1">
              <button
                onClick={() => setActiveTab("exchanges")}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-small font-bold transition-all ${
                  activeTab === "exchanges"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <RefreshCw className="h-4 w-4" />
                Trocas e Devoluções
              </button>
              <button
                onClick={() => setActiveTab("privacy")}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-small font-bold transition-all ${
                  activeTab === "privacy"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                Política de Privacidade
              </button>
              <button
                onClick={() => setActiveTab("terms")}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-small font-bold transition-all ${
                  activeTab === "terms"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <FileText className="h-4 w-4" />
                Termos de Uso
              </button>
            </div>
          </aside>

          {/* Tab Content */}
          <main className="lg:col-span-9">
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-light space-y-6">
              {activeTab === "exchanges" && (
                <div className="space-y-4 text-small text-muted-foreground leading-relaxed">
                  <h2 className="text-h3 font-bold text-foreground">Política de Trocas e Devoluções</h2>
                  <p>
                    Na Aperta Start, a sua satisfação é a nossa prioridade. Se você não estiver totalmente satisfeito com a sua compra, oferecemos uma política de troca e devolução simples e descomplicada, alinhada ao Código de Defesa do Consumidor (CDC).
                  </p>

                  <div className="rounded-xl bg-background p-4 border border-border space-y-2 text-foreground font-medium">
                    <div className="flex items-center gap-2 text-brand font-bold">
                      <Check className="h-4 w-4 stroke-[3]" /> Direito de Arrependimento (7 dias)
                    </div>
                    <p className="text-small text-muted-foreground font-normal">
                      Você pode solicitar o cancelamento e a devolução total do seu pedido em até 7 dias corridos após a entrega. A devolução do valor é integral e o frete de retorno é por nossa conta.
                    </p>
                  </div>

                  <h3 className="text-h4 font-bold text-foreground pt-2">Condições para Troca:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>O produto deve estar na embalagem original, sem sinais de mau uso ou danos acidentais.</li>
                    <li>Deve acompanhar o manual e todos os acessórios originais inclusos na caixa.</li>
                    <li>Em caso de defeito de fabricação dentro do prazo de garantia de 90 dias, faremos a substituição por um produto novo.</li>
                  </ul>
                </div>
              )}

              {activeTab === "privacy" && (
                <div className="space-y-4 text-small text-muted-foreground leading-relaxed">
                  <h2 className="text-h3 font-bold text-foreground">Política de Privacidade (LGPD)</h2>
                  <p>
                    A Aperta Start assume o compromisso de proteger a privacidade e a segurança dos dados pessoais de todos os nossos clientes e visitantes, em estrita observância à Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                  </p>

                  <h3 className="text-h4 font-bold text-foreground pt-2">Coleta e Uso de Informações:</h3>
                  <p>
                    Coletamos apenas as informações estritamente necessárias para processar seus pedidos, como Nome, CPF, Endereço de Entrega, E-mail e Telefone. Seus dados bancários e de cartão de crédito são processados diretamente por gateways de pagamento seguros com criptografia SSL e jamais são armazenados em nossos servidores.
                  </p>

                  <h3 className="text-h4 font-bold text-foreground pt-2">Seus Direitos:</h3>
                  <p>
                    Você pode solicitar a alteração, exportação ou exclusão definitiva dos seus dados cadastrais a qualquer momento através do nosso suporte pelo e-mail <strong>{APP.supportEmail}</strong>.
                  </p>
                </div>
              )}

              {activeTab === "terms" && (
                <div className="space-y-4 text-small text-muted-foreground leading-relaxed">
                  <h2 className="text-h3 font-bold text-foreground">Termos e Condições de Uso</h2>
                  <p>
                    Ao acessar e comprar no site da Aperta Start, você concorda com os termos descritos abaixo. Recomendamos a leitura atenta deste documento.
                  </p>

                  <h3 className="text-h4 font-bold text-foreground pt-2">1. Propriedade Intelectual</h3>
                  <p>
                    Todo o conteúdo presente neste site, incluindo textos, logotipos, imagens, artes de produtos e marca Aperta Start são de propriedade exclusiva e protegidos pela legislação de direitos autorais.
                  </p>

                  <h3 className="text-h4 font-bold text-foreground pt-2">2. Preços e Disponibilidade</h3>
                  <p>
                    Os preços e estoques dos produtos estão sujeitos a alterações sem aviso prévio. No entanto, o valor confirmado no momento da finalização do pedido será rigorosamente mantido.
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </MainLayout>
  );
}
