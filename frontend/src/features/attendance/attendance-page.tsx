"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api/client";

type Row = Record<string, any>;
type ScheduleException = { canal_id: number; fecha: string; motivo?: string };
const weekdays = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];

export function AttendancePage() {
  const { token, usuario } = useAuth();
  const [sessions, setSessions] = useState<Row[]>([]);
  const [groups, setGroups] = useState<Row[]>([]);
  const [exceptions, setExceptions] = useState<ScheduleException[]>([]);
  const [students, setStudents] = useState<Row[]>([]);
  const [session, setSession] = useState<Row | null>(null);
  const [states, setStates] = useState<Record<number, string>>({});
  const [groupId, setGroupId] = useState("");
  const [date, setDate] = useState(todayInput);
  const [loading, setLoading] = useState(true);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const isStudent = usuario?.rol === "ESTUDIANTE";
  const isTeacher = usuario?.rol === "DOCENTE";
  const canTakeAttendance = isTeacher || usuario?.rol === "ADMINISTRADOR";

  const refresh = useCallback(async () => {
    if (!token || !usuario) return;
    setLoading(true); setError("");
    try {
      const data = await apiRequest<Row[]>(isStudent ? "/asistencias/me" : "/asistencias", token);
      setSessions(data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo consultar la asistencia."); }
    finally { setLoading(false); }
  }, [token, usuario, isStudent]);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!token || !canTakeAttendance) return;
    setGroupsLoading(true);
    Promise.all([
      apiRequest<Row[]>(isTeacher ? "/academicos/grupos/me" : "/academicos/grupos", token),
      apiRequest<ScheduleException[]>("/academicos/horarios/excepciones", token),
    ]).then(([nextGroups, nextExceptions]) => { setGroups(nextGroups); setExceptions(nextExceptions); })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "No se pudieron consultar las clases asignadas."))
      .finally(() => setGroupsLoading(false));
  }, [token, usuario?.rol, canTakeAttendance, isTeacher]);

  const todaysClasses = useMemo(() => {
    if (!isTeacher || !date) return [];
    const weekday = weekdays[new Date(`${date}T12:00:00`).getDay()];
    return groups.flatMap((group) => (group.horarios || []).filter((item: Row) => {
      const start = String(item.fecha_inicio || group.ciclo_fecha_inicio || "").slice(0, 10);
      const end = String(item.fecha_fin || group.ciclo_fecha_fin || "").slice(0, 10);
      const holiday = exceptions.some((exception) => Number(exception.canal_id) === Number(group.canal_id) && exception.fecha === date);
      return item.dia_semana === weekday && (!start || start <= date) && (!end || end >= date) && !holiday;
    }).map((schedule: Row) => ({ ...schedule, group })))
      .sort((a, b) => String(a.hora_inicio).localeCompare(String(b.hora_inicio)));
  }, [groups, exceptions, date, isTeacher]);

  async function openAttendance(selectedGroupId: number, selectedDate: string) {
    if (!token) return;
    setGroupId(String(selectedGroupId)); setDate(selectedDate); setError(""); setMessage("");
    try {
      const opened = await apiRequest<Row>("/asistencias/sesiones", token, { method: "POST", body: JSON.stringify({ grupo_id: selectedGroupId, fecha: selectedDate }) });
      const enrolled = await apiRequest<Row[]>(`/asistencias/grupos/${selectedGroupId}/estudiantes?fecha=${selectedDate}`, token);
      setSession(opened); setStudents(enrolled);
      setStates(Object.fromEntries((opened.detalles || []).map((row: Row) => [Number(row.estudiante_id), row.estado_asistencia])));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo abrir la asistencia."); }
  }

  async function startSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!groupId) return;
    await openAttendance(Number(groupId), date);
  }

  async function saveAttendance() {
    if (!token || !session) return;
    if (students.some((student) => !states[Number(student.id)])) { setError("Selecciona presente, tardanza, falta o justificado para cada estudiante."); return; }
    setError(""); setMessage(""); setSaving(true);
    try {
      const details = students.map((student) => ({ estudiante_id: Number(student.id), estado_asistencia: states[Number(student.id)] }));
      const updated = await apiRequest<Row>(`/asistencias/sesiones/${session.id}`, token, { method: "PUT", body: JSON.stringify({ detalles: details }) });
      setSession(updated); setMessage("La asistencia quedó guardada."); await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo guardar la asistencia."); }
    finally { setSaving(false); }
  }

  async function closeSession() {
    if (!token || !session) return;
    setError(""); setSaving(true);
    try {
      const updated = await apiRequest<Row>(`/asistencias/sesiones/${session.id}/cerrar`, token, { method: "PATCH" });
      setSession(updated); setMessage("La asistencia de esta clase se cerró."); await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo cerrar la sesión."); }
    finally { setSaving(false); }
  }

  const studentSummaries = isStudent ? summarizeAttendance(sessions) : [];
  const studentColumns = [["curso_nombre", "Curso"], ["grupo_nombre", "Grupo"], ["porcentaje", "Asistencia"]];
  const columns = isStudent ? studentColumns : [["fecha", "Fecha"], ["curso_nombre", "Curso"], ["grupo_nombre", "Grupo"], ["ciclo_nombre", "Ciclo"], ["docente_nombres", "Docente"], ["total_estudiantes", "Registrados"], ["presentes", "Presentes"], ["ausentes", "Ausentes"], ["tardanzas", "Tardanzas"], ["justificados", "Justificados"], ["estado", "Sesión"]];
  const visibleRows = isStudent ? studentSummaries : sessions;
  const selectedGroup = groups.find((group) => Number(group.id) === Number(groupId));
  return <section className="data-page">
    <div className="page-intro"><div><span className="eyebrow">SEGUIMIENTO ACADÉMICO</span><h2>{isStudent ? "Mi asistencia" : isTeacher ? "Asistencia de mis clases" : "Asistencia"}</h2><p>{isTeacher ? "Revisa el curso, aula y hora de hoy; abre cada clase para registrar a sus estudiantes." : isStudent ? "Consulta tu porcentaje de asistencia por curso." : "Sesiones y registros de asistencia de la academia."}</p></div></div>
    {error && <div className="alert error" role="alert">{error}</div>}{message && <div className="alert success">{message}</div>}
    {canTakeAttendance && <section className="table-panel attendance-entry">
      {isTeacher ? <><div className="section-heading"><div><h3>Clases de hoy · {formatDate(date)}</h3><p>El registro se abre desde la clase programada y su aula asignada.</p></div><Link className="button secondary small" href="/horarios">Ver horario semanal →</Link></div>
        {groupsLoading ? <p className="table-message">Cargando tus clases…</p> : todaysClasses.length ? <div className="teacher-attendance-classes">{todaysClasses.map(({ group, ...schedule }) => <article key={`${group.id}-${schedule.id}`}><div className="teacher-attendance-time"><span>HOY</span><strong>{timeLabel(schedule.hora_inicio)}–{timeLabel(schedule.hora_fin)}</strong></div><div className="teacher-attendance-info"><strong>{group.curso_nombre}</strong><span>{group.nombre} · {group.ciclo_nombre}</span></div><div className="teacher-attendance-room"><small>AULA</small><strong>{schedule.aula || "Sin aula asignada"}</strong></div><button className="button primary" disabled={saving} onClick={() => void openAttendance(Number(group.id), date)}>{session?.grupo_id === group.id && session?.fecha === date ? "Asistencia abierta" : "Pasar asistencia"}</button></article>)}</div> : <div className="schedule-empty"><span className="schedule-empty-icon">◷</span><h3>{groupsLoading ? "Consultando horario" : "Hoy no tienes clases programadas"}</h3><p>Las clases asignadas para hoy aparecerán aquí con su aula y curso.</p><Link href="/horarios">Consultar horario semanal →</Link></div>}
      </> : <><div className="section-heading"><div><h3>Registrar sesión</h3><p>Selecciona un grupo y una fecha con clase programada.</p></div></div><form className="attendance-start" onSubmit={startSession}><label>Grupo<select value={groupId} onChange={(event) => setGroupId(event.target.value)} required><option value="">Seleccionar grupo…</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.curso_nombre} · {group.nombre}</option>)}</select></label><label>Fecha<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label><button className="button primary" disabled={saving}>Abrir asistencia</button></form></>}
      {session && <div className="attendance-session"><div className="section-heading"><div><span className="eyebrow">{selectedGroup?.curso_nombre || session.curso_nombre}</span><h3>{session.grupo_nombre}</h3><p>{selectedGroup?.ciclo_nombre || session.ciclo_nombre} · {selectedGroup ? `${selectedGroup.docente_nombres || ""} ${selectedGroup.docente_apellidos || ""}` : `${session.docente_nombres || ""} ${session.docente_apellidos || ""}`} · {formatDate(session.fecha)} · {session.estado}</p></div><span className="attendance-room-badge">{findRoom(selectedGroup, date) || "Aula asignada en horario"}</span></div>
        {students.length === 0 ? <div className="admin-empty-state compact"><strong>No hay estudiantes con matrícula activa para este turno</strong><p>Las matrículas del canal y del ciclo deben estar activas para aparecer en la lista.</p></div> : <div className="table-scroll"><table><thead><tr><th>Código</th><th>Estudiante</th><th>Asistencia</th></tr></thead><tbody>{students.map((student) => <tr key={student.id}><td>{student.codigo_estudiante}</td><td>{student.apellidos}, {student.nombres}</td><td><select value={states[Number(student.id)] || ""} disabled={session.estado === "CERRADA"} onChange={(event) => setStates((current) => ({ ...current, [Number(student.id)]: event.target.value }))}><option value="">Seleccionar estado…</option><option value="PRESENTE">Presente</option><option value="TARDANZA">Tardanza</option><option value="AUSENTE">Falta</option><option value="JUSTIFICADO">Justificado</option></select></td></tr>)}</tbody></table></div>}
        {session.estado === "ABIERTA" && students.length > 0 && <div className="dialog-actions"><button className="button secondary" disabled={saving} onClick={() => void closeSession()}>Cerrar sesión</button><button className="button primary" disabled={saving} onClick={() => void saveAttendance()}>{saving ? "Guardando…" : "Guardar asistencia"}</button></div>}
      </div>}
    </section>}
    <section className="table-panel"><div className="section-heading"><div><h3>{isStudent ? "Porcentaje de asistencia por curso" : "Sesiones registradas"}</h3><p>{loading ? "Consultando…" : `${visibleRows.length} ${isStudent ? "cursos" : "registros"}`}</p></div></div><div className="table-scroll"><table><thead><tr>{columns.map(([, label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan={columns.length} className="table-message">Consultando…</td></tr> : visibleRows.length === 0 ? <tr><td colSpan={columns.length} className="table-message">No hay registros de asistencia.</td></tr> : visibleRows.map((row, index) => <tr key={String(row.id ?? `${row.curso_nombre}-${row.grupo_nombre}-${index}`)}>{columns.map(([key]) => <td key={key}>{key === "fecha" ? formatDate(row[key]) : row[key] ?? "—"}</td>)}</tr>)}</tbody></table></div></section>
  </section>;
}

function todayInput() { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function formatDate(value: string) { if (!value) return "—"; const date = new Date(`${String(value).slice(0, 10)}T12:00:00`); return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(date); }
function timeLabel(value: string) { return value ? String(value).slice(0, 5) : "—"; }
function findRoom(group: Row | undefined, date: string) { if (!group) return ""; const weekday = weekdays[new Date(`${date}T12:00:00`).getDay()]; return group.horarios?.find((item: Row) => item.dia_semana === weekday && (!item.fecha_inicio || String(item.fecha_inicio).slice(0, 10) <= date) && (!item.fecha_fin || String(item.fecha_fin).slice(0, 10) >= date))?.aula || ""; }
function summarizeAttendance(sessions: Row[]) {
  const summary = new Map<string, Row>();
  for (const session of sessions) {
    const key = `${session.curso_nombre}::${session.grupo_nombre}`;
    const row = summary.get(key) || { curso_nombre: session.curso_nombre, grupo_nombre: session.grupo_nombre, puntos: 0, total: 0 };
    if (session.estado_asistencia !== "JUSTIFICADO") { row.total += 2; if (session.estado_asistencia === "PRESENTE") row.puntos += 2; if (session.estado_asistencia === "TARDANZA") row.puntos += 1; }
    row.porcentaje = row.total ? `${((row.puntos / row.total) * 100).toLocaleString("es-PE", { maximumFractionDigits: 1 })}%` : "Sin sesiones computables";
    summary.set(key, row);
  }
  return [...summary.values()];
}
