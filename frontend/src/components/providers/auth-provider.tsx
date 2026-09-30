"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, loginRequest } from "@/lib/api/client";
import type { Usuario } from "@/types/api";

type AuthState = {
  token: string | null;
  usuario: Usuario | null;
  cargando: boolean;
  iniciarSesion: (username: string, password: string) => Promise<void>;
  cerrarSesion: () => void;
};
const AuthContext = createContext<AuthState | null>(null);
const TOKEN_KEY = "academia.token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const storedToken = sessionStorage.getItem(TOKEN_KEY);
    if (!storedToken) { setCargando(false); return; }
    setToken(storedToken);
    apiRequest<Usuario>("/auth/me", storedToken).then(setUsuario)
      .catch(() => { sessionStorage.removeItem(TOKEN_KEY); setToken(null); })
      .finally(() => setCargando(false));
  }, []);

  async function iniciarSesion(username: string, password: string) {
    const result = await loginRequest(username, password);
    sessionStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
    setUsuario(result.usuario);
  }
  function cerrarSesion() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUsuario(null);
  }

  const value = useMemo(() => ({ token, usuario, cargando, iniciarSesion, cerrarSesion }), [token, usuario, cargando]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider.");
  return context;
}
