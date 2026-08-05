import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { AdminLayout, AdminPlaceholderModule } from "@/components/admin";

export const Route = createFileRoute("/painel/admin/emails")({
  head: () => ({
    meta: [{ title: "E-mails — Painel Aperta Start" }],
  }),
  component: EmailsPage,
});

function EmailsPage() {
  return (
    <AdminLayout>
      <AdminPlaceholderModule
        title="E-mails Transacionais"
        category="Comunicação"
        description="Customize os modelos de e-mail de confirmação de pedido, rastreamento, atualização de status e boas-vindas."
        icon={Mail}
      />
    </AdminLayout>
  );
}
