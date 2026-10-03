import type { ApiEnvelope, Usuario } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function apiRequest<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
    cache: "no-store",
  });
  const payload = (await response.json()) as ApiEnvelope<T> & { message?: string };
  if (!response.ok || !payload.success) {
    if (response.status === 403) throw new Error("No se pudo completar la solicitud.");
    throw new Error(payload.message || `La solicitud falló (${response.status}).`);
  }
  return payload.data;
}

export async function loginRequest(id_acceso: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_acceso, password }),
    cache: "no-store",
  });
  const payload = await response.json();
  if (!response.ok || !payload.success) throw new Error(payload.message || "No se pudo iniciar sesión.");
  return payload.data as { token: string; usuario: Usuario };
}
