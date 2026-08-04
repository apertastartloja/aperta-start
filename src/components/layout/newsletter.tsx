import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import mascot from "@/assets/products/action-figure.jpg";
import { Container } from "@/components/common/container";
import { newsletterSchema, type NewsletterValues } from "@/components/forms/schemas";
import { useNewsletterContent } from "@/hooks/useContent";

/** Faixa de captação de e-mail (seção 9 da Home). */
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
    <section aria-labelledby="newsletter-title" className="overflow-hidden bg-brand text-brand-foreground">
      <Container className="relative flex items-center justify-between gap-10 py-12">
        <div className="max-w-xl space-y-4">
          <h2 id="newsletter-title" className="text-h2">
            {content?.title ?? "Promoções & Novidades"}
          </h2>
          <p className="text-small opacity-90">
            {content?.subtitle ?? "Assine e receba ofertas exclusivas!"}
          </p>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex h-12 w-full max-w-md items-center overflow-hidden rounded-md bg-brand-foreground/12 pl-4 pr-1.5 ring-1 ring-brand-foreground/25"
          >
            <input
              {...form.register("email")}
              type="email"
              placeholder={content?.placeholder ?? "Seu melhor e-mail"}
              aria-label="Seu melhor e-mail"
              className="text-small h-full flex-1 bg-transparent text-brand-foreground outline-none placeholder:text-brand-foreground/70"
            />
            <button
              type="submit"
              aria-label={content?.ctaLabel ?? "Assinar"}
              className="grid size-9 shrink-0 place-items-center rounded-sm bg-accent text-accent-foreground transition-opacity hover:opacity-90"
            >
              <ArrowRight className="size-4" />
            </button>
          </form>
        </div>

        <img
          src={mascot}
          alt=""
          aria-hidden
          loading="lazy"
          width={800}
          height={800}
          className="hidden size-44 shrink-0 rounded-full object-cover ring-8 ring-brand-foreground/10 lg:block"
        />
      </Container>
    </section>
  );
}
