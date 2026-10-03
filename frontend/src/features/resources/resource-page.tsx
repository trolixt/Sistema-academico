"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api/client";
import type { Rol } from "@/types/api";

type Row = Record<string, unknown>;
type Option = { value: string | number; label: string };
type Field = { name: string; label: string; type?: "text" | "date" | "number" | "email" | "password" | "select"; required?: boolean; pattern?: string; maxLength?: number; options?: Option[]; source?: string; optional?: boolean; editOnly?: boolean; createOnly?: boolean };
type Config = { title: string; description: string; path: string; columns: [string, string][]; fields?: Field[]; createPath?: string; updatePath?: string; transform?: (data: Row[]) => Row[] };

const resourceConfigs: Record<string, Omit<Config, "path"> & { path: string | ((role: Rol) => string) }> = {
  usuarios: { title: "Usuarios", description: "Cuentas y roles registrados en la base de datos.", path: "/usuarios", columns: [["id_acceso", "ID de acceso"], ["nombre_usuario", "Usuario interno"], ["nombres", "Nombres"], ["apellidos", "Apellidos"], ["correo", "Correo"], ["rol", "Rol"], ["estado", "Estado"]] },
  estudiantes: { title: "Estudiantes", description: "Busca por ID, nombre, DNI o código; administra su canal y estado.", path: "/estudiantes", columns: [["id", "ID estudiante"], ["id_acceso", "ID de acceso"], ["codigo_estudiante", "Código"], ["nombres", "Nombres"], ["apellidos", "Apellidos"], ["dni", "DNI"], ["canal_nombre", "Canal"], ["estado_usuario", "Cuenta"]], createPath: "/estudiantes", updatePath: "/estudiantes", fields: [{ name: "nombres", label: "Nombres", required: true }, { name: "apellidos", label: "Apellidos", required: true }, { name: "dni", label: "DNI (8 dígitos)", required: true, pattern: "[0-9]{8}", maxLength: 8 }, { name: "fecha_nacimiento", label: "Fecha de nacimiento", type: "date", required: true }, { name: "canal_id", label: "Canal", type: "select", source: "/academicos/canales", required: true }, { name: "correo", label: "Correo", type: "email" }, { name: "telefono", label: "Teléfono (9 dígitos)", pattern: "[0-9]{9}", maxLength: 9 }, { name: "direccion", label: "Dirección" }, { name: "estado", label: "Estado", type: "select", editOnly: true, options: [{ value: "ACTIVO", label: "Activo" }, { value: "INACTIVO", label: "Fuera" }] }, { name: "password", label: "Contraseña inicial", type: "password", createOnly: true }] },
  docentes: { title: "Docentes", description: "Docentes vinculados a la academia.", path: "/docentes", columns: [["codigo_docente", "Código"], ["id_acceso", "ID de acceso"], ["nombres", "Nombres"], ["apellidos", "Apellidos"], ["dni", "DNI"], ["correo", "Correo"], ["estado_usuario", "Estado de cuenta"]], createPath: "/docentes", updatePath: "/docentes", fields: [{ name: "nombres", label: "Nombres", required: true }, { name: "apellidos", label: "Apellidos", required: true }, { name: "dni", label: "DNI (8 dígitos)", required: true, pattern: "[0-9]{8}", maxLength: 8 }, { name: "correo", label: "Correo", type: "email" }, { name: "telefono", label: "Teléfono (9 dígitos)", pattern: "[0-9]{9}", maxLength: 9 }, { name: "estado", label: "Estado de cuenta", type: "select", editOnly: true, options: [{ value: "ACTIVO", label: "Activo" }, { value: "INACTIVO", label: "Inactivo" }] }, { name: "nombre_usuario", label: "Usuario de acceso", createOnly: true }, { name: "password", label: "Contraseña inicial", type: "password", createOnly: true }] },
  cursos: { title: "Cursos", description: "Oferta académica registrada.", path: "/academicos/cursos", columns: [["nombre", "Curso"], ["descripcion", "Descripción"], ["estado", "Estado"]], createPath: "/academicos/cursos", updatePath: "/academicos/cursos", fields: [{ name: "nombre", label: "Nombre del curso", required: true }, { name: "descripcion", label: "Descripción" }, { name: "estado", label: "Estado", type: "select", editOnly: true, options: [{ value: "ACTIVO", label: "Activo" }, { value: "INACTIVO", label: "Inactivo" }] }] },
  ciclos: { title: "Ciclos académicos", description: "Periodos lectivos guardados en el sistema.", path: "/academicos/ciclos", columns: [["nombre", "Ciclo"], ["fecha_inicio", "Fecha de inicio"], ["fecha_fin", "Fecha de fin"], ["estado", "Estado"]], createPath: "/academicos/ciclos", updatePath: "/academicos/ciclos", fields: [{ name: "nombre", label: "Nombre del ciclo", required: true }, { name: "fecha_inicio", label: "Inicio", type: "date", required: true }, { name: "fecha_fin", label: "Fin", type: "date", required: true }, { name: "estado", label: "Estado", type: "select", editOnly: true, options: [{ value: "ACTIVO", label: "Activo" }, { value: "INACTIVO", label: "Inactivo" }] }] },
  grupos: { title: "Grupos", description: "Asignación de canal, área, docente, ciclo y vacantes.", path: "/academicos/grupos", columns: [["nombre", "Grupo"], ["curso_nombre", "Área"], ["canal_nombre", "Canal"], ["docente_nombres", "Docente"], ["ciclo_nombre", "Ciclo"], ["matriculados_count", "Matriculados"], ["vacantes_disponibles", "Vacantes"], ["estado", "Estado"]], createPath: "/academicos/grupos", updatePath: "/academicos/grupos", fields: [{ name: "nombre", label: "Nombre del grupo", required: true }, { name: "curso_id", label: "Área", type: "select", source: "/academicos/cursos?activos=true", required: true }, { name: "canal_id", label: "Canal", type: "select", source: "/academicos/canales", required: true }, { name: "docente_id", label: "Docente", type: "select", source: "/docentes", required: true }, { name: "ciclo_id", label: "Ciclo", type: "select", source: "/academicos/ciclos?activos=true", required: true }, { name: "capacidad", label: "Capacidad", type: "number", required: true }, { name: "estado", label: "Estado", type: "select", editOnly: true, options: [{ value: "ACTIVO", label: "Activo" }, { value: "INACTIVO", label: "Inactivo" }] }] },
  matriculas: { title: "Matrículas", description: "Matricula a cada estudiante en un canal y conserva su plan de pagos del ciclo.", path: "/matriculas", columns: [["codigo_matricula", "Código"], ["estudiante_nombres", "Estudiante"], ["canal_nombre", "Canal"], ["ciclo_nombre", "Ciclo"], ["fecha_registro", "Registrada"], ["estado", "Estado"]], createPath: "/matriculas", fields: [{ name: "estudiante_id", label: "Estudiante", type: "select", source: "/estudiantes", required: true }, { name: "canal_id", label: "Canal", type: "select", source: "/academicos/canales", required: true }, { name: "ciclo_id", label: "Ciclo", type: "select", source: "/academicos/ciclos?activos=true", required: true }, { name: "monto_matricula", label: "Pago de matrícula (S/)", type: "number", required: true }, { name: "monto_mensualidad", label: "Monto mensual (S/)", type: "number", required: true }] },
  notas: { title: "Evaluaciones y notas", description: "Evaluaciones y calificaciones consultadas desde la base de datos.", path: (role) => role === "ESTUDIANTE" ? "/evaluaciones/me/notas" : "/evaluaciones", columns: [["nombre_evaluacion", "Evaluación"], ["curso_nombre", "Curso"], ["grupo_nombre", "Grupo"], ["fecha", "Fecha"], ["estado", "Estado"], ["total_notas", "Notas registradas"]], createPath: "/evaluaciones", updatePath: "/evaluaciones", fields: [{ name: "grupo_id", label: "Grupo", type: "select", source: "/academicos/grupos?activos=true", required: true }, { name: "nombre_evaluacion", label: "Nombre", required: true }, { name: "fecha", label: "Fecha", type: "date", required: true }] },
  "mis-grupos": { title: "Mis grupos", description: "Grupos asignados a tu perfil docente.", path: "/academicos/grupos/me", columns: [["nombre", "Grupo"], ["curso_nombre", "Curso"], ["ciclo_nombre", "Ciclo"], ["matriculados_count", "Estudiantes"], ["vacantes_disponibles", "Vacantes"], ["estado", "Estado"]] },
  "mis-matriculas": { title: "Mi matrícula", description: "Tu canal de preparación y ciclo académico.", path: "/matriculas/me", columns: [["codigo_matricula", "Código"], ["canal_nombre", "Canal"], ["ciclo_nombre", "Ciclo"], ["fecha_registro", "Fecha"], ["estado", "Estado"]] },
  "mis-cursos": { title: "Mis cursos", description: "Áreas incluidas en tu canal.", path: "/matriculas/me", columns: [["curso_nombre", "Curso"], ["grupo_nombre", "Grupo"], ["docente_nombres", "Docente"], ["ciclo_nombre", "Ciclo"], ["estado", "Matrícula"]] },
  asistencia: { title: "Asistencia", description: "Sesiones y registros de asistencia guardados en el sistema.", path: (role) => role === "ESTUDIANTE" ? "/asistencias/me" : "/asistencias", columns: [["fecha", "Fecha"], ["curso_nombre", "Curso"], ["grupo_nombre", "Grupo"], ["total_estudiantes", "Registrados"], ["presentes", "Presentes"], ["ausentes", "Ausentes"], ["tardanzas", "Tardanzas"], ["estado", "Sesión"]] },
  horarios: { title: "Horarios", description: "Horarios asignados a grupos en la base de datos.", path: (role) => role === "ESTUDIANTE" || role === "DOCENTE" ? "/academicos/grupos/me" : "/academicos/grupos", columns: [["curso_nombre", "Curso"], ["nombre", "Grupo"], ["docente_nombres", "Docente"], ["dia_semana", "Día"], ["hora_inicio", "Desde"], ["hora_fin", "Hasta"], ["aula", "Aula"]], createPath: "/academicos/horarios", updatePath: "/academicos/horarios", fields: [{ name: "grupo_id", label: "Grupo", type: "select", source: "/academicos/grupos?activos=true", required: true }, { name: "dia_semana", label: "Día", type: "select", options: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"].map((day) => ({ value: day, label: day })) }, { name: "hora_inicio", label: "Hora de inicio", type: "text", required: true }, { name: "hora_fin", label: "Hora de fin", type: "text", required: true }, { name: "aula", label: "Aula", required: true }], transform: (groups) => groups.flatMap((group) => (Array.isArray(group.horarios) ? group.horarios as Row[] : []).map((schedule) => ({ ...schedule, nombre: group.nombre, curso_nombre: group.curso_nombre, docente_nombres: `${group.docente_nombres || ""} ${group.docente_apellidos || ""}`.trim() }))) },
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
  const [editingRow, setEditingRow] = useState<Row | null>(null);
  const [reincorporating, setReincorporating] = useState<Row | null>(null);
  const [dniMessage, setDniMessage] = useState("");
  const [dniBlocked, setDniBlocked] = useState(false);
  const [dniLookupBusy, setDniLookupBusy] = useState(false);
  const [idLookupStudent, setIdLookupStudent] = useState<Row | null>(null);
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

  const matchingRows = rows.filter((row) => !query || config.columns.some(([key]) => humanize(row[key]).toLocaleLowerCase().includes(query.toLocaleLowerCase())));
  const filtered = idLookupStudent && /^\d+$/.test(query.trim()) && !matchingRows.some((row) => Number(row.id) === Number(idLookupStudent.id)) ? [...matchingRows, idLookupStudent] : matchingRows;
  const adminCrudSections = ["estudiantes", "docentes", "cursos", "ciclos", "grupos", "horarios", "notas"];
  const canManage = usuario?.rol === "ADMINISTRADOR" && adminCrudSections.includes(section) && Boolean(config.updatePath);
  const visibleFields = (config.fields || []).filter((field) => section !== "estudiantes" || field.name !== "estado").filter((field) => editingRow ? !field.createOnly : reincorporating ? !field.createOnly && !field.editOnly : !field.editOnly);

  function beginCreate() { setEditingRow(null); setReincorporating(null); setDniMessage(""); setDniBlocked(false); setError(""); setCreating(true); }
  function beginEdit(row: Row) { if (section === "estudiantes" && (row.estado !== "ACTIVO" || row.estado_usuario !== "ACTIVO")) { beginReincorporation(row); return; } setEditingRow(row); setReincorporating(null); setDniMessage(""); setDniBlocked(false); setError(""); setCreating(true); }
  function beginReincorporation(row: Row) { setEditingRow(null); setReincorporating(row); setDniMessage("Ficha recuperada. Revisa los datos y confirma la reincorporación."); setDniBlocked(false); setError(""); setCreating(true); }

  async function lookupStudentDni(raw: string) {
    const dni = raw.trim();
    if (section !== "estudiantes" || editingRow || !token || !/^\d{8}$/.test(dni)) return;
    setDniLookupBusy(true); setDniMessage(""); setDniBlocked(false);
    try {
      const existing = await apiRequest<Row | null>(`/estudiantes/buscar-dni/${dni}`, token);
      if (existing?.id && (existing.estado !== "ACTIVO" || existing.estado_usuario !== "ACTIVO")) {
        setReincorporating(existing);
        setDniBlocked(false);
        setDniMessage(`Ficha encontrada: ${existing.nombres} ${existing.apellidos}. Se cargaron sus datos; confirma para reincorporarlo.`);
      } else if (existing?.id) {
        if (existing.estado === "ACTIVO" && existing.estado_usuario === "ACTIVO") {
          setReincorporating(null);
          setDniBlocked(true);
          setDniMessage(`El DNI ya pertenece al estudiante activo ${existing.nombres} ${existing.apellidos} (ID ${existing.id}).`);
        }
      } else {
        setDniBlocked(false);
        setReincorporating(null);
        setDniMessage("No hay una ficha anterior para este DNI. Se registrará como estudiante nuevo.");
      }
    } catch (cause) { setDniMessage(cause instanceof Error ? cause.message : "No se pudo consultar el DNI."); }
    finally { setDniLookupBusy(false); }
  }

  async function lookupInactiveStudent(rawId: string) {
    const id = rawId.trim();
    if (section !== "estudiantes" || !/^\d{1,9}$/.test(id) || !token) return;
    setIdLookupStudent(null);
    try {
      const student = await apiRequest<Row>(`/estudiantes/buscar-id/${id}`, token);
      if (student.estado !== "ACTIVO" || student.estado_usuario !== "ACTIVO") setIdLookupStudent(student);
    } catch { setIdLookupStudent(null); }
  }

  async function changeStatus(row: Row) {
    if (!token || !config?.updatePath || row.id === undefined) return;
    const status = section === "estudiantes" || section === "docentes" ? row.estado_usuario : row.estado;
    const next = status === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    setSaving(true); setNotice(""); setError("");
    try {
      await apiRequest(`${config.updatePath}/${row.id}`, token, { method: "PUT", body: JSON.stringify({ estado: next }) });
      setNotice(`Registro ${next === "ACTIVO" ? "activado" : "desactivado"} correctamente.`); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo actualizar el estado."); }
    finally { setSaving(false); }
  }

  async function deleteRecord(row: Row) {
    if (!token || !config?.createPath || row.id === undefined) return;
    const name = [row.nombres, row.apellidos, row.nombre, row.codigo_estudiante, row.codigo_docente].filter(Boolean).join(" ") || config.title;
    const message = section === "horarios" ? `¿Eliminar este horario de ${name}?` : section === "notas" ? `¿Eliminar la evaluación ${name} y sus notas?` : `¿Dar de baja ${name}? El registro se conservará en el historial.`;
    if (!window.confirm(message)) return;
    setSaving(true); setNotice(""); setError("");
    try {
      await apiRequest(`${config.createPath}/${row.id}`, token, { method: "DELETE" });
      setNotice(section === "horarios" ? "Horario eliminado." : section === "notas" ? "Evaluación eliminada." : "Registro desactivado."); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo eliminar el registro."); }
    finally { setSaving(false); }
  }

  async function createRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !config?.createPath) return;
    if (section === "estudiantes" && dniBlocked) { setError("Ese DNI ya corresponde a un estudiante activo."); return; }
    const form = new FormData(event.currentTarget);
    const payload: Row = Object.fromEntries(form.entries());
    for (const field of config.fields || []) if ((field.type === "number" || field.name.endsWith("_id")) && payload[field.name]) payload[field.name] = Number(payload[field.name]);
    if (section === "matriculas") {
      const selectedChannel = options["/academicos/canales"]?.find((channel) => Number(channel.id) === Number(payload.canal_id));
      const selectedCycle = options["/academicos/ciclos?activos=true"]?.find((cycle) => Number(cycle.id) === Number(payload.ciclo_id));
      payload.pago_inicial = {
        concepto: `Matrícula · ${String(selectedChannel?.nombre || `Canal ${payload.canal_id}`)} · ${String(selectedCycle?.nombre || "ciclo académico")}`,
        monto: Number(payload.monto_matricula),
        monto_mensualidad: Number(payload.monto_mensualidad),
      };
      payload.canal_id = Number(payload.canal_id);
      delete payload.monto_matricula;
      delete payload.monto_mensualidad;
    }
    setSaving(true); setNotice(""); setError("");
    try {
      const isRejoining = section === "estudiantes" && Boolean(reincorporating);
      const changingStudentChannel = section === "estudiantes" && editingRow && Number(editingRow.canal_id) !== Number(payload.canal_id);
      const endpoint = isRejoining ? `/estudiantes/${reincorporating!.id}/reincorporar` : editingRow && config.updatePath ? `${config.updatePath}/${editingRow.id}` : config.createPath;
      const saved = await apiRequest<Row>(endpoint, token, { method: editingRow || isRejoining ? "PUT" : "POST", body: JSON.stringify(payload) });
      setCreating(false); setEditingRow(null); setReincorporating(null); setNotice(isRejoining ? `Estudiante reincorporado. ID de acceso ${saved.id_acceso}; se conservaron su código e historial. Registra la nueva matrícula del ciclo.` : changingStudentChannel ? "Canal actualizado. Registra la nueva matrícula del ciclo para habilitar asistencias y el plan de pagos." : editingRow ? "Cambios guardados en la base de datos." : section === "estudiantes" ? `Estudiante registrado. ID de acceso: ${saved.id_acceso}. Contraseña inicial: ${String(payload.password || "").trim() ? "la que ingresaste" : "su DNI"}.` : "Registro guardado en la base de datos."); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo guardar el registro."); }
    finally { setSaving(false); }
  }

  if (!config) return <div className="alert error">Esta sección no está configurada.</div>;
  return <section className="data-page">
    <div className="page-intro"><div><span className="eyebrow">DATOS DE LA ACADEMIA</span><h2>{config.title}</h2><p>{config.description}</p></div>
      {canCreate(usuario?.rol, section) && config.createPath && <button className="button primary" onClick={beginCreate}>＋ Nuevo registro</button>}
    </div>
    <div className="panel-toolbar"><label className="search-field"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} onBlur={(event) => void lookupInactiveStudent(event.currentTarget.value)} placeholder={section === "estudiantes" ? "Buscar por ID estudiante, nombre, DNI o código" : "Buscar en los registros"} /></label><span className="record-count">{loading ? "Consultando…" : `${filtered.length} registros`}</span></div>
    {error && <div className="alert error" role="alert">{error}</div>}{notice && <div className="alert success">{notice}</div>}
    <div className="table-panel"><div className="table-scroll"><table><thead><tr>{config.columns.map(([, title]) => <th key={title}>{title}</th>)}{canManage && <th>Acciones</th>}</tr></thead><tbody>
      {loading ? <tr><td colSpan={config.columns.length + Number(canManage)} className="table-message">Consultando la base de datos…</td></tr> : filtered.length === 0 ? <tr><td colSpan={config.columns.length + Number(canManage)} className="table-message">No hay registros para mostrar.</td></tr> : filtered.map((row, index) => { const status = section === "estudiantes" || section === "docentes" ? row.estado_usuario : row.estado; const active = status === "ACTIVO"; return <tr key={String(row.id ?? index)}>{config.columns.map(([key]) => <td key={key}>{key === "estado" || key === "estado_usuario" ? <span className={`record-status ${String(row[key] || "").toLowerCase()}`}>{section === "estudiantes" && row[key] === "INACTIVO" ? "Fuera" : humanize(row[key])}</span> : humanize(row[key])}</td>)}{canManage && <td><div className="record-actions"><button className="button secondary small" onClick={() => beginEdit(row)}>Editar</button>{section !== "horarios" && section !== "notas" && <button className={`button secondary small ${active ? "danger" : "success"}`} disabled={saving} onClick={() => section === "estudiantes" && !active ? beginReincorporation(row) : void changeStatus(row)}>{section === "estudiantes" ? active ? "Marcar fuera" : "Reincorporar" : active ? "Desactivar" : "Activar"}</button>}{section !== "estudiantes" && <button className="text-button danger-text" disabled={saving} onClick={() => void deleteRecord(row)}>{section === "horarios" || section === "notas" ? "Eliminar" : "Dar de baja"}</button>}</div></td>}</tr>; })}
    </tbody></table></div></div>
    {creating && config.fields && <div className={`modal-backdrop ${section === "estudiantes" ? "student-registration-backdrop" : ""}`} role="presentation"><section className="form-dialog" role="dialog" aria-modal="true"><div className="dialog-heading"><div><span className="eyebrow">{reincorporating ? "REINCORPORACIÓN" : editingRow ? "EDITAR REGISTRO" : "NUEVO REGISTRO"}</span><h2>{reincorporating ? `Reincorporar · ${reincorporating.nombres} ${reincorporating.apellidos}` : editingRow ? `Editar · ${config.title}` : config.title}</h2></div><button className="icon-button" onClick={() => { setCreating(false); setEditingRow(null); setReincorporating(null); }} aria-label="Cerrar">×</button></div>
      <form key={String(reincorporating?.id || "new-student-record")} onSubmit={createRecord} className="form-stack dialog-form"><div className="form-grid">{visibleFields.map((field) => { const sourceRecord = editingRow || reincorporating; const value = field.name === "estado" && sourceRecord?.estado === undefined ? sourceRecord?.estado_usuario : sourceRecord?.[field.name]; const defaultValue = field.type === "date" && value ? String(value).slice(0, 10) : value === null || value === undefined ? "" : String(value); return <label key={field.name}>{field.label}{field.type === "select" ? <select key={`${field.name}-${defaultValue}-${(field.options || options[field.source || ""] || []).length}`} name={field.name} required={field.required} defaultValue={defaultValue}><option value="">Seleccionar…</option>{(field.options ? field.options.map((option) => ({ ...option })) as Row[] : options[field.source || ""] || []).map((option) => <option key={String(option.id ?? option.value)} value={String(option.value ?? option.id ?? "")}>{String(option.label ?? (option.curso_nombre ? [`Canal ${option.canal_id}`, option.curso_nombre, option.nombre].join(" · ") : [option.nombre, option.nombres, option.apellidos].filter(Boolean).join(" ")))}</option>)}</select> : <input name={field.name} type={field.type || "text"} min={field.type === "number" ? "0.01" : undefined} step={field.type === "number" ? "0.01" : undefined} pattern={field.pattern} maxLength={field.maxLength} required={field.required} readOnly={field.name === "dni" && Boolean(reincorporating)} onChange={field.name === "dni" && !editingRow ? (event) => { if (!reincorporating) { const dni = event.currentTarget.value.trim(); setDniMessage(""); setDniBlocked(false); if (/^\d{8}$/.test(dni)) void lookupStudentDni(dni); } } : undefined} defaultValue={field.type === "password" && sourceRecord ? "" : defaultValue} />}</label>; })}</div>
        {section === "estudiantes" && dniMessage && <div className={`alert ${dniBlocked ? "error" : "success"}`} role="status">{dniLookupBusy ? "Consultando DNI…" : dniMessage}</div>}
        {section === "matriculas" && <p className="form-note">Se crearán cargos pendientes con códigos de pago. La matrícula se activa cuando secretaría registre el primer cobro recibido.</p>}
        {error && <div className="alert error">{error}</div>}<div className="dialog-actions"><button type="button" className="button secondary" onClick={() => { setCreating(false); setEditingRow(null); setReincorporating(null); }}>Cancelar</button><button className="button primary" disabled={saving || dniLookupBusy || dniBlocked}>{saving ? "Guardando…" : reincorporating ? "Aceptar reincorporación" : "Guardar"}</button></div>
      </form></section></div>}
  </section>;
}
