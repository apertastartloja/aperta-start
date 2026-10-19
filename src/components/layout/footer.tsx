import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, Twitch, Youtube } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { Container } from "@/components/common/container";
import { APP } from "@/constants";

interface FooterLink {
  label: string;
  href: string;
  search?: Record<string, unknown>;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const columns: FooterColumn[] = [
  {
    title: "Institucional",
    links: [
      { label: "Sobre nós", href: "/sobre" },
      { label: "Perguntas frequentes", href: "/contato" },
      { label: "Política de privacidade", href: "/politicas", search: { tab: "privacy" } },
      { label: "Trocas e devoluções", href: "/politicas", search: { tab: "exchanges" } },
      { label: "Contato", href: "/contato" },
    ],
  },
  {
    title: "Ajuda",
    links: [
      { label: "Minha conta", href: "/minha-conta" },
      { label: "Meus pedidos", href: "/minha-conta" },
      { label: "Formas de pagamento", href: "/politicas", search: { tab: "payments" } },
      { label: "Prazo de entrega", href: "/politicas", search: { tab: "shipping" } },
      { label: "Rastreamento", href: "/minha-conta" },
    ],
  },
  {
    title: "Categorias",
    links: [
      { label: "Suportes", href: "/loja" },
      { label: "Luminárias", href: "/loja" },
      { label: "Caixas e Organizadores", href: "/loja" },
      { label: "Action Figures", href: "/loja" },
      { label: "Chaveiros", href: "/loja" },
      { label: "Todos os produtos", href: "/loja" },
    ],
  },
];

const payments = ["Visa", "Master", "Elo", "Amex", "Pix"];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#000B1F] via-[#05132d] to-[#020714] text-white border-t border-white/10 shadow-large">
      <Container className="grid gap-10 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
        <div className="space-y-5">
          <Logo size="lg" variant="light" />
          <p className="text-small max-w-xs text-white/75 leading-relaxed">{APP.tagline}</p>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {/* Instagram Oficial */}
              <a
                href={APP.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram ${APP.instagramHandle}`}
                title={`Siga a loja no Instagram ${APP.instagramHandle}`}
                className="grid size-9 place-items-center rounded-xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white transition-all duration-300 hover:scale-110 shadow-xs"
              >
                <Instagram className="size-4" aria-hidden />
              </a>

              {/* Redes futuras / inativas */}
              <span
                className="grid size-9 place-items-center rounded-xl bg-white/5 border border-white/10 text-white/30 cursor-not-allowed shadow-xs"
                title="Canal em breve"
              >
                <Youtube className="size-4" aria-hidden />
              </span>
              <span
                className="grid size-9 place-items-center rounded-xl bg-white/5 border border-white/10 text-white/30 cursor-not-allowed shadow-xs"
                title="Canal em breve"
              >
                <Twitch className="size-4" aria-hidden />
              </span>
              <span
                className="grid size-9 place-items-center rounded-xl bg-white/5 border border-white/10 text-white/30 cursor-not-allowed shadow-xs"
                title="Página em breve"
              >
                <Facebook className="size-4" aria-hidden />
              </span>
            </div>

            <div>
              <a
                href={APP.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white transition-colors group"
              >
                <Instagram className="size-3.5 text-pink-400 group-hover:scale-110 transition-transform" />
                <span>{APP.instagramHandle}</span>
              </a>
            </div>
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.title} className="space-y-4">
            <p className="text-h4 text-[#FFC933] font-bold tracking-wide drop-shadow-[0_0_8px_rgba(255,201,51,0.25)]">
              {column.title}
            </p>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href as any}
                    search={link.search as any}
                    className="text-small text-white/70 transition-all duration-200 hover:text-white hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="space-y-4">
          <p className="text-h4 text-[#FFC933] font-bold tracking-wide drop-shadow-[0_0_8px_rgba(255,201,51,0.25)]">
            Formas de pagamento
          </p>
          <ul className="flex flex-wrap gap-2">
            {payments.map((payment) => (
              <li
                key={payment}
                className="text-[11px] grid h-8 min-w-14 place-items-center rounded-lg border border-white/15 bg-white/10 px-2.5 font-bold text-white shadow-xs backdrop-blur-xs"
              >
                {payment}
              </li>
            ))}
          </ul>
          <div className="space-y-1.5 pt-2">
            <p className="text-small flex items-center gap-2 text-white/75">
              <Mail className="size-4 text-accent shrink-0" aria-hidden /> {APP.supportEmail}
            </p>
            <p className="text-small flex items-center gap-2 text-white/75">
              <Instagram className="size-4 text-pink-400 shrink-0" aria-hidden />
              <a
                href={APP.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                {APP.instagramHandle}
              </a>
            </p>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10 bg-black/20">
        <Container className="text-small flex items-center justify-center py-6 text-white/60 text-center">
          <p>
            © {new Date().getFullYear()} {APP.name} • CNPJ: 68.689.135/0004-40 • Todos os direitos reservados.
          </p>
        </Container>
      </div>
    </footer>
  );
}
