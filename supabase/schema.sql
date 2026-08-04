-- ========================================================
-- Aperta Start — Esquema do Banco de Dados Supabase (DDL & Seed)
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------
-- 1. Tabela: Categories (Categorias)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image TEXT,
    parent_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    "order" INT DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública de categorias" ON public.categories FOR SELECT USING (true);

-- --------------------------------------------------------
-- 2. Tabela: Products (Produtos)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sku TEXT UNIQUE,
    description TEXT NOT NULL,
    short_description TEXT,
    price NUMERIC(10,2) NOT NULL,
    compare_at_price NUMERIC(10,2),
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    collection_ids JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    badges JSONB DEFAULT '[]'::jsonb,
    rating NUMERIC(3,2) DEFAULT 5.0,
    reviews_count INT DEFAULT 0,
    stock INT DEFAULT 0,
    variants JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública de produtos" ON public.products FOR SELECT USING (true);

-- --------------------------------------------------------
-- 3. Tabela: Banners (Banners editoriais)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.banners (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    image TEXT NOT NULL,
    cta_label TEXT,
    cta_href TEXT,
    placement TEXT NOT NULL CHECK (placement IN ('hero', 'strip', 'category', 'sidebar')),
    "order" INT DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública de banners" ON public.banners FOR SELECT USING (true);

-- --------------------------------------------------------
-- 4. Tabela: Testimonials (Depoimentos)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.testimonials (
    id TEXT PRIMARY KEY,
    author TEXT NOT NULL,
    role TEXT,
    avatar TEXT,
    rating INT DEFAULT 5,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública de depoimentos" ON public.testimonials FOR SELECT USING (true);

-- --------------------------------------------------------
-- 5. Tabela: Carts (Carrinho de compras)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.carts (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    items JSONB DEFAULT '[]'::jsonb,
    coupon_code TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso ao próprio carrinho" ON public.carts FOR ALL USING (true);

-- --------------------------------------------------------
-- 6. Tabela: Orders (Pedidos)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    items JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending',
    subtotal NUMERIC(10,2) NOT NULL,
    shipping NUMERIC(10,2) DEFAULT 0,
    discount NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    shipping_address JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso aos próprios pedidos" ON public.orders FOR ALL USING (true);

-- --------------------------------------------------------
-- 7. Tabela: Wishlists (Lista de Desejos)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wishlists (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    items JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso à própria wishlist" ON public.wishlists FOR ALL USING (true);


-- ========================================================
-- SEED DATA (Categorias e Produtos Iniciais)
-- ========================================================

INSERT INTO public.categories (id, name, slug, description, parent_id, "order", featured) VALUES
('cat-1', 'Suportes', 'suportes', 'Suportes para controles, headsets e periféricos do seu setup.', NULL, 1, true),
('cat-2', 'Luminárias', 'luminarias', 'Luminárias e itens de iluminação para o ambiente gamer.', NULL, 2, true),
('cat-3', 'Caixas e Organizadores', 'caixas-e-organizadores', 'Caixas temáticas para organizar cabos, jogos e acessórios.', NULL, 3, true),
('cat-4', 'Action Figures', 'action-figures', 'Colecionáveis para exibir sua paixão pelos games.', NULL, 4, true),
('cat-5', 'Chaveiros', 'chaveiros', 'Chaveiros retrô para levar o game para todo lugar.', NULL, 5, false),
('cat-1-1', 'Suporte de Controle', 'suporte-de-controle', NULL, 'cat-1', 1, false),
('cat-1-2', 'Suporte de Headset', 'suporte-de-headset', NULL, 'cat-1', 2, false),
('cat-2-1', 'Luminárias Decorativas', 'luminarias-decorativas', NULL, 'cat-2', 1, false),
('cat-2-2', 'Painéis de LED', 'paineis-de-led', NULL, 'cat-2', 2, false),
('cat-3-1', 'Porta-Trecos', 'porta-trecos', NULL, 'cat-3', 1, false),
('cat-4-1', 'Figures Clássicos', 'figures-classicos', NULL, 'cat-4', 1, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, slug, sku, description, short_description, price, compare_at_price, category_id, collection_ids, badges, rating, reviews_count, stock, tags) VALUES
('prd-1', 'Suporte Duplo para Controles', 'suporte-duplo-para-controles', 'APS-1000', 'Acessório Aperta Start com design exclusivo.', 'Organiza dois controles com base antiderrapante.', 69.90, 89.90, 'cat-1-1', '["col-destaques", "col-mais-vendidos"]'::jsonb, '["new", "bestseller"]'::jsonb, 4.9, 214, 34, '["suporte", "controle", "setup"]'::jsonb),
('prd-2', 'Chaveiro Controle 8-Bits', 'chaveiro-controle-8-bits', 'APS-1001', 'Acessório Aperta Start com design exclusivo.', 'Chaveiro em relevo inspirado nos consoles clássicos.', 24.90, NULL, 'cat-5', '["col-destaques", "col-mais-vendidos"]'::jsonb, '["new"]'::jsonb, 4.7, 320, 180, '["chaveiro", "retro", "8-bits"]'::jsonb),
('prd-3', 'Action Figure Crash Bandicoot', 'action-figure-crash-bandicoot', 'APS-1002', 'Acessório Aperta Start com design exclusivo.', 'Colecionável com base preta e pintura à mão.', 129.90, NULL, 'cat-4-1', '["col-destaques", "col-colecionaveis"]'::jsonb, '["new", "exclusive"]'::jsonb, 4.8, 76, 22, '["colecionavel", "figure"]'::jsonb),
('prd-4', 'Luminária Bloco de Interrogação', 'luminaria-bloco-de-interrogacao', 'APS-1003', 'Acessório Aperta Start com design exclusivo.', 'Luz quente com toque na base e cabo USB.', 89.90, 109.90, 'cat-2-1', '["col-destaques", "col-mais-vendidos", "col-decoracao"]'::jsonb, '["new", "bestseller"]'::jsonb, 4.9, 189, 40, '["luminaria", "decoracao"]'::jsonb),
('prd-5', 'Porta Headset Play', 'porta-headset-play', 'APS-1004', 'Acessório Aperta Start com design exclusivo.', 'Suporte em aço com acabamento fosco.', 79.90, NULL, 'cat-1-2', '["col-destaques", "col-mais-vendidos"]'::jsonb, '[]'::jsonb, 4.6, 143, 55, '["headset", "suporte"]'::jsonb),
('prd-6', 'Caixa Donkey Kong Porta-Trecos', 'caixa-donkey-kong-porta-trecos', 'APS-1005', 'Acessório Aperta Start com design exclusivo.', 'Barril em madeira para cabos e acessórios.', 99.90, NULL, 'cat-3-1', '["col-lancamentos", "col-decoracao"]'::jsonb, '["new"]'::jsonb, 4.7, 54, 30, '["caixa", "organizador"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
