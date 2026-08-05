import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";
import { AdminLayout, AdminPlaceholderModule } from "@/components/admin";

export const Route = createFileRoute("/painel/admin/minha-conta")({
  head: () => ({
    meta: [{ title: "Minha Conta — Painel Aperta Start" }],
  }),
  component: MinhaContaAdminPage,
});

function MinhaContaAdminPage() {
  return (
    <AdminLayout>
      <AdminPlaceholderModule
        title="Minha Conta de Administrador"
        category="Perfil"
        description="Altere seus dados de perfil, credenciais de acesso, fotos de avatar e preferências de notificação."
        icon={User}
      />
    </AdminLayout>
  );
}
