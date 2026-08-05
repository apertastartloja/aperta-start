import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { useAdminAuth } from "@/contexts/admin-auth-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel/admin/")({
  head: () => ({
    meta: [
      { title: "Painel Administrativo — Aperta Start" },
      { name: "description", content: "Acesso restrito para gestão da loja Aperta Start." },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isAdmin, isLoading: isAuthLoading, authError, clearAuthError } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // If already authenticated as admin, redirect to dashboard
  useEffect(() => {
    if (!isAuthLoading && isAdmin) {
      navigate({ to: "/painel/admin/dashboard" });
    }
  }, [isAdmin, isAuthLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!email.trim()) {
      setLocalError("Por favor, informe seu e-mail.");
      return;
    }

    if (!password) {
      setLocalError("Por favor, informe sua senha.");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate({ to: "/painel/admin/dashboard" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#10182a] px-4 py-12 text-foreground relative overflow-hidden">
      {/* Background Lighting Effects */}
      <div className="absolute -top-40 -left-40 size-96 rounded-full bg-brand/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 size-96 rounded-full bg-accent/15 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo & Header Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center gap-3 rounded-2xl bg-surface/10 p-3 backdrop-blur-md border border-white/10 shadow-large">
            <img src={logoImg} alt="Aperta Start" className="h-10 w-auto object-contain" />
            <span className="font-black tracking-tight text-xl uppercase font-display text-white">
              APERTA<span className="text-accent">START</span>
            </span>
          </div>

          <div className="space-y-1 pt-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1 text-caption font-extrabold text-accent uppercase tracking-widest">
              <ShieldCheck className="size-3.5" /> Portal de Gestão
            </span>
            <h1 className="text-h2 font-black text-white tracking-tight">Painel Administrativo</h1>
            <p className="text-small text-slate-400">
              Digite suas credenciais corporativas para acessar o painel.
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="rounded-3xl border border-white/10 bg-surface/95 dark:bg-slate-900/90 backdrop-blur-xl p-8 shadow-2xl space-y-6">
          {/* Error Message Box */}
          {displayError && (
            <div className="flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-danger animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-small">
                <p className="font-bold">Atenção</p>
                <p className="text-danger/90 leading-tight">{displayError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* E-mail Field */}
            <div className="space-y-2">
              <label htmlFor="admin-email" className="text-caption font-bold text-slate-700 dark:text-slate-200">
                E-mail Administrativo
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-slate-400" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  placeholder="apertastart.loja@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (localError) setLocalError(null);
                  }}
                  className="w-full rounded-2xl border border-input bg-background pl-11 pr-4 py-3 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none transition-all shadow-xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="admin-password" className="text-caption font-bold text-slate-700 dark:text-slate-200">
                  Senha de Acesso
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-slate-400" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (localError) setLocalError(null);
                  }}
                  className="w-full rounded-2xl border border-input bg-background pl-11 pr-11 py-3 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isAuthLoading}
              className={cn(
                "w-full flex items-center justify-center gap-2.5 rounded-2xl bg-accent py-3.5 text-small font-black text-accent-foreground shadow-large hover:brightness-105 transition-all mt-6 cursor-pointer",
                (isSubmitting || isAuthLoading) && "opacity-80 cursor-not-allowed"
              )}
            >
              {isSubmitting || isAuthLoading ? (
                <>
                  <Loader2 className="size-4.5 animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Painel</span>
                  <ArrowRight className="size-4.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Footer Note */}
        <div className="text-center text-caption text-slate-400 space-y-1">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="size-4 text-accent" /> Autenticação via Supabase Auth
          </p>
          <p className="text-[11px] opacity-75">Apenas administradores autorizados têm acesso a esta área.</p>
        </div>
      </div>
    </div>
  );
}
