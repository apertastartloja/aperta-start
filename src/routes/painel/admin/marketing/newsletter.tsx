import { createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { AdminLayout, AdminPlaceholderModule } from "@/components/admin";

export const Route = createFileRoute("/painel/admin/marketing/newsletter")({
  head: () => ({
    meta: [{ title: "Newsletter — Painel Aperta Start" }],
  }),
  component: NewsletterPage,
});

function NewsletterPage() {
  return (
    <AdminLayout>
      <AdminPlaceholderModule
        title="Assinantes de Newsletter"
        category="Marketing"
        description="Exporte a lista de e-mails cadastrados na newsletter e configure campanhas promocionais automatizadas."
        icon={Send}
      />
    </AdminLayout>
  );
}
