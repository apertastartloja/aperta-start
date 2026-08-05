import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ChevronRight,
  Filter,
  SlidersHorizontal,
  X,
  Search,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { ProductCard } from "@/components/product/product-card";
import { mockProducts } from "@/mocks/products.mock";
import { mockCategories } from "@/mocks/categories.mock";

export const Route = createFileRoute("/produtos")({
  head: () => ({
    meta: [
      { title: "Catálogo de Produtos — Aperta Start" },
      {
        name: "description",
        content:
          "Confira nossa linha completa de suportes, luminárias, action figures e kits de decoração gamer.",
      },
    ],
  }),
  component: ProductsCatalogPage,
});

function ProductsCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBadge, setSelectedBadge] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<number>(200);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">(
    "featured"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return mockProducts
      .filter((p) => {
        // Category filter
        if (selectedCategory !== "all" && p.categoryId !== selectedCategory) {
          return false;
        }
        // Badge filter
        if (selectedBadge !== "all" && !p.badges.includes(selectedBadge as any)) {
          return false;
        }
        // Price filter
        if (p.price > priceRange) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = (p.shortDescription ?? "").toLowerCase().includes(q);
          const matchTag = p.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchName && !matchDesc && !matchTag) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        return 0; // featured default
      });
  }, [selectedCategory, selectedBadge, priceRange, sortBy, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedBadge("all");
    setPriceRange(200);
    setSortBy("featured");
    setSearchQuery("");
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
          <span className="font-medium text-foreground">Catálogo de Produtos</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="text-caption font-bold text-brand uppercase tracking-wider">
              Setup & Decoração
            </span>
            <h1 className="text-h1 text-foreground font-extrabold tracking-tight">
              Catálogo de Produtos
            </h1>
            <p className="mt-1 text-small text-muted-foreground">
              Mostrando <strong className="text-foreground">{filteredProducts.length}</strong> de{" "}
              {mockProducts.length} itens disponíveis no estoque.
            </p>
          </div>

          {/* Quick Search & Sort Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar produto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-input bg-surface pl-10 pr-4 py-2.5 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-input bg-surface px-3 py-2.5 text-small font-medium text-foreground focus:border-ring focus:outline-none"
              >
                <option value="featured">Destaques</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
                <option value="rating">Melhor Avaliados</option>
              </select>
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-input bg-surface px-4 py-2.5 text-small font-semibold text-foreground lg:hidden"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </button>
          </div>
        </div>

        {/* Main Grid: Sidebar Filters + Products Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-light space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="text-h4 font-bold text-foreground flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-brand" />
                  Filtros
                </h3>
                <button
                  onClick={handleResetFilters}
                  className="text-caption font-semibold text-brand hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Limpar
                </button>
              </div>

              {/* Category Filter */}
              <div className="space-y-3">
                <h4 className="text-small font-bold text-foreground">Categorias</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full text-left rounded-lg px-3 py-2 text-small font-medium transition-colors ${
                      selectedCategory === "all"
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    Todas as Categorias
                  </button>
                  {mockCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left rounded-lg px-3 py-2 text-small font-medium transition-colors ${
                        selectedCategory === cat.id
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag / Badge Filter */}
              <div className="space-y-3 border-t border-border pt-4">
                <h4 className="text-small font-bold text-foreground">Selo do Produto</h4>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "all", label: "Todos" },
                    { id: "bestseller", label: "Mais Vendidos" },
                    { id: "new", label: "Lançamentos" },
                    { id: "sale", label: "Em Oferta" },
                    { id: "exclusive", label: "Exclusivo" },
                  ].map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBadge(b.id)}
                      className={`rounded-lg border px-3 py-1.5 text-caption font-semibold transition-all ${
                        selectedBadge === b.id
                          ? "border-accent bg-accent text-accent-foreground shadow-sm"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-small font-bold text-foreground">
                  <span>Preço máximo:</span>
                  <span className="text-brand">R$ {priceRange},00</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="10"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-brand cursor-pointer"
                />
                <div className="flex justify-between text-caption text-muted-foreground">
                  <span>R$ 20</span>
                  <span>R$ 200+</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-9 space-y-6">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-h3 font-bold text-foreground">Nenhum produto encontrado</h3>
                <p className="text-small text-muted-foreground max-w-md mx-auto">
                  Não encontramos nenhum item que corresponda aos filtros aplicados. Tente ajustar o preço, a categoria ou limpar a busca.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-small font-bold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  <RotateCcw className="h-4 w-4" />
                  Limpar Todos os Filtros
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs lg:hidden">
          <div className="ml-auto w-full max-w-xs h-full bg-surface p-6 overflow-y-auto space-y-6 flex flex-col justify-between shadow-large">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="text-h4 font-bold text-foreground">Filtros</h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Category Filter Mobile */}
              <div className="space-y-2">
                <h4 className="text-small font-bold text-foreground">Categorias</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full text-left rounded-lg px-3 py-2 text-small font-medium ${
                      selectedCategory === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    Todas as Categorias
                  </button>
                  {mockCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left rounded-lg px-3 py-2 text-small font-medium ${
                        selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-2">
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full rounded-xl bg-accent py-3 text-small font-bold text-accent-foreground shadow-sm"
              >
                Ver Resultados ({filteredProducts.length})
              </button>
              <button
                onClick={handleResetFilters}
                className="w-full rounded-xl border border-border py-2.5 text-small font-semibold text-muted-foreground hover:text-foreground"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
