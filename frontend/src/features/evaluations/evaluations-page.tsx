"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api/client";

type Row = Record<string, any>;

export function EvaluationsPage() {
  const { token, usuario } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [groups, setGroups] = useState<Row[]>([]);
  const [students, setStudents] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Row | null>(null);
  const [grades, setGrades] = useState<Record<number, string>>({});
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const isStudent = usuario?.rol === "ESTUDIANTE";
  const canManage = usuario?.rol === "ADMINISTRADOR" || usuario?.rol === "DOCENTE";

  const refresh = useCallback(async () => {
    if (!token || !usuario) return;
    setLoading(true); setError("");
    try { setRows(await apiRequest<Row[]>(isStudent ? "/evaluaciones/me/notas" : "/evaluaciones", token)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudieron consultar las evaluaciones."); }
    finally { setLoading(false); }
  }, [token, usuario, isStudent]);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!token || !canManage) return;
    apiRequest<Row[]>(usuario?.rol === "DOCENTE" ? "/academicos/grupos/me" : "/academicos/grupos", token).then(setGroups)
      .catch((cause) => setError(cause instanceof Error ? cause.message : "No se pudieron consultar los grupos."));
  }, [token, usuario?.rol, canManage]);

  async function openEvaluation(evaluation: Row) {
    if (!token) return;
    setSelected(evaluation); setError(""); setMessage("");
    try {
      const [enrolled, registered] = await Promise.all([
        apiRequest<Row[]>(`/asistencias/grupos/${evaluation.grupo_id}/estudiantes`, token),
        apiRequest<Row[]>(`/evaluaciones/${evaluation.id}/notas`, token),
      ]);
      setStudents(enrolled); setGrades(Object.fromEntries(registered.map((grade) => [Number(grade.estudiante_id), String(grade.valor_nota)])));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo abrir el detalle."); }
  }

  async function createEvaluation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!token) return;
    const form = new FormData(event.currentTarget);
    const payload = { grupo_id: Number(form.get("grupo_id")), nombre_evaluacion: String(form.get("nombre_evaluacion")), fecha: String(form.get("fecha")) };
    try {
      const evaluation = await apiRequest<Row>("/evaluaciones", token, { method: "POST", body: JSON.stringify(payload) });
      setCreating(false); setMessage("Evaluación creada en borrador."); await refresh(); await openEvaluation(evaluation);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo crear la evaluación."); }
  }

  async function saveGrades() {
    if (!token || !selected) return;
    const entries = students.filter((student) => grades[Number(student.id)] !== undefined && grades[Number(student.id)] !== "");
    if (!entries.length || entries.some((student) => !Number.isFinite(Number(grades[Number(student.id)])) || Number(grades[Number(student.id)]) < 0 || Number(grades[Number(student.id)]) > 20)) { setError("Ingresa notas entre 0 y 20 para guardar."); return; }
    try {
      await apiRequest(`/evaluaciones/${selected.id}/notas`, token, { method: "POST", body: JSON.stringify(entries.map((student) => ({ estudiante_id: Number(student.id), valor_nota: Number(grades[Number(student.id)]) }))) });
      setMessage("Las notas quedaron guardadas en la base de datos."); await openEvaluation(selected); await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudieron guardar las notas."); }
  }

  async function publish() {
    if (!token || !selected) return;
    try {
      const result = await apiRequest<Row>(`/evaluaciones/${selected.id}/publicar`, token, { method: "PATCH" });
      setSelected(result); setMessage("Evaluación publicada."); await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo publicar la evaluación."); }
  }

  const columns = isStudent ? [["nombre_evaluacion", "Evaluación"], ["curso_nombre", "Curso"], ["grupo_nombre", "Grupo"], ["ciclo_nombre", "Ciclo"], ["fecha", "Periodo"], ["valor_nota", "Nota"]] : [["nombre_evaluacion", "Evaluación"], ["curso_nombre", "Curso"], ["grupo_nombre", "Grupo"], ["ciclo_nombre", "Ciclo"], ["fecha", "Periodo"], ["estado", "Estado"], ["total_notas", "Notas"]];
  return <section className="data-page">
    <div className="page-intro"><div><span className="eyebrow">SEGUIMIENTO ACADÉMICO</span><h2>{isStudent ? "Mis notas" : "Evaluaciones y notas"}</h2><p>{isStudent ? "Calificaciones publicadas consultadas desde la base de datos." : "Evaluaciones y calificaciones guardadas en el sistema."}</p></div><div className="page-actions"><button className="button secondary" onClick={() => void refresh()} disabled={loading}>{loading ? "Actualizando…" : "↻ Actualizar notas"}</button>{canManage && <button className="button primary" onClick={() => setCreating(true)}>＋ Nueva evaluación</button>}</div></div>
    {error && <div className="alert error" role="alert">{error}</div>}{message && <div className="alert success">{message}</div>}
    <section className="table-panel"><div className="section-heading"><div><h3>{isStudent ? "Calificaciones publicadas" : "Evaluaciones registradas"}</h3><p>{loading ? "Consultando MySQL…" : `${rows.length} registros`}</p></div></div><div className="table-scroll"><table><thead><tr>{columns.map(([, label]) => <th key={label}>{label}</th>)}{canManage && <th>Detalle</th>}</tr></thead><tbody>{loading ? <tr><td className="table-message" colSpan={columns.length + Number(canManage)}>Consultando…</td></tr> : rows.length === 0 ? <tr><td className="table-message" colSpan={columns.length + Number(canManage)}>No hay datos registrados.</td></tr> : rows.map((row) => <tr key={row.id ?? `${row.evaluacion_id}-${row.estudiante_id}`}>{columns.map(([key]) => <td key={key}>{key === "fecha" ? dateLabel(row[key]) : row[key] ?? "—"}</td>)}{canManage && <td><button className="button secondary small" onClick={() => void openEvaluation(row)}>Ver notas</button></td>}</tr>)}</tbody></table></div></section>
    {selected && canManage && <section className="table-panel evaluation-detail"><div className="section-heading"><div><h3>{selected.nombre_evaluacion}</h3><p>{selected.curso_nombre} · {selected.grupo_nombre} · {selected.estado}</p></div><button className="icon-button" onClick={() => setSelected(null)} aria-label="Cerrar">×</button></div><div className="table-scroll"><table><thead><tr><th>Código</th><th>Estudiante</th><th>Nota (0–20)</th></tr></thead><tbody>{students.length === 0 ? <tr><td colSpan={3} className="table-message">No hay matrículas activas en el grupo.</td></tr> : students.map((student) => <tr key={student.id}><td>{student.codigo_estudiante}</td><td>{student.apellidos}, {student.nombres}</td><td><input className="grade-input" type="number" min="0" max="20" step="0.01" value={grades[Number(student.id)] ?? ""} disabled={selected.estado === "PUBLICADA"} onChange={(event) => setGrades((current) => ({ ...current, [Number(student.id)]: event.target.value }))} /></td></tr>)}</tbody></table></div>{selected.estado !== "PUBLICADA" && <div className="dialog-actions"><button className="button primary" onClick={() => void saveGrades()}>Guardar borrador</button><button className="button secondary" onClick={() => void publish()}>Publicar evaluación</button></div>}</section>}
    {creating && <div className="modal-backdrop"><section className="form-dialog" role="dialog" aria-modal="true"><div className="dialog-heading"><div><span className="eyebrow">NUEVO REGISTRO</span><h2>Crear evaluación</h2></div><button className="icon-button" onClick={() => setCreating(false)} aria-label="Cerrar">×</button></div><form className="form-stack dialog-form" onSubmit={createEvaluation}><label>Grupo<select name="grupo_id" required defaultValue=""><option value="">Seleccionar grupo…</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.curso_nombre} · {group.nombre}</option>)}</select></label><label>Nombre<input name="nombre_evaluacion" required maxLength={150} /></label><label>Fecha<input name="fecha" type="date" required /></label><div className="dialog-actions"><button type="button" className="button secondary" onClick={() => setCreating(false)}>Cancelar</button><button className="button primary">Crear borrador</button></div></form></section></div>}
  </section>;
}

function dateLabel(value: string) { return value ? new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(`${String(value).slice(0, 10)}T12:00:00`)) : "—"; }
