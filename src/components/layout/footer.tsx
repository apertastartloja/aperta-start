import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, Twitch, Youtube } from "lucide-react";
import logo from "@/assets/aperta-start-logo.png.asset.json";
import { Container } from "@/components/common/container";
import { APP, ROUTES } from "@/constants";

const columns = [
  {
    title: "Institucional",
    links: ["Sobre nós", "Perguntas frequentes", "Política de privacidade", "Trocas e devoluções", "Contato"],
  },
  {
    title: "Ajuda",
    links: ["Minha conta", "Meus pedidos", "Formas de pagamento", "Prazo de entrega", "Rastreamento"],
  },
  {
    title: "Categorias",
    links: ["Suportes", "Luminárias", "Caixas e Organizadores", "Action Figures", "Chaveiros", "Todos os produtos"],
  },
];

const payments = ["Visa", "Master", "Elo", "Amex", "Pix", "Boleto"];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <Container className="grid gap-10 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
        <div className="space-y-5">
          <img src={logo.url} alt={APP.name} width={200} height={74} loading="lazy" className="h-10 w-auto" />
          <p className="text-small max-w-xs opacity-75">{APP.tagline}</p>
          <div className="flex items-center gap-3">
            {[Instagram, Youtube, Twitch, Facebook].map((SocialIcon, index) => (
              <span
                key={index}
                className="grid size-9 place-items-center rounded-md bg-primary-foreground/10 transition-colors hover:bg-accent hover:text-accent-foreground"
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
              {column.links.map((label) => (
                <li key={label}>
                  <Link to={ROUTES.home} className="text-small opacity-75 transition-opacity hover:opacity-100">
                    {label}
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
          <p className="text-small flex items-center gap-2 opacity-75">
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
