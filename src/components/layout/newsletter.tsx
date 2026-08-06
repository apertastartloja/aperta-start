import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import mascot from "@/assets/products/action-figure.jpg";
import { Container } from "@/components/common/container";
import { newsletterSchema, type NewsletterValues } from "@/components/forms/schemas";
import { useNewsletterContent } from "@/hooks/useContent";

/** Faixa de captação de e-mail em estilo azul premium. */
export function Newsletter() {
  const { data: content } = useNewsletterContent();
  const form = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: NewsletterValues) => {
    toast.success(`Inscrição confirmada para ${values.email}`);
    form.reset();
  };

  return (
    <section aria-labelledby="newsletter-title" className="py-12 bg-background">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#000B1F] via-[#081838] to-[#030a18] p-8 sm:p-12 text-white shadow-large border border-white/10">
          {/* Luz ambiente sutil de fundo (Ambient Glow) */}
          <div
            className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-[#000B1F]/30 blur-3xl"
            aria-hidden
          />

          <div className="relative z-10 mx-auto max-w-3xl text-center space-y-6">
            {/* Título e Subtítulo centralizados */}
            <div className="space-y-3">
              <h2 id="newsletter-title" className="text-h1 font-extrabold tracking-tight text-white">
                {content?.title ?? "Fique por dentro das novidades do Setup Gamer"}
              </h2>
              <p className="text-body max-w-xl mx-auto text-white/80 font-medium">
                {content?.subtitle ?? "Assine nossa newsletter para receber cupons de desconto, lançamentos antecipados e conteúdos sobre decoração gamer!"}
              </p>
            </div>

            {/* Bloco centralizado único: Formulário + Prova social com mascote */}
            <div className="pt-2 flex flex-col items-center justify-center gap-6">
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex h-14 w-full max-w-md items-center overflow-hidden rounded-2xl bg-white/10 p-1.5 ring-1 ring-white/20 backdrop-blur-md shadow-medium transition-all focus-within:ring-accent"
              >
                <div className="flex items-center gap-2 px-3 text-white/70">
                  <Mail className="size-5 shrink-0" />
                </div>
                <input
                  {...form.register("email")}
                  type="email"
                  placeholder={content?.placeholder ?? "Digite seu melhor e-mail..."}
                  aria-label="Seu melhor e-mail"
                  className="text-small h-full flex-1 bg-transparent text-white outline-none placeholder:text-white/60"
                />
                <button
                  type="submit"
                  aria-label={content?.ctaLabel ?? "Assinar"}
                  className="flex h-11 items-center gap-2 rounded-xl bg-accent px-5 font-bold text-accent-foreground shadow-sm transition-all hover:brightness-110 hover:shadow-accent/20 cursor-pointer shrink-0"
                >
                  <span>{content?.ctaLabel ?? "Inscrever-se"}</span>
                  <ArrowRight className="size-4" />
                </button>
              </form>

              {/* Personagem e prova social integrados no mesmo bloco */}
              <div className="flex items-center gap-3 pt-2">
                <img
                  src={mascot}
                  alt="Mascote Aperta Start"
                  loading="lazy"
                  width={60}
                  height={60}
                  className="size-12 rounded-full object-cover ring-2 ring-accent/60 shadow-md"
                />
                <span className="text-xs text-white/75 font-semibold tracking-wide">
                  Junte-se a +10.000 apaixonados por setups incríveis!
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
