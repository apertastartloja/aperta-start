import type { ReactNode } from "react";
import { Footer } from "./footer";
import { Header } from "./header";
import { Newsletter } from "./newsletter";

/**
 * Casca padrão das páginas (as telas serão criadas nas próximas etapas).
 */
export function MainLayout({
  children,
  withNewsletter = true,
}: {
  children: ReactNode;
  withNewsletter?: boolean | undefined;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      {withNewsletter ? <Newsletter /> : null}
      <Footer />
    </div>
  );
}
