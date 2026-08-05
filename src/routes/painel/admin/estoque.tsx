import { createFileRoute } from "@tanstack/react-router";
import { Boxes } from "lucide-react";
import { AdminLayout, AdminPlaceholderModule } from "@/components/admin";

export const Route = createFileRoute("/painel/admin/estoque")({
  head: () => ({
    meta: [{ title: "Estoque — Painel Aperta Start" }],
  }),
  component: EstoquePage,
});

function EstoquePage() {
  return (
    <AdminLayout>
      <AdminPlaceholderModule
        title="Controle de Estoque"
        category="Operações"
        description="Monitore os níveis de estoque em tempo real, receba alertas de reposição e ajuste quantidades rapidamente."
        icon={Boxes}
      />
    </AdminLayout>
  );
}
