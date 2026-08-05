import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2, Package, Truck, ArrowLeft, QrCode, Copy, Sparkles, ShoppingBag } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { formatCurrency } from "@/utils/format";
import { toast } from "sonner";

export const Route = createFileRoute("/obrigado")({
  validateSearch: (search: Record<string, unknown>) => ({
    pedido: (search["pedido"] as string | undefined) || `#APS-${Math.floor(100000 + Math.random() * 900000)}`,
  }),
  head: () => ({
    meta: [
      { title: "Obrigado Pela Compra! — Aperta Start" },
      { name: "description", content: "Seu pedido foi recebido com sucesso na Aperta Start." },
    ],
  }),
  component: ThankYouPage,
});

function ThankYouPage() {
  const { pedido } = Route.useSearch();
  const pixCode = "00020126580014BR.GOV.BCB.PIX0136apertastart-pix-qr-code-key5204000053039865405159.805802BR5920Aperta Start Gamer6009Sao Paulo62070503***6304E8A9";

  const handleCopyPix = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(pixCode);
      toast.success("Código PIX Copia e Cola copiado!");
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        {/* Top Success Banner */}
        <div className="rounded-3xl border border-emerald-500/30 bg-surface p-8 text-center space-y-4 shadow-large">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 animate-bounce">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3.5 py-1 text-caption font-extrabold text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" /> Pedido Recebido com Sucesso
            </span>
            <h1 className="text-h1 font-black text-foreground">Obrigado pela sua compra! 🎉</h1>
            <p className="text-body text-muted-foreground max-w-lg mx-auto">
              Seu pedido <strong className="text-foreground font-mono">{pedido}</strong> foi confirmado e já está em processo de separação em nosso centro de distribuição.
            </p>
          </div>
        </div>

        {/* PIX Copy & Paste Card (if PIX selected) */}
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-4 shadow-light">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <QrCode className="h-6 w-6 text-emerald-500" />
            <div>
              <h3 className="text-h4 font-bold text-foreground">Pagamento via PIX (Se aplicável)</h3>
              <p className="text-caption text-muted-foreground">Copie o código abaixo se você optou por pagar via PIX.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              readOnly
              value={pixCode}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-small text-muted-foreground font-mono truncate"
            />
            <button
              onClick={handleCopyPix}
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-small font-bold text-white shadow-sm hover:bg-emerald-700 transition-all"
            >
              <Copy className="h-4 w-4" /> Copiar PIX
            </button>
          </div>
        </div>

        {/* Order Status & Next Steps Timeline */}
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-light">
          <h3 className="text-h3 font-bold text-foreground">Próximos Passos do Seu Pedido</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="rounded-xl bg-background p-4 border border-border space-y-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-caption">1</span>
              <h4 className="font-bold text-foreground text-small">Pagamento Confirmado</h4>
              <p className="text-caption text-muted-foreground">Recebemos a confirmação em nosso sistema.</p>
            </div>
            <div className="rounded-xl bg-background p-4 border border-border space-y-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white font-bold text-caption">2</span>
              <h4 className="font-bold text-foreground text-small">Separação & Embalagem</h4>
              <p className="text-caption text-muted-foreground">Sua encomenda está sendo embalada com proteção.</p>
            </div>
            <div className="rounded-xl bg-background p-4 border border-border space-y-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground font-bold text-caption">3</span>
              <h4 className="font-bold text-foreground text-small">Envio em até 24h</h4>
              <p className="text-caption text-muted-foreground">Você receberá o código de rastreio por e-mail.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Link
            to="/minha-conta"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-small font-extrabold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
          >
            <Package className="h-4 w-4" /> Acompanhar em Meus Pedidos
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-8 py-3.5 text-small font-bold text-foreground hover:bg-muted transition-all"
          >
            <ShoppingBag className="h-4 w-4" /> Continuar Comprando
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
