import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch, getToken, setToken } from "@/lib/api";

//Tipos de usuário:
export type Role = 'RECICLADOR' | 'COLETOR';
//Estrutura de um usuário:
export type User = {
  id: number;
  name: string;
  email: string;
  role: Role
} | null;

//Contexto:
const AuthCtx = createContext<{
  user: User;
  setAuth: (token: string, user?: User) => void;
  logout: () => void;
  isLoading: boolean;
}>({ user: null, setAuth: () => {}, logout: () => {}, isLoading: true });

//Função de provider de autenticação:
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  //Função de manter o login:
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    apiFetch<User>("/api/me")
      .then(setUser)
      .catch(() => {
        logout();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  //Função de realizar autenticação:
  function setAuth(token: string, u?: User) {
    setToken(token);
    setIsLoading(false);
    if (u) setUser(u);
    else apiFetch<User>("/api/me").then(setUser).catch(logout).finally(() => setIsLoading(false));
  }

  //Função de logout:
  function logout() {
    localStorage.removeItem("reciclatech_token");
    setUser(null);
    setIsLoading(false);
  }

  return (
    <AuthCtx.Provider value={{ user, setAuth, logout, isLoading }}>{children}</AuthCtx.Provider>
  );
}

//Função de usar a autenticação:
export function useAuth() {
  return useContext(AuthCtx);
}
