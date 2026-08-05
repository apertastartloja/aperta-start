import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import { AdminLayout } from "@/components/admin";
import { ProductForm } from "@/components/admin/products/product-form";
import { ProductService } from "@/services/product.service";

export const Route = createFileRoute("/painel/admin/produtos/$id/edit")({
  head: () => ({
    meta: [{ title: "Editar Produto — Painel Aperta Start" }],
  }),
  component: EditProdutoPage,
});

function EditProdutoPage() {
  const { id } = Route.useParams();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => ProductService.getById(id),
  });

  return (
    <AdminLayout>
      {isLoading ? (
        <div className="flex min-h-[60vh] items-center justify-center space-x-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-accent" />
          <span className="font-bold">Carregando dados do produto...</span>
        </div>
      ) : isError || !product ? (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center space-y-3">
          <AlertCircle className="size-10 text-danger" />
          <h2 className="text-h3 font-black text-foreground">Produto não encontrado</h2>
          <p className="text-small text-muted-foreground">
            O produto solicitado não foi localizado no banco de dados do Supabase.
          </p>
        </div>
      ) : (
        <ProductForm initialData={product} isEditing={true} />
      )}
    </AdminLayout>
  );
}
