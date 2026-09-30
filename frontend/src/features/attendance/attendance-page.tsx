"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api/client";

type Row = Record<string, any>;

export function AttendancePage() {
  const { token, usuario } = useAuth();
  const [sessions, setSessions] = useState<Row[]>([]);
  const [groups, setGroups] = useState<Row[]>([]);
  const [students, setStudents] = useState<Row[]>([]);
  const [session, setSession] = useState<Row | null>(null);
  const [states, setStates] = useState<Record<number, string>>({});
  const [groupId, setGroupId] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const isStudent = usuario?.rol === "ESTUDIANTE";
  const canTakeAttendance = usuario?.rol === "DOCENTE" || usuario?.rol === "ADMINISTRADOR";

  const refresh = useCallback(async () => {
    if (!token || !usuario) return;
    setLoading(true); setError("");
    try {
      const path = isStudent ? "/asistencias/me" : "/asistencias";
      const data = await apiRequest<Row[]>(path, token);
      setSessions(data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo consultar la asistencia."); }
    finally { setLoading(false); }
  }, [token, usuario, isStudent]);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!token || !canTakeAttendance) return;
    apiRequest<Row[]>(usuario?.rol === "DOCENTE" ? "/academicos/grupos/me" : "/academicos/grupos", token)
      .then(setGroups).catch((cause) => setError(cause instanceof Error ? cause.message : "No se pudieron consultar los grupos."));
  }, [token, usuario?.rol, canTakeAttendance]);

  async function startSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!token || !groupId) return;
    setError(""); setMessage("");
    try {
      const opened = await apiRequest<Row>("/asistencias/sesiones", token, { method: "POST", body: JSON.stringify({ grupo_id: Number(groupId), fecha: date }) });
      const enrolled = await apiRequest<Row[]>(`/asistencias/grupos/${groupId}/estudiantes`, token);
      setSession(opened); setStudents(enrolled);
      const existing = Object.fromEntries((opened.detalles || []).map((row: Row) => [Number(row.estudiante_id), row.estado_asistencia]));
      setStates(existing);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo abrir la sesión."); }
  }

  async function saveAttendance() {
    if (!token || !session) return;
    if (students.some((student) => !states[Number(student.id)])) { setError("Selecciona un estado para cada estudiante antes de guardar."); return; }
    setError(""); setMessage("");
    try {
      const details = students.map((student) => ({ estudiante_id: Number(student.id), estado_asistencia: states[Number(student.id)] }));
      const updated = await apiRequest<Row>(`/asistencias/sesiones/${session.id}`, token, { method: "PUT", body: JSON.stringify({ detalles: details }) });
      setSession(updated); setMessage("La asistencia quedó guardada en la base de datos."); await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo guardar la asistencia."); }
  }

  async function closeSession() {
    if (!token || !session) return;
    setError("");
    try {
      const updated = await apiRequest<Row>(`/asistencias/sesiones/${session.id}/cerrar`, token, { method: "PATCH" });
      setSession(updated); setMessage("La sesión se cerró."); await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo cerrar la sesión."); }
  }

  const columns = isStudent ? [["fecha", "Fecha"], ["curso_nombre", "Curso"], ["grupo_nombre", "Grupo"], ["estado_asistencia", "Estado"]] : [["fecha", "Fecha"], ["curso_nombre", "Curso"], ["grupo_nombre", "Grupo"], ["total_estudiantes", "Registrados"], ["presentes", "Presentes"], ["ausentes", "Ausentes"], ["tardanzas", "Tardanzas"], ["estado", "Sesión"]];
  return <section className="data-page">
    <div className="page-intro"><div><span className="eyebrow">SEGUIMIENTO ACADÉMICO</span><h2>{isStudent ? "Mi asistencia" : "Asistencia"}</h2><p>Registros y sesiones de asistencia consultados desde la base de datos.</p></div></div>
    {error && <div className="alert error" role="alert">{error}</div>}{message && <div className="alert success">{message}</div>}
    {canTakeAttendance && <section className="table-panel attendance-entry"><div className="section-heading"><div><h3>Registrar sesión</h3><p>Selecciona un grupo asignado y la fecha de la clase.</p></div></div>
      <form className="attendance-start" onSubmit={startSession}><label>Grupo<select value={groupId} onChange={(event) => setGroupId(event.target.value)} required><option value="">Seleccionar grupo…</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.curso_nombre} · {group.nombre}</option>)}</select></label><label>Fecha<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label><button className="button primary">Abrir registro</button></form>
      {session && <div className="attendance-session"><div className="section-heading"><div><h3>{session.curso_nombre} · {session.grupo_nombre}</h3><p>{formatDate(session.fecha)} · {session.estado}</p></div></div>
        {students.length === 0 ? <p className="table-message">No hay estudiantes con matrícula activa en este grupo.</p> : <div className="table-scroll"><table><thead><tr><th>Código</th><th>Estudiante</th><th>Asistencia</th></tr></thead><tbody>{students.map((student) => <tr key={student.id}><td>{student.codigo_estudiante}</td><td>{student.apellidos}, {student.nombres}</td><td><select value={states[Number(student.id)] || ""} disabled={session.estado === "CERRADA"} onChange={(event) => setStates((current) => ({ ...current, [Number(student.id)]: event.target.value }))}><option value="">Seleccionar…</option><option value="PRESENTE">Presente</option><option value="AUSENTE">Ausente</option><option value="TARDANZA">Tardanza</option></select></td></tr>)}</tbody></table></div>}
        {session.estado === "ABIERTA" && <div className="dialog-actions"><button className="button secondary" onClick={() => void closeSession()}>Cerrar sesión</button><button className="button primary" onClick={() => void saveAttendance()}>Guardar asistencia</button></div>}
      </div>}
    </section>}
    <section className="table-panel"><div className="section-heading"><div><h3>{isStudent ? "Historial de asistencia" : "Sesiones registradas"}</h3><p>{loading ? "Consultando MySQL…" : `${sessions.length} registros`}</p></div></div><div className="table-scroll"><table><thead><tr>{columns.map(([, label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan={columns.length} className="table-message">Consultando…</td></tr> : sessions.length === 0 ? <tr><td colSpan={columns.length} className="table-message">No hay registros de asistencia.</td></tr> : sessions.map((row, index) => <tr key={String(row.id ?? `${row.fecha}-${index}`)}>{columns.map(([key]) => <td key={key}>{key === "fecha" ? formatDate(row[key]) : row[key] ?? "—"}</td>)}</tr>)}</tbody></table></div></section>
  </section>;
}

function formatDate(value: string) { return value ? new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(value)) : "—"; }
