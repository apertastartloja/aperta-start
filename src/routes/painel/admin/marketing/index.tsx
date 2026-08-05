import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Megaphone } from "lucide-react";
import { AdminLayout, AdminPlaceholderModule } from "@/components/admin";

export const Route = createFileRoute("/painel/admin/marketing/")({
  head: () => ({
    meta: [{ title: "Marketing — Painel Aperta Start" }],
  }),
  component: MarketingMainPage,
});

function MarketingMainPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/painel/admin/marketing/banners", replace: true });
  }, [navigate]);

  return (
    <AdminLayout>
      <AdminPlaceholderModule
        title="Módulo de Marketing"
        category="Marketing"
        description="Redirecionando para gestão de banners..."
        icon={Megaphone}
      />
    </AdminLayout>
  );
}
