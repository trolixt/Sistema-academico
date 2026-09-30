"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import Image from "next/image";
import { ThemeToggle } from "@/components/layout/theme-toggle";

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
      await iniciarSesion(String(form.get("usuario")), String(form.get("password")));
      router.replace("/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo validar la cuenta.");
    } finally {
      setEnviando(false);
    }
  }

  return <main className="login-layout">
    <section className="login-brand-panel">
      <div className="brand-lockup"><Image src="/sa-studios-logo.png" alt="" width={56} height={44} className="brand-logo" priority /><span>SA-studios</span></div>
      <div className="login-brand-copy"><span className="eyebrow light">PLATAFORMA ACADÉMICA</span><h1>Tu academia,<br />bien organizada.</h1><p>Un espacio único para gestionar el trabajo académico y administrativo.</p></div>
      <small className="login-footer">Sistema de gestión académica</small>
    </section>
    <section className="login-form-panel"><div className="login-toolbar"><ThemeToggle /></div><div className="login-card">
      <span className="eyebrow">ACCESO SEGURO</span><h2>Iniciar sesión</h2><p>Ingresa el usuario y la contraseña asignados por administración.</p>
      <form onSubmit={submit} className="form-stack">
        <label>Usuario<input name="usuario" autoComplete="username" required placeholder="Tu usuario" /></label>
        <label>Contraseña<input name="password" type="password" autoComplete="current-password" required placeholder="Tu contraseña" /></label>
        {error && <div className="alert error" role="alert">{error}</div>}
        <button className="button primary full" disabled={enviando}>{enviando ? "Verificando…" : "Entrar al sistema"}</button>
      </form>
    </div></section>
  </main>;
}
