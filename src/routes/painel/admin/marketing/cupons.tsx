import { createFileRoute } from "@tanstack/react-router";
import { Ticket } from "lucide-react";
import { AdminLayout, AdminPlaceholderModule } from "@/components/admin";

export const Route = createFileRoute("/painel/admin/marketing/cupons")({
  head: () => ({
    meta: [{ title: "Cupons — Painel Aperta Start" }],
  }),
  component: CuponsPage,
});

function CuponsPage() {
  return (
    <AdminLayout>
      <AdminPlaceholderModule
        title="Cupons de Desconto"
        category="Marketing"
        description="Crie e gerencie códigos de cupons com regras de desconto percentual, valor fixo ou frete grátis."
        icon={Ticket}
      />
    </AdminLayout>
  );
}
