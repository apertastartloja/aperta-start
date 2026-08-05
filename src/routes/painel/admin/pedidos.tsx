import { createFileRoute } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { AdminLayout, AdminPlaceholderModule } from "@/components/admin";

export const Route = createFileRoute("/painel/admin/pedidos")({
  head: () => ({
    meta: [{ title: "Pedidos — Painel Aperta Start" }],
  }),
  component: PedidosPage,
});

function PedidosPage() {
  return (
    <AdminLayout>
      <AdminPlaceholderModule
        title="Gestão de Pedidos"
        category="Vendas & Operações"
        description="Acompanhe novos pedidos, atualize status de entrega, emita notas fiscais e gerencie cancelamentos ou trocas."
        icon={Package}
      />
    </AdminLayout>
  );
}
