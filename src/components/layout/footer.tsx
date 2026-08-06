import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, Twitch, Youtube } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { Container } from "@/components/common/container";
import { APP } from "@/constants";

const columns = [
  {
    title: "Institucional",
    links: [
      { label: "Sobre nós", href: "/sobre" },
      { label: "Perguntas frequentes", href: "/contato" },
      { label: "Política de privacidade", href: "/politicas" },
      { label: "Trocas e devoluções", href: "/politicas" },
      { label: "Contato", href: "/contato" },
    ],
  },
  {
    title: "Ajuda",
    links: [
      { label: "Minha conta", href: "/minha-conta" },
      { label: "Meus pedidos", href: "/minha-conta" },
      { label: "Formas de pagamento", href: "/checkout" },
      { label: "Prazo de entrega", href: "/contato" },
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

const payments = ["Visa", "Master", "Elo", "Amex", "Pix", "Boleto"];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#000B1F] via-[#05132d] to-[#020714] text-white border-t border-white/10 shadow-large">
      <Container className="grid gap-10 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
        <div className="space-y-5">
          <Logo size="lg" variant="light" />
          <p className="text-small max-w-xs text-white/75 leading-relaxed">{APP.tagline}</p>
          <div className="flex items-center gap-3">
            {[Instagram, Youtube, Twitch, Facebook].map((SocialIcon, index) => (
              <span
                key={index}
                className="grid size-9 place-items-center rounded-xl bg-white/5 border border-white/10 text-white/80 transition-all duration-300 hover:bg-accent hover:text-accent-foreground hover:border-accent hover:scale-105 cursor-pointer shadow-xs"
              >
                <SocialIcon className="size-4" aria-hidden />
              </span>
            ))}
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
          <p className="text-small flex items-center gap-2 text-white/75 pt-2">
            <Mail className="size-4 text-accent" aria-hidden /> {APP.supportEmail}
          </p>
        </div>
      </Container>

      <div className="border-t border-white/10 bg-black/20">
        <Container className="text-small flex items-center justify-center py-6 text-white/60 text-center">
          <p>
            © {new Date().getFullYear()} {APP.name}. Todos os direitos reservados.
          </p>
        </Container>
      </div>
    </footer>
  );
}
