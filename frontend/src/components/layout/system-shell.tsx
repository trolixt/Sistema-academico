"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { navigationByRole } from "@/lib/auth/navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function SystemShell({ children }: { children: React.ReactNode }) {
  const { token, usuario, cargando, cerrarSesion } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => { if (!cargando && (!token || !usuario)) router.replace("/"); }, [cargando, token, usuario, router]);
  if (cargando || !token || !usuario) return <div className="screen-loader">Cargando sesión…</div>;

  const groups = navigationByRole[usuario.rol];
  const items = groups.flatMap((group) => group.items);
  useEffect(() => {
    if (!cargando && token && usuario && !items.some((item) => item.href === pathname)) router.replace("/dashboard");
  }, [cargando, token, usuario, pathname, router, items]);
  const nombre = [usuario.perfil?.nombres, usuario.perfil?.apellidos].filter(Boolean).join(" ") || usuario.nombre_usuario;
  const label = items.find((item) => item.href === pathname)?.label || "Sistema académico";
  return <div className="application-shell">
    <aside className="sidebar">
      <Link href="/dashboard" className="brand-lockup"><Image src="/sa-studios-logo.png" alt="" width={48} height={38} className="brand-logo" priority /><span>SA-studios</span></Link>
      <div className="account-role"><small>SESIÓN ACTUAL</small><strong>{usuario.rol.replaceAll("_", " ")}</strong></div>
      <nav className="main-navigation" aria-label="Navegación principal">
        {groups.map(({ title, items: groupItems }) => <section className="nav-group" key={title}><span className="nav-caption">{title}</span>{groupItems.map(({ href, label: itemLabel }) => <Link key={href} href={href} className={`nav-link ${pathname === href ? "selected" : ""}`}><span className="nav-dot" />{itemLabel}</Link>)}</section>)}
      </nav>
      <div className="sidebar-bottom"><span className="user-avatar">{nombre.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span><div className="user-info"><strong>{nombre}</strong><small>{usuario.nombre_usuario}</small></div><button className="text-button" onClick={() => { cerrarSesion(); router.replace("/"); }}>Salir</button></div>
    </aside>
    <main className="main-area"><header className="topbar"><div><span className="breadcrumb">SA-studios / {usuario.rol.toLowerCase()}</span><h1>{label}</h1></div><div className="topbar-actions"><ThemeToggle /></div></header><div className="page-content">{children}</div></main>
  </div>;
}
