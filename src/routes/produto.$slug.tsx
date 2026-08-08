import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Truck,
  ShieldCheck,
  Zap,
  Star,
  Check,
  ChevronRight,
  Share2,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { Container } from "@/components/common/container";
import { ProductPrice } from "@/components/product/product-price";
import { ProductBadge } from "@/components/product/product-badge";
import { ProductGrid } from "@/components/product/product-grid";
import { QuantitySelector } from "@/components/product/quantity-selector";
import { WishlistButton } from "@/components/product/wishlist-button";
import { useCartContext } from "@/contexts/cart-context";
import { ProductService } from "@/services/product.service";
import { formatCurrency } from "@/utils/format";
import { fetchAddressByCep, formatCep } from "@/services/viacep.service";
import { MelhorEnvioService } from "@/services/melhorenvio.service";
import { toast } from "sonner";
import type { Product } from "@/types";

export const Route = createFileRoute("/produto/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Aperta Start` },
      { name: "description", content: "Produto da Aperta Start — setup gamer e cultura geek premium." },
    ],
  }),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { addItem } = useCartContext();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => ProductService.getBySlug(slug),
    retry: 1,
  });

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("Preto Stealth");
  const [quantity, setQuantity] = useState(1);
  const [cep, setCep] = useState("");
  const [shippingOptions, setShippingOptions] = useState<
    { title: string; price: number; time: string }[] | null
  >(null);
  const [isCalculatingCep, setIsCalculatingCep] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");

  const colors = [
    { name: "Preto Stealth", hex: "#19253b" },
    { name: "Amarelo Start", hex: "#ffc933" },
    { name: "Roxo Cyber", hex: "#7c3aed" },
  ];

  const currentImage = product ? (product.images[selectedImageIndex]?.url || product.images[0]?.url || "") : "";

  // Fetch related products — use relatedProductIds if set, else fall back to same category
  const { data: relatedProductsData } = useQuery({
    queryKey: ["products", "related", product?.id],
    queryFn: async () => {
      if (!product) return [];
      if (product.relatedProductIds && product.relatedProductIds.length > 0) {
        // Fetch specific related products by ID
        const results = await Promise.all(
          product.relatedProductIds.map((id) =>
            ProductService.getById(id).catch(() => null)
          )
        );
        return results.filter(Boolean) as Product[];
      }
      // Fall back: same category
      const res = await ProductService.list({ perPage: 100 });
      return res.data
        .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
        .slice(0, 4);
    },
    enabled: !!product,
  });

  const relatedProducts = relatedProductsData ?? [];

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      quantity,
      unitPrice: product.price,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      quantity,
      unitPrice: product.price,
    });
    navigate({ to: "/checkout" });
  };

  const handleCalculateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCep = cep.replace(/\D/g, "");
    if (!cleanCep || cleanCep.length < 8) {
      toast.error("Por favor, digite um CEP válido com 8 dígitos.");
      return;
    }

    setIsCalculatingCep(true);
    const [address, options] = await Promise.all([
      fetchAddressByCep(cleanCep),
      MelhorEnvioService.calculateShipping(cleanCep, [
        { id: product?.id || "1", price: product?.price || 50, quantity: quantity || 1 },
      ]),
    ]);
    setIsCalculatingCep(false);

    if (address) {
      toast.success(`Cotação de frete calculada para ${address.localidade} / ${address.uf}`);
    }

    if (options && options.length > 0) {
      setShippingOptions(
        options.map((opt) => ({
          title: `${opt.name} (${opt.company})`,
          price: opt.price,
          time: `${opt.deliveryTime} ${opt.deliveryTime === 1 ? "dia útil" : "dias úteis"}`,
        }))
      );
    } else {
      setShippingOptions([
        { title: "Entrega Econômica (PAC)", price: 14.9, time: "5 a 7 dias úteis" },
        { title: "Entrega Rápida (SEDEX)", price: 24.9, time: "2 a 3 dias úteis" },
        { title: "Retirada Aperta Start", price: 0, time: "Pronto em 24h (Grátis)" },
      ]);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link do produto copiado para a área de transferência!");
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
        </div>
      </MainLayout>
    );
  }

  if (isError || !product) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <h1 className="text-h2 font-extrabold text-foreground">Produto não encontrado</h1>
          <p className="text-muted-foreground">O produto que você está procurando não existe ou foi removido.</p>
          <Link to="/loja" className="rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground">
            Ver todos os produtos
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container className="py-6 space-y-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center text-small text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            Início
          </Link>
          <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground/60" />
          <Link to="/loja" className="transition-colors hover:text-foreground">
            Loja
          </Link>
          <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground/60" />
          <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* Top Product Section (Gallery + Details) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left: Product Images Gallery */}
          <div className="lg:col-span-7">
            <div className="sticky top-24 space-y-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-medium transition-all hover:shadow-large">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="h-full w-full object-contain object-center transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {product.badges.map((badge) => (
                    <ProductBadge key={badge} type={badge} />
                  ))}
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <WishlistButton productId={product.id} className="bg-surface/90 shadow-sm backdrop-blur-sm" />
                  <button
                    onClick={handleShare}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-foreground shadow-sm backdrop-blur-sm transition-all hover:bg-accent hover:text-accent-foreground"
                    title="Compartilhar produto"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Gallery Thumbnails */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`shrink-0 h-20 w-20 overflow-hidden rounded-xl border-2 p-1.5 bg-surface transition-all ${
                      selectedImageIndex === idx
                        ? "border-brand shadow-sm"
                        : "border-border opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img.url} alt={img.alt} className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <p className="text-small font-bold uppercase tracking-wider text-brand">{product.sku}</p>
              <h1 className="mt-1 text-h2 text-foreground font-extrabold tracking-tight">
                {product.name}
              </h1>

              {/* Rating & Stock */}
              <div className="mt-3 flex items-center gap-4 text-small">
                <div className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground font-normal">
                    ({product.reviewsCount} avaliações)
                  </span>
                </div>
                <div className="h-4 w-px bg-border" />
                <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                  <Check className="h-4 w-4 stroke-[3]" /> Em estoque ({product.stock} un.)
                </span>
              </div>
            </div>

            {/* Price Card */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-light space-y-3">
              <ProductPrice product={product} size="lg" />

              <div className="rounded-lg bg-emerald-500/10 p-3 text-small text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                <span className="font-medium">Preço com PIX (5% off):</span>
                <span className="font-bold text-h4">
                  {formatCurrency(product.price * 0.95)}
                </span>
              </div>

              <p className="text-caption text-muted-foreground">
                Ou até <strong>6x de {formatCurrency(product.price / 6)}</strong> sem juros no cartão
              </p>
            </div>

            {/* Colors selection */}
            {product.variants && product.variants.length > 0 ? (
              <div className="space-y-2">
                <label className="text-small font-semibold text-foreground flex justify-between">
                  <span>Variações:</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedColor(v.value)}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-small font-medium transition-all ${
                        selectedColor === v.value
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-surface hover:bg-muted"
                      }`}
                    >
                      {v.name}: {v.value}
                      {v.priceDiff && v.priceDiff !== 0 ? (
                        <span className="text-caption opacity-70">
                          {v.priceDiff > 0 ? "+" : ""}{formatCurrency(v.priceDiff)}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-small font-semibold text-foreground flex justify-between">
                  <span>Cor / Edição:</span>
                  <span className="text-muted-foreground font-normal">{selectedColor}</span>
                </label>
                <div className="flex gap-3">
                  {colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-small font-medium transition-all ${
                        selectedColor === c.name
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-surface hover:bg-muted"
                      }`}
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-white/20"
                        style={{ backgroundColor: c.hex }}
                      />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Add Actions */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <label className="text-small font-semibold text-foreground">Quantidade:</label>
                <QuantitySelector
                  value={quantity}
                  onChange={setQuantity}
                  max={product.stock}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="flex h-13 items-center justify-center gap-2 rounded-xl border-2 border-primary bg-surface font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground shadow-sm"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Adicionar ao Carrinho
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex h-13 items-center justify-center gap-2 rounded-xl bg-accent font-bold text-accent-foreground shadow-medium transition-all hover:brightness-105 hover:shadow-large"
                >
                  <Zap className="h-5 w-5 fill-current" />
                  Comprar Agora
                </button>
              </div>
            </div>

            {/* Shipping Calculator */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-light space-y-3">
              <div className="flex items-center gap-2 text-small font-semibold text-foreground">
                <Truck className="h-5 w-5 text-brand" />
                <span>Simular valor e prazo de frete:</span>
              </div>
              <form onSubmit={handleCalculateShipping} className="flex gap-2">
                <input
                  type="text"
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => setCep(formatCep(e.target.value))}
                  maxLength={9}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isCalculatingCep}
                  className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-small font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isCalculatingCep ? "Calculando..." : "Calcular"}
                </button>
              </form>

              {/* Shipping dimensions info if available */}
              {(product.shippingWeight || product.shippingLength) && (
                <p className="text-caption text-muted-foreground">
                  Peso aprox.: {product.shippingWeight ?? "—"} kg
                  {product.shippingLength && ` · Dims: ${product.shippingLength}×${product.shippingWidth}×${product.shippingHeight} cm`}
                </p>
              )}

              {shippingOptions && (
                <div className="space-y-2 pt-2 border-t border-border">
                  {shippingOptions.map((opt) => (
                    <div
                      key={opt.title}
                      className="flex items-center justify-between text-small py-1"
                    >
                      <div>
                        <span className="font-medium text-foreground">{opt.title}</span>
                        <p className="text-caption text-muted-foreground">{opt.time}</p>
                      </div>
                      <span className="font-bold text-foreground">
                        {opt.price === 0 ? "Grátis" : formatCurrency(opt.price)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: ShieldCheck, label: "Compra Segura" },
                { icon: Truck, label: "Entrega Rápida" },
                { icon: Star, label: "Qualidade Aperta" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-surface p-3 text-center">
                  <Icon className="h-5 w-5 text-brand" />
                  <span className="text-caption font-semibold text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Tabs: Description, Specs & Reviews */}
        <div className="mt-16 rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-light">
          <div className="flex border-b border-border gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-4 text-h4 font-bold transition-colors relative shrink-0 ${
                activeTab === "description"
                  ? "text-brand"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Descrição Completa
              {activeTab === "description" && (
                <span className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-brand" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-4 text-h4 font-bold transition-colors relative shrink-0 ${
                activeTab === "specs"
                  ? "text-brand"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Especificações Técnicas
              {activeTab === "specs" && (
                <span className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-brand" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-4 text-h4 font-bold transition-colors relative shrink-0 ${
                activeTab === "reviews"
                  ? "text-brand"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Avaliações ({product.reviewsCount})
              {activeTab === "reviews" && (
                <span className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-brand" />
              )}
            </button>
          </div>

          <div className="py-6">
            {activeTab === "description" && (
              <div className="space-y-4 text-body text-muted-foreground leading-relaxed max-w-4xl">
                <p>{product.description}</p>
                {product.shortDescription && (
                  <p className="font-medium text-foreground">{product.shortDescription}</p>
                )}
                <p>
                  Desenvolvido especialmente para entusiastas de setup gamer e cultura geek, este produto alia durabilidade extrema, acabamento premium e funcionalidade impecável. Fabricado com materiais de alta qualidade no Brasil pela Aperta Start.
                </p>
              </div>
            )}

            {activeTab === "specs" && (
              <div className="max-w-3xl">
                {product.specs && product.specs.length > 0 ? (
                  <table className="w-full text-left text-small">
                    <tbody>
                      {product.specs.map((spec, idx) => (
                        <tr key={idx} className={idx < product.specs!.length - 1 ? "border-b border-border" : ""}>
                          <td className="py-3 font-semibold text-foreground w-1/3">{spec.key}</td>
                          <td className="py-3 text-muted-foreground">{spec.value}</td>
                        </tr>
                      ))}
                      {/* Also show shipping dimensions if set */}
                      {product.shippingWeight && (
                        <tr className="border-t border-border">
                          <td className="py-3 font-semibold text-foreground">Peso</td>
                          <td className="py-3 text-muted-foreground">{product.shippingWeight} kg</td>
                        </tr>
                      )}
                      {product.shippingLength && (
                        <tr>
                          <td className="py-3 font-semibold text-foreground">Dimensões (C×L×A)</td>
                          <td className="py-3 text-muted-foreground">
                            {product.shippingLength} × {product.shippingWidth} × {product.shippingHeight} cm
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <p className="text-small">Especificações técnicas não cadastradas para este produto.</p>
                    <p className="text-caption mt-1">O administrador pode adicionar especificações no painel.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6 rounded-xl bg-background p-6 border border-border">
                  <div className="text-center">
                    <span className="text-display text-foreground font-black">{product.rating.toFixed(1)}</span>
                    <div className="flex justify-center text-amber-400 mt-1">
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                    </div>
                    <p className="mt-1 text-caption text-muted-foreground">Baseado em {product.reviewsCount} opiniões</p>
                  </div>
                  <div className="h-full w-px bg-border hidden sm:block" />
                  <div className="flex-1 space-y-2 w-full">
                    {[5, 4, 3, 2, 1].map((stars, idx) => (
                      <div key={stars} className="flex items-center gap-3 text-small">
                        <span className="w-8 font-medium text-foreground">{stars} ★</span>
                        <div className="h-2 flex-1 rounded-full bg-border overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${idx === 0 ? 85 : idx === 1 ? 10 : 5}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-caption text-muted-foreground">
                          {idx === 0 ? "85%" : idx === 1 ? "10%" : "5%"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Example Reviews */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-border p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">Lucas M. — Cliente Verificado</span>
                      <span className="text-caption text-muted-foreground">há 3 dias</span>
                    </div>
                    <div className="flex text-amber-400">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                    <p className="text-small text-muted-foreground">
                      Produto de altíssima qualidade! Chegou super rápido aqui em SP e deixou meu setup incrivelmente organizado. Recomendo demais!
                    </p>
                  </div>
                  <div className="rounded-xl border border-border p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">Beatriz S. — Cliente Verificado</span>
                      <span className="text-caption text-muted-foreground">há 1 semana</span>
                    </div>
                    <div className="flex text-amber-400">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                    <p className="text-small text-muted-foreground">
                      Excelente acabamento e embalagem super bem protegida. Com certeza comprarei mais itens da Aperta Start!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-h3 text-foreground font-extrabold">Produtos Relacionados</h2>
                <p className="text-small text-muted-foreground">Outros itens incríveis para complementar seu setup.</p>
              </div>
              <Link to="/loja" className="text-small font-bold text-brand hover:underline flex items-center gap-1">
                Ver todos <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <ProductGrid products={relatedProducts} columns={4} />
          </div>
        )}
      </Container>
    </MainLayout>
  );
}
