"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AcademyWordmark } from "@/components/brand/academy-wordmark";

export function LoginForm() {
  const router = useRouter();
  const { iniciarSesion } = useAuth();
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setEnviando(true);
    const form = new FormData(event.currentTarget);
    try {
      await iniciarSesion(String(form.get("id_acceso")), String(form.get("password")));
      router.replace("/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo validar la cuenta.");
    } finally {
      setEnviando(false);
    }
  }

  return <main className="login-layout">
    <section className="login-brand-panel">
      <div className="brand-lockup"><AcademyWordmark width={230} height={54} /></div>
      <div className="login-brand-copy"><span className="eyebrow light">PLATAFORMA ACADÉMICA</span><h1>Tu academia,<br />bien organizada.</h1><p>Un espacio único para gestionar el trabajo académico y administrativo.</p></div>
      <small className="login-footer">Sistema de gestión académica</small>
    </section>
    <section className="login-form-panel"><div className="login-toolbar"><ThemeToggle /></div><div className="login-card">
      <span className="eyebrow">ACCESO SEGURO</span><h2>Iniciar sesión</h2><p>Ingresa tu ID de acceso y la contraseña asignada.</p>
      <form onSubmit={submit} className="form-stack">
        <label>ID de acceso<input name="id_acceso" type="text" inputMode="numeric" autoComplete="username" required pattern="[0-9]{9}" maxLength={9} minLength={9} placeholder="Ej. 001609191" /></label>
        <label>Contraseña<input name="password" type="password" autoComplete="current-password" required placeholder="Tu contraseña" /></label>
        {error && <div className="alert error" role="alert">{error}</div>}
        <button className="button primary full" disabled={enviando}>{enviando ? "Verificando…" : "Entrar al sistema"}</button>
      </form>
    </div></section>
  </main>;
}
