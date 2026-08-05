import type { LucideIcon } from "lucide-react";
import { Sparkles, Clock, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface AdminPlaceholderModuleProps {
  title: string;
  category?: string;
  description: string;
  icon: LucideIcon;
}

export function AdminPlaceholderModule({
  title,
  category = "Módulo Administrativo",
  description,
  icon: Icon,
}: AdminPlaceholderModuleProps) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full rounded-3xl border border-border bg-surface p-8 shadow-large relative overflow-hidden">
        {/* Background Decorative Glow */}
        <div className="absolute -top-16 -right-16 size-48 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-brand/10 blur-3xl pointer-events-none" />

        {/* Top Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-caption font-black text-amber-600 dark:text-amber-400 mb-6">
          <Clock className="size-3.5 animate-pulse" />
          <span>Em breve</span>
        </div>

        {/* Icon Header */}
        <div className="mx-auto mb-6 grid size-20 place-items-center rounded-2xl border border-border bg-background shadow-medium text-primary">
          <Icon className="size-10" />
        </div>

        {/* Titles & Category */}
        <span className="text-caption font-extrabold text-brand uppercase tracking-wider block mb-1">
          {category}
        </span>
        <h1 className="text-h2 font-black text-foreground mb-3">{title}</h1>
        <p className="text-small text-muted-foreground leading-relaxed mb-8">
          {description}
        </p>

        {/* Card Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/painel/admin/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-small font-extrabold text-accent-foreground shadow-medium hover:brightness-105 transition-all"
          >
            <ArrowLeft className="size-4" />
            Voltar ao Dashboard
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-2 text-[12px] text-muted-foreground">
          <Sparkles className="size-3.5 text-accent" />
          <span>Este módulo será liberado na próxima etapa do desenvolvimento.</span>
        </div>
      </div>
    </div>
  );
}
