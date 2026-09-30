import type { Usuario } from "@/types/api";

export type NavItem = { href: string; label: string };
export type NavGroup = { title: string; items: NavItem[] };

export const navigationByRole: Record<Usuario["rol"], NavGroup[]> = {
  ADMINISTRADOR: [
    { title: "Inicio", items: [{ href: "/dashboard", label: "Resumen" }] },
    { title: "Personas", items: [{ href: "/usuarios", label: "Usuarios" }, { href: "/estudiantes", label: "Estudiantes" }, { href: "/docentes", label: "Docentes" }] },
    { title: "Oferta académica", items: [{ href: "/cursos", label: "Cursos" }, { href: "/ciclos", label: "Ciclos" }, { href: "/grupos", label: "Grupos" }, { href: "/horarios", label: "Horarios" }] },
    { title: "Operaciones", items: [{ href: "/matriculas", label: "Matrículas" }, { href: "/pagos", label: "Pagos" }, { href: "/asistencia", label: "Asistencia" }, { href: "/notas", label: "Evaluaciones y notas" }] },
  ],
  ADMINISTRATIVO: [
    { title: "Inicio", items: [{ href: "/dashboard", label: "Resumen" }] },
    { title: "Gestión administrativa", items: [{ href: "/estudiantes", label: "Estudiantes" }, { href: "/matriculas", label: "Matrículas" }, { href: "/pagos", label: "Pagos" }] },
    { title: "Consulta académica", items: [{ href: "/grupos", label: "Grupos" }, { href: "/horarios", label: "Horarios" }, { href: "/asistencia", label: "Asistencia" }, { href: "/notas", label: "Notas" }] },
  ],
  DOCENTE: [
    { title: "Inicio", items: [{ href: "/dashboard", label: "Resumen" }] },
    { title: "Mi docencia", items: [{ href: "/mis-grupos", label: "Mis grupos" }, { href: "/horarios", label: "Mi horario" }, { href: "/asistencia", label: "Asistencia" }, { href: "/notas", label: "Evaluaciones y notas" }] },
  ],
  ESTUDIANTE: [
    { title: "Mi academia", items: [
      { href: "/dashboard", label: "Mi resumen" }, { href: "/mi-perfil", label: "Mis datos" }, { href: "/mis-matriculas", label: "Mi matrícula" },
      { href: "/mis-cursos", label: "Mis cursos" }, { href: "/horarios", label: "Mi horario" }, { href: "/asistencia", label: "Mi asistencia" },
      { href: "/notas", label: "Mis notas" }, { href: "/pagos", label: "Mis pagos" },
    ] },
  ],
};
