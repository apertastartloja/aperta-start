import { createFileRoute } from "@tanstack/react-router";
import { Truck } from "lucide-react";
import { AdminLayout, AdminPlaceholderModule } from "@/components/admin";

export const Route = createFileRoute("/painel/admin/entregas")({
  head: () => ({
    meta: [{ title: "Entregas — Painel Aperta Start" }],
  }),
  component: EntregasPage,
});

function EntregasPage() {
  return (
    <AdminLayout>
      <AdminPlaceholderModule
        title="Gestão de Entregas & Frete"
        category="Logística"
        description="Configure integrações com Correios e transportadoras, regras de frete grátis e cálculo de prazos."
        icon={Truck}
      />
    </AdminLayout>
  );
}
