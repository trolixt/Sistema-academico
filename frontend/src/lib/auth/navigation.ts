import type { Usuario } from "@/types/api";

export type NavItem = { href: string; label: string };
export type NavGroup = { title: string; items: NavItem[] };

export const navigationByRole: Record<Usuario["rol"], NavGroup[]> = {
  ADMINISTRADOR: [
    { title: "Administración", items: [{ href: "/administracion", label: "Canales" }, { href: "/estudiantes", label: "Estudiantes" }, { href: "/administracion/docentes", label: "Docentes" }, { href: "/administracion/secretaria", label: "Secretaría" }, { href: "/administracion/horarios", label: "Horarios" }, { href: "/asistencia", label: "Asistencia" }] },
    { title: "Matrícula y pagos", items: [{ href: "/matriculas", label: "Matrículas" }, { href: "/pagos", label: "Pagos" }] },
  ],
  ADMINISTRATIVO: [
    { title: "Inicio", items: [{ href: "/dashboard", label: "Resumen" }] },
    { title: "Gestión administrativa", items: [{ href: "/estudiantes", label: "Estudiantes" }, { href: "/matriculas", label: "Matrículas" }, { href: "/pagos", label: "Pagos" }] },
    { title: "Consulta académica", items: [{ href: "/grupos", label: "Grupos" }, { href: "/horarios", label: "Horarios" }, { href: "/asistencia", label: "Asistencia" }] },
  ],
  DOCENTE: [
    { title: "Inicio", items: [{ href: "/dashboard", label: "Resumen" }] },
    { title: "Mi docencia", items: [{ href: "/mis-grupos", label: "Mis grupos" }, { href: "/horarios", label: "Mi horario" }, { href: "/asistencia", label: "Asistencia" }] },
  ],
  ESTUDIANTE: [
    { title: "Mi academia", items: [
      { href: "/dashboard", label: "Mi resumen" }, { href: "/mi-perfil", label: "Mis datos" }, { href: "/mis-matriculas", label: "Mi matrícula" },
      { href: "/mis-cursos", label: "Mis cursos" }, { href: "/horarios", label: "Mi horario" }, { href: "/asistencia", label: "Mi asistencia" },
      { href: "/pagos", label: "Mis pagos" },
    ] },
  ],
};
