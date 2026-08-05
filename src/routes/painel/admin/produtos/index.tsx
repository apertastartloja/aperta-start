import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ShoppingBag } from "lucide-react";
import { AdminLayout, AdminPlaceholderModule } from "@/components/admin";

export const Route = createFileRoute("/painel/admin/produtos/")({
  head: () => ({
    meta: [{ title: "Produtos — Painel Aperta Start" }],
  }),
  component: ProdutosMainPage,
});

function ProdutosMainPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/painel/admin/produtos/lista", replace: true });
  }, [navigate]);

  return (
    <AdminLayout>
      <AdminPlaceholderModule
        title="Gestão de Produtos"
        category="Produtos"
        description="Redirecionando para o catálogo de produtos..."
        icon={ShoppingBag}
      />
    </AdminLayout>
  );
}
