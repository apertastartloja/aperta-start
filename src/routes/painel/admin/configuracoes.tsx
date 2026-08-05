import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { AdminLayout, AdminPlaceholderModule } from "@/components/admin";

export const Route = createFileRoute("/painel/admin/configuracoes")({
  head: () => ({
    meta: [{ title: "Configurações — Painel Aperta Start" }],
  }),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  return (
    <AdminLayout>
      <AdminPlaceholderModule
        title="Configurações Gerais"
        category="Sistema"
        description="Ajuste informações da loja, dados fiscais, métodos de pagamento, chaves de API e temas do painel."
        icon={Settings}
      />
    </AdminLayout>
  );
}
