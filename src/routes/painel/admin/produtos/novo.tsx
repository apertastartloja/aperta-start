import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin";
import { ProductForm } from "@/components/admin/products/product-form";

export const Route = createFileRoute("/painel/admin/produtos/novo")({
  head: () => ({
    meta: [{ title: "Novo Produto — Painel Aperta Start" }],
  }),
  component: NovoProdutoPage,
});

function NovoProdutoPage() {
  return (
    <AdminLayout>
      <ProductForm isEditing={false} />
    </AdminLayout>
  );
}
