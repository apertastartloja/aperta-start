import { createFileRoute } from "@tanstack/react-router";
import {
  BenefitsBar,
  HeroCarousel,
  InstitutionalBar,
  KitsSection,
  ProductSection,
} from "@/components/home";
import { MainLayout } from "@/components/layout/main-layout";
import { Newsletter } from "@/components/layout/newsletter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aperta Start — Acessórios e decoração gamer" },
      {
        name: "description",
        content:
          "Suportes, luminárias, action figures e kits gamer com design exclusivo Aperta Start. Frete para todo o Brasil e parcelamento em até 6x.",
      },
      { property: "og:title", content: "Aperta Start — Acessórios e decoração gamer" },
      {
        property: "og:description",
        content: "Eleve seu setup com produtos gamer exclusivos, feitos no Brasil.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <MainLayout withNewsletter={false}>
      <h1 className="sr-only">Aperta Start — acessórios e decoração gamer</h1>

      <HeroCarousel />

      <ProductSection
        slug="destaques"
        title="Destaques"
        description="Os produtos mais amados pela comunidade Aperta Start."
      />

      <ProductSection
        slug="lancamentos"
        title="Lançamentos"
        description="Novidades fresquinhas para o seu setup."
        layout="grid"
        className="bg-surface"
      />

      <BenefitsBar />

      <ProductSection
        slug="mais-vendidos"
        title="Mais vendidos"
        description="O que sai mais rápido da nossa loja."
      />

      <KitsSection />

      <Newsletter />

      <InstitutionalBar />
    </MainLayout>
  );
}
