import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ShieldCheck, Heart, Users, Award, ChevronRight, ArrowRight } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { APP } from "@/constants";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre Nós — Aperta Start" },
      { name: "description", content: "Conheça a história e o propósito da Aperta Start, criando acessórios gamer exclusivos no Brasil." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-16">
        {/* Breadcrumb */}
        <nav className="flex items-center text-small text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            Início
          </Link>
          <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground/60" />
          <span className="font-medium text-foreground">Sobre Nós</span>
        </nav>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary via-primary to-surface p-8 sm:p-12 text-primary-foreground shadow-large">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3.5 py-1 text-caption font-extrabold text-accent">
              <Sparkles className="h-3.5 w-3.5" /> De Gamer para Gamer
            </span>
            <h1 className="text-display font-black tracking-tight leading-none text-white">
              Elevando o seu setup ao próximo nível.
            </h1>
            <p className="text-body text-primary-foreground/80 leading-relaxed">
              A Aperta Start nasceu do desejo de transformar cantinhos de jogo em verdadeiras estações de batalhas inesquecíveis. Criamos suportes, luminárias e organizadores exclusivos, produzidos com orgulho no Brasil.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-border bg-surface p-6 text-center space-y-1 shadow-light">
            <span className="text-display font-black text-brand">+15.000</span>
            <p className="text-caption font-bold text-foreground">Setups Equipados</p>
            <p className="text-[11px] text-muted-foreground">Entregues em todo o país</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 text-center space-y-1 shadow-light">
            <span className="text-display font-black text-accent">100%</span>
            <p className="text-caption font-bold text-foreground">Fabricação Nacional</p>
            <p className="text-[11px] text-muted-foreground">Design e materiais do Brasil</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 text-center space-y-1 shadow-light">
            <span className="text-display font-black text-emerald-500">4.9★</span>
            <p className="text-caption font-bold text-foreground">Nota de Satisfação</p>
            <p className="text-[11px] text-muted-foreground">Baseado em +2.000 avaliações</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 text-center space-y-1 shadow-light">
            <span className="text-display font-black text-brand">24h</span>
            <p className="text-caption font-bold text-foreground">Despacho Rápido</p>
            <p className="text-[11px] text-muted-foreground">Agilidade na postagem</p>
          </div>
        </div>

        {/* Brand Pillars */}
        <div className="space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-caption font-bold text-brand uppercase tracking-wider">Nossos Pilares</span>
            <h2 className="text-h1 font-extrabold text-foreground">Por que escolher a Aperta Start?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-border bg-surface p-6 space-y-3 shadow-light hover:shadow-medium transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-h4 font-bold text-foreground">Design Autoral & Exclusivo</h3>
              <p className="text-small text-muted-foreground leading-relaxed">
                Nossos produtos não são genéricos. Cada peça é projetada do zero pensando em ergonomia, estilo retro/cyberpunk e encaixe perfeito para seus periféricos.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 space-y-3 shadow-light hover:shadow-medium transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground">
                <ShieldCheck className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="text-h4 font-bold text-foreground">Durabilidade & Acabamento Premium</h3>
              <p className="text-small text-muted-foreground leading-relaxed">
                Utilizamos polímeros de alta densidade e acabamento especial resistente a poeira e riscos, garantindo que seu suporte dure por muitos anos.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6 space-y-3 shadow-light hover:shadow-medium transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-h4 font-bold text-foreground">Atendimento Humanizado</h3>
              <p className="text-small text-muted-foreground leading-relaxed">
                Nossa equipe é formada por apaixonados por games. Qualquer dúvida ou necessidade de suporte é tratada com total prioridade e carinho.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="rounded-3xl bg-surface border border-border p-8 sm:p-12 text-center space-y-4 shadow-light">
          <h2 className="text-h2 font-black text-foreground">Pronto para transformar seu espaço?</h2>
          <p className="text-small text-muted-foreground max-w-lg mx-auto">
            Confira nossos lançamentos, kits promocionais e suportes de edição limitada.
          </p>
          <div className="pt-2">
            <Link
              to="/produtos"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-small font-extrabold text-accent-foreground shadow-medium hover:brightness-105 transition-all"
            >
              Explorar Todos os Produtos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
