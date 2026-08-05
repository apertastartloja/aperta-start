import { createFileRoute } from "@tanstack/react-router";
import { BarChart2 } from "lucide-react";
import { AdminLayout, AdminPlaceholderModule } from "@/components/admin";

export const Route = createFileRoute("/painel/admin/relatorios")({
  head: () => ({
    meta: [{ title: "Relatórios — Painel Aperta Start" }],
  }),
  component: RelatoriosPage,
});

function RelatoriosPage() {
  return (
    <AdminLayout>
      <AdminPlaceholderModule
        title="Relatórios & Métricas"
        category="Inteligência"
        description="Gere relatórios detalhados de vendas, margem de lucro, produtos mais rentáveis e taxa de conversão."
        icon={BarChart2}
      />
    </AdminLayout>
  );
}
