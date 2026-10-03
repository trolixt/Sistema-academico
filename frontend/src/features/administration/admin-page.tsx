"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CanalesSection } from "./canales-section";
import { DocentesSection } from "./docentes-section";
import { HorariosSection } from "./horarios-section";
import { SecretariaSection } from "./secretaria-section";

const sections = [
  { path: "/administracion", name: "Canales", hint: "Áreas y estudiantes" },
  { path: "/administracion/docentes", name: "Docentes", hint: "Perfiles y asignaciones" },
  { path: "/administracion/horarios", name: "Horarios", hint: "Clases por grupo" },
  { path: "/administracion/secretaria", name: "Secretaría", hint: "Cuentas y perfiles" },
];

export function AdminPage({ section = "canales" }: { section?: "canales" | "docentes" | "horarios" | "secretaria" }) {
  const pathname = usePathname();
  return <section className="admin-workspace">
    <header className="admin-page-heading"><div><span className="eyebrow">CENTRO DE ADMINISTRACIÓN</span><h2>{section === "canales" ? "Canales académicos" : section === "docentes" ? "Docentes" : section === "horarios" ? "Horarios" : "Secretaría"}</h2><p>Administra la información académica de la academia preuniversitaria.</p></div><span className="admin-heading-orbit" aria-hidden="true"><i /><i /></span></header>
    <nav className="admin-section-tabs" aria-label="Secciones administrativas">{sections.map((item) => <Link key={item.path} href={item.path} className={pathname === item.path ? "active" : ""}><strong>{item.name}</strong><small>{item.hint}</small></Link>)}</nav>
    {section === "canales" ? <CanalesSection /> : section === "docentes" ? <DocentesSection /> : section === "horarios" ? <HorariosSection /> : <SecretariaSection />}
  </section>;
}
