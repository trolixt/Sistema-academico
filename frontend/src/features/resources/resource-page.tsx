"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api/client";
import type { Rol } from "@/types/api";

type Row = Record<string, unknown>;
type Option = { value: string | number; label: string };
type Field = { name: string; label: string; type?: "text" | "date" | "number" | "email" | "password" | "select"; required?: boolean; options?: Option[]; source?: string; optional?: boolean };
type Config = { title: string; description: string; path: string; columns: [string, string][]; fields?: Field[]; createPath?: string; transform?: (data: Row[]) => Row[] };

const resourceConfigs: Record<string, Omit<Config, "path"> & { path: string | ((role: Rol) => string) }> = {
  usuarios: { title: "Usuarios", description: "Cuentas y roles registrados en la base de datos.", path: "/usuarios", columns: [["nombre_usuario", "Usuario"], ["nombres", "Nombres"], ["apellidos", "Apellidos"], ["correo", "Correo"], ["rol", "Rol"], ["estado", "Estado"]] },
  estudiantes: { title: "Estudiantes", description: "Registro de estudiantes y estado de sus cuentas.", path: "/estudiantes", columns: [["codigo_estudiante", "Código"], ["nombres", "Nombres"], ["apellidos", "Apellidos"], ["dni", "DNI"], ["correo", "Correo"], ["telefono", "Teléfono"], ["estado", "Estado"]], createPath: "/estudiantes", fields: [{ name: "nombres", label: "Nombres", required: true }, { name: "apellidos", label: "Apellidos", required: true }, { name: "dni", label: "DNI", required: true }, { name: "fecha_nacimiento", label: "Fecha de nacimiento", type: "date", required: true }, { name: "correo", label: "Correo", type: "email" }, { name: "telefono", label: "Teléfono" }, { name: "direccion", label: "Dirección" }, { name: "nombre_usuario", label: "Usuario de acceso" }, { name: "password", label: "Contraseña inicial", type: "password" }] },
  docentes: { title: "Docentes", description: "Docentes vinculados a la academia.", path: "/docentes", columns: [["codigo_docente", "Código"], ["nombres", "Nombres"], ["apellidos", "Apellidos"], ["dni", "DNI"], ["correo", "Correo"], ["estado_usuario", "Estado de cuenta"]], createPath: "/docentes", fields: [{ name: "nombres", label: "Nombres", required: true }, { name: "apellidos", label: "Apellidos", required: true }, { name: "dni", label: "DNI", required: true }, { name: "correo", label: "Correo", type: "email" }, { name: "telefono", label: "Teléfono" }, { name: "nombre_usuario", label: "Usuario de acceso" }, { name: "password", label: "Contraseña inicial", type: "password" }] },
  cursos: { title: "Cursos", description: "Oferta académica registrada.", path: "/academicos/cursos", columns: [["nombre", "Curso"], ["descripcion", "Descripción"], ["estado", "Estado"]], createPath: "/academicos/cursos", fields: [{ name: "nombre", label: "Nombre del curso", required: true }, { name: "descripcion", label: "Descripción" }] },
  ciclos: { title: "Ciclos académicos", description: "Periodos lectivos guardados en el sistema.", path: "/academicos/ciclos", columns: [["nombre", "Ciclo"], ["fecha_inicio", "Fecha de inicio"], ["fecha_fin", "Fecha de fin"], ["estado", "Estado"]], createPath: "/academicos/ciclos", fields: [{ name: "nombre", label: "Nombre del ciclo", required: true }, { name: "fecha_inicio", label: "Inicio", type: "date", required: true }, { name: "fecha_fin", label: "Fin", type: "date", required: true }] },
  grupos: { title: "Grupos", description: "Asignación de curso, docente, ciclo y vacantes.", path: "/academicos/grupos", columns: [["nombre", "Grupo"], ["curso_nombre", "Curso"], ["docente_nombres", "Docente"], ["ciclo_nombre", "Ciclo"], ["matriculados_count", "Matriculados"], ["vacantes_disponibles", "Vacantes"], ["estado", "Estado"]], createPath: "/academicos/grupos", fields: [{ name: "nombre", label: "Nombre del grupo", required: true }, { name: "curso_id", label: "Curso", type: "select", source: "/academicos/cursos?activos=true", required: true }, { name: "docente_id", label: "Docente", type: "select", source: "/docentes", required: true }, { name: "ciclo_id", label: "Ciclo", type: "select", source: "/academicos/ciclos?activos=true", required: true }, { name: "capacidad", label: "Capacidad", type: "number", required: true }] },
  matriculas: { title: "Matrículas", description: "Matrículas registradas por el personal administrativo.", path: "/matriculas", columns: [["codigo_matricula", "Código"], ["estudiante_nombres", "Estudiante"], ["curso_nombre", "Curso"], ["grupo_nombre", "Grupo"], ["ciclo_nombre", "Ciclo"], ["fecha_registro", "Registrada"], ["estado", "Estado"]], createPath: "/matriculas", fields: [{ name: "estudiante_id", label: "Estudiante", type: "select", source: "/estudiantes", required: true }, { name: "grupo_id", label: "Grupo", type: "select", source: "/academicos/grupos?activos=true", required: true }] },
  notas: { title: "Evaluaciones y notas", description: "Evaluaciones y calificaciones consultadas desde la base de datos.", path: (role) => role === "ESTUDIANTE" ? "/evaluaciones/me/notas" : "/evaluaciones", columns: [["nombre_evaluacion", "Evaluación"], ["curso_nombre", "Curso"], ["grupo_nombre", "Grupo"], ["fecha", "Fecha"], ["estado", "Estado"], ["total_notas", "Notas registradas"]], createPath: "/evaluaciones", fields: [{ name: "grupo_id", label: "Grupo", type: "select", source: "/academicos/grupos/me", required: true }, { name: "nombre_evaluacion", label: "Nombre", required: true }, { name: "fecha", label: "Fecha", type: "date", required: true }] },
  "mis-grupos": { title: "Mis grupos", description: "Grupos asignados a tu perfil docente.", path: "/academicos/grupos/me", columns: [["nombre", "Grupo"], ["curso_nombre", "Curso"], ["ciclo_nombre", "Ciclo"], ["matriculados_count", "Estudiantes"], ["vacantes_disponibles", "Vacantes"], ["estado", "Estado"]] },
  "mis-matriculas": { title: "Mi matrícula", description: "Matrículas asociadas a tu perfil.", path: "/matriculas/me", columns: [["codigo_matricula", "Código"], ["curso_nombre", "Curso"], ["grupo_nombre", "Grupo"], ["ciclo_nombre", "Ciclo"], ["docente_nombres", "Docente"], ["fecha_registro", "Fecha"], ["estado", "Estado"]] },
  "mis-cursos": { title: "Mis cursos", description: "Cursos incluidos en tus matrículas activas.", path: "/matriculas/me", columns: [["curso_nombre", "Curso"], ["grupo_nombre", "Grupo"], ["docente_nombres", "Docente"], ["ciclo_nombre", "Ciclo"], ["estado", "Matrícula"]] },
  asistencia: { title: "Asistencia", description: "Sesiones y registros de asistencia guardados en el sistema.", path: (role) => role === "ESTUDIANTE" ? "/asistencias/me" : "/asistencias", columns: [["fecha", "Fecha"], ["curso_nombre", "Curso"], ["grupo_nombre", "Grupo"], ["total_estudiantes", "Registrados"], ["presentes", "Presentes"], ["ausentes", "Ausentes"], ["tardanzas", "Tardanzas"], ["estado", "Sesión"]] },
  horarios: { title: "Horarios", description: "Horarios asignados a grupos en la base de datos.", path: (role) => role === "ESTUDIANTE" || role === "DOCENTE" ? "/academicos/grupos/me" : "/academicos/grupos", columns: [["curso_nombre", "Curso"], ["nombre", "Grupo"], ["docente_nombres", "Docente"], ["dia_semana", "Día"], ["hora_inicio", "Desde"], ["hora_fin", "Hasta"], ["aula", "Aula"]], createPath: "/academicos/horarios", fields: [{ name: "grupo_id", label: "Grupo", type: "select", source: "/academicos/grupos?activos=true", required: true }, { name: "dia_semana", label: "Día", type: "select", options: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"].map((day) => ({ value: day, label: day })) }, { name: "hora_inicio", label: "Hora de inicio", type: "text", required: true }, { name: "hora_fin", label: "Hora de fin", type: "text", required: true }, { name: "aula", label: "Aula", required: true }], transform: (groups) => groups.flatMap((group) => (Array.isArray(group.horarios) ? group.horarios as Row[] : []).map((schedule) => ({ ...schedule, nombre: group.nombre, curso_nombre: group.curso_nombre, docente_nombres: `${group.docente_nombres || ""} ${group.docente_apellidos || ""}`.trim() }))) },
};

function humanize(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return "—";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleDateString("es-PE");
  return String(value);
}

function canCreate(role: Rol | undefined, section: string) {
  if (role === "ADMINISTRADOR") return ["estudiantes", "docentes", "cursos", "ciclos", "grupos", "matriculas", "notas", "horarios"].includes(section);
  if (role === "ADMINISTRATIVO") return ["estudiantes", "matriculas"].includes(section);
  if (role === "DOCENTE") return section === "notas";
  return false;
}

export function ResourcePage({ section }: { section: string }) {
  const { token, usuario } = useAuth();
  const config = resourceConfigs[section];
  const [rows, setRows] = useState<Row[]>([]);
  const [options, setOptions] = useState<Record<string, Row[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  const path = useMemo(() => typeof config?.path === "function" ? config.path(usuario?.rol || "ESTUDIANTE") : config?.path, [config, usuario?.rol]);
  const load = useCallback(async () => {
    if (!token || !config || !path) return;
    setLoading(true); setError("");
    try {
      const data = await apiRequest<Row | Row[]>(path, token);
      const nextRows = Array.isArray(data) ? data : [data];
      setRows(config.transform ? config.transform(nextRows) : nextRows);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudieron cargar los datos."); }
    finally { setLoading(false); }
  }, [token, config, path]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!token || !config?.fields?.length) return;
    const sources = [...new Set(config.fields.map((field) => field.source === "/academicos/grupos?activos=true" && section === "notas" && usuario?.rol === "DOCENTE" ? "/academicos/grupos/me" : field.source).filter(Boolean))] as string[];
    if (!sources.length) return;
    Promise.all(sources.map(async (source) => [source, await apiRequest<Row[]>(source, token)] as const))
      .then((entries) => setOptions(Object.fromEntries(entries)))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "No se pudieron cargar opciones del formulario."));
  }, [token, config, section, usuario?.rol]);

  const filtered = rows.filter((row) => !query || config.columns.some(([key]) => humanize(row[key]).toLocaleLowerCase().includes(query.toLocaleLowerCase())));

  async function createRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !config?.createPath) return;
    const form = new FormData(event.currentTarget);
    const payload: Row = Object.fromEntries(form.entries());
    for (const field of config.fields || []) if ((field.type === "number" || field.name.endsWith("_id")) && payload[field.name]) payload[field.name] = Number(payload[field.name]);
    if (section === "matriculas") {
      const selectedGroup = options["/academicos/grupos?activos=true"]?.find((group) => Number(group.id) === Number(payload.grupo_id));
      payload.ciclo_id = selectedGroup?.ciclo_id;
    }
    setSaving(true); setNotice(""); setError("");
    try {
      await apiRequest(config.createPath, token, { method: "POST", body: JSON.stringify(payload) });
      setCreating(false); setNotice("Registro guardado en la base de datos."); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo guardar el registro."); }
    finally { setSaving(false); }
  }

  if (!config) return <div className="alert error">Esta sección no está configurada.</div>;
  return <section className="data-page">
    <div className="page-intro"><div><span className="eyebrow">DATOS DE LA ACADEMIA</span><h2>{config.title}</h2><p>{config.description}</p></div>
      {canCreate(usuario?.rol, section) && config.createPath && <button className="button primary" onClick={() => setCreating(true)}>＋ Nuevo registro</button>}
    </div>
    <div className="panel-toolbar"><label className="search-field"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar en los registros" /></label><span className="record-count">{loading ? "Consultando…" : `${filtered.length} registros`}</span></div>
    {error && <div className="alert error" role="alert">{error}</div>}{notice && <div className="alert success">{notice}</div>}
    <div className="table-panel"><div className="table-scroll"><table><thead><tr>{config.columns.map(([, title]) => <th key={title}>{title}</th>)}</tr></thead><tbody>
      {loading ? <tr><td colSpan={config.columns.length} className="table-message">Consultando la base de datos…</td></tr> : filtered.length === 0 ? <tr><td colSpan={config.columns.length} className="table-message">No hay registros para mostrar.</td></tr> : filtered.map((row, index) => <tr key={String(row.id ?? index)}>{config.columns.map(([key]) => <td key={key}>{humanize(row[key])}</td>)}</tr>)}
    </tbody></table></div></div>
    {creating && config.fields && <div className="modal-backdrop" role="presentation"><section className="form-dialog" role="dialog" aria-modal="true"><div className="dialog-heading"><div><span className="eyebrow">NUEVO REGISTRO</span><h2>{config.title}</h2></div><button className="icon-button" onClick={() => setCreating(false)} aria-label="Cerrar">×</button></div>
      <form onSubmit={createRecord} className="form-stack dialog-form"><div className="form-grid">{config.fields.map((field) => <label key={field.name}>{field.label}{field.type === "select" ? <select name={field.name} required={field.required}><option value="">Seleccionar…</option>{(field.options ? field.options.map((option) => ({ ...option })) as Row[] : options[field.source || ""] || []).map((option) => <option key={String(option.id ?? option.value)} value={String(option.value ?? option.id ?? "")}>{String(option.label ?? [option.nombre, option.nombres, option.apellidos].filter(Boolean).join(" "))}</option>)}</select> : <input name={field.name} type={field.type || "text"} required={field.required} />}</label>)}</div>
        {error && <div className="alert error">{error}</div>}<div className="dialog-actions"><button type="button" className="button secondary" onClick={() => setCreating(false)}>Cancelar</button><button className="button primary" disabled={saving}>{saving ? "Guardando…" : "Guardar"}</button></div>
      </form></section></div>}
  </section>;
}
