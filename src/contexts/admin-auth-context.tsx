import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const ADMIN_EMAIL = "apertastart.loja@gmail.com";

interface AdminAuthContextValue {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const isAdminUser = (email?: string | null) => {
    if (!email) return false;
    return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
  };

  useEffect(() => {
    let isMounted = true;

    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (!isMounted) return;
      if (error) {
        console.error("Erro ao verificar sessão Supabase:", error);
      }

      if (initialSession?.user) {
        if (isAdminUser(initialSession.user.email)) {
          setSession(initialSession);
          setUser(initialSession.user);
        } else {
          // Unauthorized email: purge session immediately
          supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setAuthError("Acesso não autorizado.");
        }
      } else {
        setSession(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;

      if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (currentSession?.user) {
        if (isAdminUser(currentSession.user.email)) {
          setSession(currentSession);
          setUser(currentSession.user);
          setAuthError(null);
        } else {
          // Unauthorized email: immediate logout & session clearance
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setAuthError("Acesso não autorizado.");
          toast.error("Acesso não autorizado.");
        }
      } else {
        setSession(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (error) {
        let msg = "Credenciais inválidas. Verifique seu e-mail e senha.";
        if (error.message.includes("Invalid login credentials")) {
          msg = "E-mail ou senha incorretos.";
        } else if (error.message.includes("Email not confirmed")) {
          msg = "E-mail ainda não confirmado.";
        }
        setAuthError(msg);
        toast.error(msg);
        setIsLoading(false);
        return false;
      }

      if (data.user) {
        if (!isAdminUser(data.user.email)) {
          // Email mismatch: enforce immediate logout
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          const errorMsg = "Acesso não autorizado.";
          setAuthError(errorMsg);
          toast.error(errorMsg);
          setIsLoading(false);
          return false;
        }

        setSession(data.session);
        setUser(data.user);
        toast.success("Login administrativo realizado com sucesso!");
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (err: any) {
      console.error("Erro inesperado no login:", err);
      const msg = err?.message || "Ocorreu um erro ao realizar o login.";
      setAuthError(msg);
      toast.error(msg);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    } finally {
      setSession(null);
      setUser(null);
      setAuthError(null);
      setIsLoading(false);
    }
  };

  const clearAuthError = () => setAuthError(null);

  const isAdmin = Boolean(user && isAdminUser(user.email));

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isLoading,
        authError,
        login,
        logout,
        clearAuthError,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth deve ser utilizado dentro de um AdminAuthProvider");
  }
  return context;
}
