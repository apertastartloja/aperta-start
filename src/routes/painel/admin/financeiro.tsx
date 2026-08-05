import { createFileRoute } from "@tanstack/react-router";
import { CreditCard } from "lucide-react";
import { AdminLayout, AdminPlaceholderModule } from "@/components/admin";

export const Route = createFileRoute("/painel/admin/financeiro")({
  head: () => ({
    meta: [{ title: "Financeiro — Painel Aperta Start" }],
  }),
  component: FinanceiroPage,
});

function FinanceiroPage() {
  return (
    <AdminLayout>
      <AdminPlaceholderModule
        title="Painel Financeiro"
        category="Finanças"
        description="Visualize o fluxo de caixa, repasses de gateways de pagamento, taxas e relatórios de faturamento."
        icon={CreditCard}
      />
    </AdminLayout>
  );
}
