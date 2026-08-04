import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { UserService, type Credentials } from "@/services";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: Credentials) => void;
  signUp: (input: { name: string; email: string; password: string }) => void;
  signOut: () => void;
  updateProfile: (patch: Partial<Pick<User, "name" | "phone" | "avatar">>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.session,
    queryFn: () => UserService.getSession(),
  });

  const sync = (next: User | null) => queryClient.setQueryData(queryKeys.session, next);

  const signIn = useMutation({
    mutationFn: (credentials: Credentials) => UserService.signIn(credentials),
    onSuccess: (user) => {
      sync(user);
      toast.success(`Bem-vindo, ${user.name.split(" ")[0]}!`);
    },
    onError: () => toast.error("Não foi possível entrar. Verifique seus dados."),
  });

  const signUp = useMutation({
    mutationFn: (input: { name: string; email: string; password: string }) =>
      UserService.signUp(input),
    onSuccess: (user) => {
      sync(user);
      toast.success("Conta criada com sucesso");
    },
  });

  const signOut = useMutation({
    mutationFn: () => UserService.signOut(),
    onSuccess: () => sync(null),
  });

  const updateProfile = useMutation({
    mutationFn: (patch: Partial<Pick<User, "name" | "phone" | "avatar">>) =>
      UserService.updateProfile(patch),
    onSuccess: (user) => {
      sync(user);
      toast.success("Perfil atualizado");
    },
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user: data ?? null,
      isAuthenticated: Boolean(data),
      isLoading,
      signIn: (credentials) => signIn.mutate(credentials),
      signUp: (input) => signUp.mutate(input),
      signOut: () => signOut.mutate(),
      updateProfile: (patch) => updateProfile.mutate(patch),
    }),
    [data, isLoading, signIn, signUp, signOut, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return context;
}
