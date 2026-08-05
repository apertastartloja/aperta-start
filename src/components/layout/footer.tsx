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
      { label: "Suportes", href: "/produtos" },
      { label: "Luminárias", href: "/produtos" },
      { label: "Caixas e Organizadores", href: "/produtos" },
      { label: "Action Figures", href: "/produtos" },
      { label: "Chaveiros", href: "/produtos" },
      { label: "Todos os produtos", href: "/produtos" },
    ],
  },
];

const payments = ["Visa", "Master", "Elo", "Amex", "Pix", "Boleto"];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <Container className="grid gap-10 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
        <div className="space-y-5">
          <Logo size="lg" variant="light" />
          <p className="text-small max-w-xs opacity-75">{APP.tagline}</p>
          <div className="flex items-center gap-3">
            {[Instagram, Youtube, Twitch, Facebook].map((SocialIcon, index) => (
              <span
                key={index}
                className="grid size-9 place-items-center rounded-md bg-primary-foreground/10 transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                <SocialIcon className="size-4" aria-hidden />
              </span>
            ))}
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.title} className="space-y-3">
            <p className="text-h4 text-accent">{column.title}</p>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.href as any} className="text-small opacity-75 transition-opacity hover:opacity-100">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="space-y-3">
          <p className="text-h4 text-accent">Formas de pagamento</p>
          <ul className="flex flex-wrap gap-2">
            {payments.map((payment) => (
              <li
                key={payment}
                className="text-[11px] grid h-8 min-w-14 place-items-center rounded-sm bg-primary-foreground px-2 font-bold text-primary"
              >
                {payment}
              </li>
            ))}
          </ul>
          <p className="text-small flex items-center gap-2 opacity-75 pt-2">
            <Mail className="size-4" aria-hidden /> {APP.supportEmail}
          </p>
        </div>
      </Container>

      <div className="border-t border-primary-foreground/10">
        <Container className="text-small flex flex-col items-center justify-between gap-3 py-6 opacity-70 md:flex-row">
          <p>
            © {new Date().getFullYear()} {APP.name}. Todos os direitos reservados.
          </p>
          <p>Desenvolvido com ♥ para gamers</p>
        </Container>
      </div>
    </footer>
  );
}
