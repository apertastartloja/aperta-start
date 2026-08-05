import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Mail, User as UserIcon, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuthContext } from "@/contexts/auth-context";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar ou Criar Conta — Aperta Start" },
      { name: "description", content: "Acesse sua conta para ver pedidos, rastreamentos e ofertas exclusivas." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp, isAuthenticated } = useAuthContext();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");

  if (isAuthenticated) {
    navigate({ to: "/minha-conta" });
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    signIn({ email, password });
    navigate({ to: "/minha-conta" });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    signUp({ name, email, password });
    navigate({ to: "/minha-conta" });
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <span className="text-caption font-extrabold text-brand uppercase tracking-wider">
              Sua Conta Aperta Start
            </span>
            <h1 className="text-h1 font-black text-foreground">
              {activeTab === "login" ? "Bem-vindo de volta!" : "Crie sua conta gamer"}
            </h1>
            <p className="text-small text-muted-foreground">
              {activeTab === "login"
                ? "Acesse seus pedidos, acompanhe entregas e receba ofertas VIP."
                : "Cadastre-se para acumular pontos e ter checkout ultrarrápido."}
            </p>
          </div>

          {/* Card with Tabs */}
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-medium space-y-6">
            {/* Tab switcher */}
            <div className="grid grid-cols-2 rounded-xl bg-background p-1 border border-border">
              <button
                onClick={() => setActiveTab("login")}
                className={`rounded-lg py-2.5 text-small font-bold transition-all ${
                  activeTab === "login"
                    ? "bg-surface text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => setActiveTab("register")}
                className={`rounded-lg py-2.5 text-small font-bold transition-all ${
                  activeTab === "register"
                    ? "bg-surface text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Criar Conta
              </button>
            </div>

            {/* Login Form */}
            {activeTab === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-caption font-semibold text-foreground">Seu E-mail</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      placeholder="seu.email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <label className="text-caption font-semibold text-foreground">Sua Senha</label>
                    <a href="#esqueceu" className="text-caption font-semibold text-brand hover:underline">
                      Esqueceu a senha?
                    </a>
                  </div>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-small font-bold text-accent-foreground shadow-medium hover:brightness-105 transition-all mt-6"
                >
                  Entrar na Minha Conta
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-caption font-semibold text-foreground">Nome Completo</label>
                  <div className="relative mt-1">
                    <UserIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Lucas Gabriel Silveira"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-caption font-semibold text-foreground">E-mail</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      placeholder="seu.email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-caption font-semibold text-foreground">Senha de Acesso</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      placeholder="No mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-small text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input type="checkbox" id="terms" required className="mt-1 accent-brand rounded cursor-pointer" />
                  <label htmlFor="terms" className="text-caption text-muted-foreground leading-tight cursor-pointer">
                    Li e concordo com os <span className="text-foreground underline">Termos de Uso</span> e a <span className="text-foreground underline">Política de Privacidade</span> da Aperta Start.
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-small font-bold text-primary-foreground shadow-medium hover:bg-primary/90 transition-all mt-6"
                >
                  Criar Minha Conta Grátis
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>

          {/* Security guarantee footer */}
          <div className="flex items-center justify-center gap-2 text-caption text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Dados protegidos por criptografia SSL de 256 bits</span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
