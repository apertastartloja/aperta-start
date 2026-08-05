import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { AdminLayout, AdminPlaceholderModule } from "@/components/admin";

export const Route = createFileRoute("/painel/admin/clientes")({
  head: () => ({
    meta: [{ title: "Clientes — Painel Aperta Start" }],
  }),
  component: ClientesPage,
});

function ClientesPage() {
  return (
    <AdminLayout>
      <AdminPlaceholderModule
        title="Gestão de Clientes"
        category="Relacionamento"
        description="Visualize o histórico de compras dos clientes, dados de contato, grupo de compradores e comportamento."
        icon={Users}
      />
    </AdminLayout>
  );
}
