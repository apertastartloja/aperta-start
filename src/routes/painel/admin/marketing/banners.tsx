import { createFileRoute } from "@tanstack/react-router";
import { Image } from "lucide-react";
import { AdminLayout, AdminPlaceholderModule } from "@/components/admin";

export const Route = createFileRoute("/painel/admin/marketing/banners")({
  head: () => ({
    meta: [{ title: "Banners — Painel Aperta Start" }],
  }),
  component: BannersPage,
});

function BannersPage() {
  return (
    <AdminLayout>
      <AdminPlaceholderModule
        title="Banners & Vitrines"
        category="Marketing"
        description="Gerencie os banners principais da home, popups promocionais e carrosséis da loja virtual."
        icon={Image}
      />
    </AdminLayout>
  );
}
