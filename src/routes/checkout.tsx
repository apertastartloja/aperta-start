import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Truck,
  CreditCard,
  QrCode,
  FileText,
  Trash2,
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  Ticket,
} from "lucide-react";
import { useCartContext } from "@/contexts/cart-context";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { mockProducts } from "@/mocks/products.mock";
import { formatCurrency } from "@/utils/format";
import { toast } from "sonner";
import type { Product } from "@/types";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout Seguro — Aperta Start" },
      { name: "description", content: "Finalize sua compra de forma rápida e segura na Aperta Start." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, totals, updateQuantity, removeItem, clear, applyCoupon } = useCartContext();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card" | "boleto">("pix");
  const [couponInput, setCouponInput] = useState("");
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>("");

  // Form State
  const [formData, setFormData] = useState({
    name: "Cristiano Alves",
    email: "cristiano@exemplo.com",
    cpf: "123.456.789-00",
    phone: "(11) 98765-4321",
    cep: "01310-100",
    address: "Av. Paulista",
    number: "1000",
    complement: "Apto 42",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    uf: "SP",
    cardNumber: "**** **** **** 4829",
    cardName: "Cristiano Alves",
    cardExpiry: "12/28",
    cardCvv: "888",
    installments: "1",
  });

  const cartProducts = cart.items.map((item) => {
    const p: Product = mockProducts.find((mp) => mp.id === item.productId) ?? mockProducts[0]!;
    return { ...item, product: p };
  });

  const handleApplyCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    if (couponInput.toUpperCase() === "START10" || couponInput.toUpperCase() === "GAMER") {
      applyCoupon(couponInput.toUpperCase());
      toast.success("Cupom aplicado com sucesso!");
    } else {
      toast.error("Cupom inválido ou expirado.");
    }
  };

  const handleFinishPurchase = () => {
    if (cart.items.length === 0) {
      toast.error("Seu carrinho está vazio!");
      return;
    }
    const generatedOrder = `APS-${Math.floor(100000 + Math.random() * 900000)}`;
    clear();
    toast.success("Pedido realizado com sucesso!");
    navigate({ to: "/obrigado", search: { pedido: `#${generatedOrder}` } });
  };

  const pixDiscount = paymentMethod === "pix" ? totals.subtotal * 0.05 : 0;
  const finalTotal = Math.max(0, totals.total - pixDiscount);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-accent selection:text-accent-foreground">
      {/* Checkout Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="rounded-lg bg-primary px-2.5 py-1 font-black text-primary-foreground tracking-wider text-h4">
              APERTA<span className="text-accent">START</span>
            </span>
          </Link>

          {/* Steps Indicator */}
          <div className="hidden md:flex items-center gap-4 text-small font-semibold">
            <div
              className={`flex items-center gap-2 ${
                step >= 1 ? "text-brand font-bold" : "text-muted-foreground"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-caption ${
                  step >= 1 ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                1
              </span>
              Carrinho
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
            <div
              className={`flex items-center gap-2 ${
                step >= 2 ? "text-brand font-bold" : "text-muted-foreground"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-caption ${
                  step >= 2 ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                2
              </span>
              Identificação & Entrega
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
            <div
              className={`flex items-center gap-2 ${
                step >= 3 ? "text-brand font-bold" : "text-muted-foreground"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-caption ${
                  step >= 3 ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                3
              </span>
              Pagamento
            </div>
          </div>

          <div className="flex items-center gap-1 text-small font-medium text-emerald-600 dark:text-emerald-400">
            <Lock className="h-4 w-4" />
            <span>Ambiente 100% Seguro</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {cart.items.length === 0 && !isOrderComplete ? (
          /* Empty Cart View */
          <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-8 text-center space-y-4 shadow-light">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h2 className="text-h3 font-bold text-foreground">Seu carrinho está vazio</h2>
            <p className="text-small text-muted-foreground">
              Você ainda não adicionou nenhum item para finalizar a compra.
            </p>
            <Link
              to="/produtos"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-small font-bold text-accent-foreground shadow-medium hover:brightness-105"
            >
              Explorar Catálogo de Produtos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: Checkout Steps */}
            <div className="lg:col-span-7 space-y-6">
              {/* Step 1: Cart Items */}
              <div
                className={`rounded-2xl border bg-surface p-6 shadow-light transition-all ${
                  step === 1 ? "border-brand ring-2 ring-brand/20" : "border-border opacity-90"
                }`}
              >
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h2 className="text-h4 font-bold text-foreground flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-caption text-brand-foreground">
                      1
                    </span>
                    Revisão dos Itens ({cart.items.length})
                  </h2>
                  {step > 1 && (
                    <button
                      onClick={() => setStep(1)}
                      className="text-small font-semibold text-brand hover:underline"
                    >
                      Editar
                    </button>
                  )}
                </div>

                {step === 1 && (
                  <div className="mt-4 space-y-4">
                    <div className="divide-y divide-border">
                      {cartProducts.map(({ id, quantity, unitPrice, product }) => (
                        <div key={id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                          <img
                            src={product.images[0]?.url || ""}
                            alt={product.name}
                            className="h-20 w-20 shrink-0 rounded-xl border border-border bg-background object-contain p-2"
                          />
                          <div className="flex flex-1 flex-col justify-between">
                            <div className="flex justify-between gap-2">
                              <div>
                                <h3 className="font-bold text-foreground text-small">{product.name}</h3>
                                <p className="text-caption text-muted-foreground">SKU: {product.sku}</p>
                              </div>
                              <span className="font-extrabold text-foreground text-small">
                                {formatCurrency(unitPrice * quantity)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                              <QuantitySelector
                                value={quantity}
                                onChange={(q) => updateQuantity(id, q)}
                                max={product.stock}
                              />
                              <button
                                onClick={() => removeItem(id)}
                                className="flex items-center gap-1 text-caption text-danger hover:underline"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Remover
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-border flex justify-end">
                      <button
                        onClick={() => setStep(2)}
                        className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-small font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
                      >
                        Ir para Identificação & Entrega
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Customer Info & Address */}
              <div
                className={`rounded-2xl border bg-surface p-6 shadow-light transition-all ${
                  step === 2 ? "border-brand ring-2 ring-brand/20" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h2 className="text-h4 font-bold text-foreground flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-caption text-brand-foreground">
                      2
                    </span>
                    Dados de Identificação & Entrega
                  </h2>
                  {step > 2 && (
                    <button
                      onClick={() => setStep(2)}
                      className="text-small font-semibold text-brand hover:underline"
                    >
                      Editar
                    </button>
                  )}
                </div>

                {step === 2 && (
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-caption font-semibold text-foreground">Nome Completo</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-small text-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-caption font-semibold text-foreground">E-mail para Confirmação</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-small text-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-caption font-semibold text-foreground">CPF (para nota fiscal)</label>
                        <input
                          type="text"
                          value={formData.cpf}
                          onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-small text-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-caption font-semibold text-foreground">Telefone / WhatsApp</label>
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-small text-foreground"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border space-y-4">
                      <h4 className="text-small font-bold text-foreground flex items-center gap-2">
                        <Truck className="h-4 w-4 text-brand" /> Endereço de Entrega
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-caption font-semibold text-foreground">CEP</label>
                          <input
                            type="text"
                            value={formData.cep}
                            onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-small text-foreground"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-caption font-semibold text-foreground">Logradouro / Rua</label>
                          <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-small text-foreground"
                          />
                        </div>
                        <div>
                          <label className="text-caption font-semibold text-foreground">Número</label>
                          <input
                            type="text"
                            value={formData.number}
                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-small text-foreground"
                          />
                        </div>
                        <div>
                          <label className="text-caption font-semibold text-foreground">Bairro</label>
                          <input
                            type="text"
                            value={formData.neighborhood}
                            onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-small text-foreground"
                          />
                        </div>
                        <div>
                          <label className="text-caption font-semibold text-foreground">Cidade / UF</label>
                          <input
                            type="text"
                            value={`${formData.city} / ${formData.uf}`}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-small text-foreground"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex justify-between items-center">
                      <button
                        onClick={() => setStep(1)}
                        className="text-small font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        <ArrowLeft className="h-4 w-4" /> Voltar ao Carrinho
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-small font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
                      >
                        Prosseguir para Pagamento
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Payment Method */}
              <div
                className={`rounded-2xl border bg-surface p-6 shadow-light transition-all ${
                  step === 3 ? "border-brand ring-2 ring-brand/20" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h2 className="text-h4 font-bold text-foreground flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-caption text-brand-foreground">
                      3
                    </span>
                    Forma de Pagamento
                  </h2>
                </div>

                {step === 3 && (
                  <div className="mt-6 space-y-6">
                    {/* Payment Selectors */}
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setPaymentMethod("pix")}
                        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                          paymentMethod === "pix"
                            ? "border-emerald-500 bg-emerald-500/10 font-bold text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30"
                            : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40"
                        }`}
                      >
                        <QrCode className="h-6 w-6 text-emerald-500" />
                        <span className="text-small">PIX (5% OFF)</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod("card")}
                        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                          paymentMethod === "card"
                            ? "border-brand bg-brand/10 font-bold text-brand ring-2 ring-brand/30"
                            : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40"
                        }`}
                      >
                        <CreditCard className="h-6 w-6 text-brand" />
                        <span className="text-small">Cartão de Crédito</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod("boleto")}
                        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                          paymentMethod === "boleto"
                            ? "border-primary bg-primary/10 font-bold text-primary ring-2 ring-primary/30"
                            : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40"
                        }`}
                      >
                        <FileText className="h-6 w-6 text-primary" />
                        <span className="text-small">Boleto Bancário</span>
                      </button>
                    </div>

                    {/* PIX Payment Details */}
                    {paymentMethod === "pix" && (
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3">
                        <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300 text-small">
                          <Sparkles className="h-5 w-5 fill-current" /> Desconto de 5% Aplicado!
                        </div>
                        <p className="text-small text-muted-foreground">
                          Ao clicar em "Finalizar Compra", o QR Code do PIX será gerado instantaneamente na tela para você pagar pelo seu aplicativo bancário.
                        </p>
                      </div>
                    )}

                    {/* Credit Card Form */}
                    {paymentMethod === "card" && (
                      <div className="space-y-4 rounded-xl border border-border p-5 bg-background">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <label className="text-caption font-semibold text-foreground">Número do Cartão</label>
                            <input
                              type="text"
                              value={formData.cardNumber}
                              onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                              className="mt-1 w-full rounded-xl border border-input bg-surface px-4 py-2.5 text-small text-foreground"
                            />
                          </div>
                          <div>
                            <label className="text-caption font-semibold text-foreground">Nome no Cartão</label>
                            <input
                              type="text"
                              value={formData.cardName}
                              onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                              className="mt-1 w-full rounded-xl border border-input bg-surface px-4 py-2.5 text-small text-foreground"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-caption font-semibold text-foreground">Validade</label>
                              <input
                                type="text"
                                value={formData.cardExpiry}
                                onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                                className="mt-1 w-full rounded-xl border border-input bg-surface px-3 py-2.5 text-small text-foreground"
                              />
                            </div>
                            <div>
                              <label className="text-caption font-semibold text-foreground">CVV</label>
                              <input
                                type="text"
                                value={formData.cardCvv}
                                onChange={(e) => setFormData({ ...formData, cardCvv: e.target.value })}
                                className="mt-1 w-full rounded-xl border border-input bg-surface px-3 py-2.5 text-small text-foreground"
                              />
                            </div>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-caption font-semibold text-foreground">Parcelamento</label>
                            <select
                              value={formData.installments}
                              onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                              className="mt-1 w-full rounded-xl border border-input bg-surface px-4 py-2.5 text-small text-foreground"
                            >
                              <option value="1">1x de {formatCurrency(finalTotal)} sem juros</option>
                              <option value="2">2x de {formatCurrency(finalTotal / 2)} sem juros</option>
                              <option value="3">3x de {formatCurrency(finalTotal / 3)} sem juros</option>
                              <option value="6">6x de {formatCurrency(finalTotal / 6)} sem juros</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Boleto Form */}
                    {paymentMethod === "boleto" && (
                      <div className="rounded-xl border border-border bg-background p-5 space-y-2">
                        <h4 className="font-bold text-foreground text-small">Pagamento por Boleto Bancário</h4>
                        <p className="text-small text-muted-foreground">
                          O boleto será gerado após a confirmação. O prazo de compensação bancária é de até 2 dias úteis.
                        </p>
                      </div>
                    )}

                    {/* Submit Purchase CTA */}
                    <button
                      onClick={handleFinishPurchase}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent py-4 text-h4 font-extrabold text-accent-foreground shadow-medium transition-all hover:brightness-105 hover:shadow-large"
                    >
                      <Lock className="h-5 w-5" />
                      Finalizar Compra ({formatCurrency(finalTotal)})
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Order Summary Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="sticky top-24 rounded-2xl border border-border bg-surface p-6 shadow-light space-y-6">
                <h3 className="text-h4 font-bold text-foreground border-b border-border pb-4">
                  Resumo do Pedido
                </h3>

                {/* Cupom Form */}
                <form onSubmit={handleApplyCouponSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Cupom de desconto"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-small text-foreground uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-4 py-2 text-small font-bold text-primary-foreground hover:bg-primary/90"
                  >
                    Aplicar
                  </button>
                </form>

                {/* Subtotals & Totals */}
                <div className="space-y-3 text-small border-t border-border pt-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal ({cart.items.length} itens):</span>
                    <span className="font-semibold text-foreground">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Desconto Cupom:</span>
                      <span>-{formatCurrency(totals.discount)}</span>
                    </div>
                  )}
                  {paymentMethod === "pix" && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Desconto PIX (5%):</span>
                      <span>-{formatCurrency(pixDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Frete de Entrega:</span>
                    <span className="font-semibold text-foreground">
                      {totals.shipping === 0 ? "Grátis" : formatCurrency(totals.shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-h3 font-extrabold text-foreground border-t border-border pt-4">
                    <span>Total:</span>
                    <span className="text-brand">{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="rounded-xl bg-background p-4 border border-border space-y-2 text-caption text-muted-foreground">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> Compra Garantida Aperta Start
                  </div>
                  <p>Receba o seu produto em casa com segurança ou devolvemos seu dinheiro em 7 dias.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Order Success Modal */}
      {isOrderComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface p-8 text-center space-y-6 shadow-large border border-border animate-in fade-in zoom-in duration-300">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <div className="space-y-2">
              <span className="text-caption font-extrabold text-brand uppercase tracking-wider">
                Pedido Recebido com Sucesso!
              </span>
              <h2 className="text-h2 font-black text-foreground">Parabéns! 🎉</h2>
              <p className="text-small text-muted-foreground">
                Seu pedido <strong className="text-foreground">{orderNumber}</strong> foi registrado em nosso sistema.
              </p>
            </div>

            <div className="rounded-xl bg-background p-4 border border-border text-left space-y-2 text-small">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status do Pagamento:</span>
                <span className="font-bold text-emerald-600">Aprovado</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Previsão de Envio:</span>
                <span className="font-bold text-foreground">Em até 24 horas</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setIsOrderComplete(false);
                  navigate({ to: "/" });
                }}
                className="w-full rounded-xl bg-accent py-3.5 text-small font-bold text-accent-foreground shadow-medium hover:brightness-105"
              >
                Voltar para a Loja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
