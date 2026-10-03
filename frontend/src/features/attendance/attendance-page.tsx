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
  const [selectedRoom, setSelectedRoom] = useState("");
  const [scheduleSearch, setScheduleSearch] = useState("");
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

  const teacherLessons = useMemo(() => {
    if (!isTeacher) return [];
    const lessons: Row[] = [];
    for (const group of groups) for (const schedule of group.horarios || []) {
      const start = String(schedule.fecha_inicio || group.ciclo_fecha_inicio || "").slice(0, 10);
      const end = String(schedule.fecha_fin || group.ciclo_fecha_fin || "").slice(0, 10);
      if (!start || !end) continue;
      const cursor = new Date(`${start}T12:00:00`);
      const last = new Date(`${end}T12:00:00`);
      for (; cursor <= last; cursor.setDate(cursor.getDate() + 1)) {
        const classDate = dateInput(cursor);
        const weekday = weekdays[cursor.getDay()];
        const holiday = exceptions.some((exception) => Number(exception.canal_id) === Number(group.canal_id) && exception.fecha === classDate);
        if (schedule.dia_semana === weekday && !holiday) lessons.push({ ...schedule, group, date: classDate, key: `${group.id}-${schedule.id}-${classDate}` });
      }
    }
    return lessons.sort((a, b) => String(a.date).localeCompare(String(b.date)) || String(a.hora_inicio).localeCompare(String(b.hora_inicio)));
  }, [groups, exceptions, isTeacher]);
  const teacherRooms = useMemo(() => [...new Set(teacherLessons.map((lesson) => String(lesson.aula || "Aula sin asignar")))].sort((a, b) => a.localeCompare(b, "es", { numeric: true })), [teacherLessons]);
  const selectedRoomLessons = useMemo(() => {
    const query = scheduleSearch.trim().toLocaleLowerCase("es");
    return teacherLessons.filter((lesson) => String(lesson.aula || "Aula sin asignar") === selectedRoom)
      .filter((lesson) => !query || [lesson.date, formatDate(lesson.date), lesson.group.curso_nombre, lesson.group.nombre, lesson.group.ciclo_nombre].some((value) => String(value || "").toLocaleLowerCase("es").includes(query)));
  }, [teacherLessons, selectedRoom, scheduleSearch]);

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
    <div className="page-intro"><div><span className="eyebrow">SEGUIMIENTO ACADÉMICO</span><h2>{isStudent ? "Mi asistencia" : isTeacher ? "Aulas y asistencia" : "Asistencia"}</h2><p>{isTeacher ? "Elige un aula para revisar tus clases programadas y registrar la asistencia." : isStudent ? "Consulta tu porcentaje de asistencia por curso." : "Sesiones y registros de asistencia de la academia."}</p></div></div>
    {error && <div className="alert error" role="alert">{error}</div>}{message && <div className="alert success">{message}</div>}
    {canTakeAttendance && <section className="table-panel attendance-entry">
      {isTeacher ? (session ? <div className="attendance-open-heading"><button className="admin-back-link" onClick={() => { setSession(null); setStudents([]); setStates({}); }}>← Volver a {selectedRoom}</button><p>{selectedRoom} · {formatDate(session.fecha)} · {session.grupo_nombre}</p></div> : <>
        <div className="section-heading"><div><h3>{selectedRoom ? selectedRoom : "Selecciona tu aula"}</h3><p>{selectedRoom ? `${selectedRoomLessons.length} clases programadas. Busca por fecha, curso o grupo.` : "Tus aulas muestran cuántas clases tienes y la próxima fecha programada."}</p></div><div className="attendance-room-actions">{selectedRoom && <button className="button secondary small" onClick={() => { setSelectedRoom(""); setScheduleSearch(""); }}>← Todas las aulas</button>}<Link className="button secondary small" href="/horarios">Horario semanal</Link></div></div>
        {groupsLoading ? <p className="table-message">Cargando tus aulas…</p> : !teacherRooms.length ? <div className="schedule-empty"><span className="schedule-empty-icon">⌂</span><h3>Aún no tienes aulas asignadas</h3><p>Cuando administración te asigne clases, aparecerán aquí con sus fechas y horarios.</p><Link href="/horarios">Consultar horario →</Link></div> : !selectedRoom ? <div className="attendance-room-grid">{teacherRooms.map((room) => { const lessons = teacherLessons.filter((lesson) => String(lesson.aula || "Aula sin asignar") === room); const next = lessons.find((lesson) => lesson.date >= todayInput()) || lessons[0]; return <button className="attendance-room-card" key={room} onClick={() => { setSelectedRoom(room); setScheduleSearch(""); }}><span className="attendance-room-card-icon">⌂</span><span className="eyebrow">AULA</span><strong>{room.replace(/^Aula\s*/i, "")}</strong><small>{lessons.length} {lessons.length === 1 ? "clase" : "clases"} programadas</small><span className="attendance-room-next">{next ? `Próxima: ${formatDate(next.date)} · ${timeLabel(next.hora_inicio)}` : "Sin próximas clases"}</span><b>Ver clases →</b></button>; })}</div> : <><label className="attendance-schedule-search"><span>⌕</span><input type="search" value={scheduleSearch} onChange={(event) => setScheduleSearch(event.target.value)} placeholder="Buscar por fecha, curso o grupo" /><span className="attendance-search-count">{selectedRoomLessons.length} resultados</span></label>{selectedRoomLessons.length ? <div className="attendance-room-lessons">{selectedRoomLessons.map((lesson) => <article key={lesson.key}><div className="attendance-lesson-date"><span>{getWeekdayLabel(lesson.date)}</span><strong>{formatDate(lesson.date)}</strong></div><div className="attendance-lesson-course"><strong>{lesson.group.curso_nombre}</strong><small>{lesson.group.nombre} · {lesson.group.ciclo_nombre}</small></div><div className="attendance-lesson-time"><span>{timeLabel(lesson.hora_inicio)}–{timeLabel(lesson.hora_fin)}</span><small>{lesson.aula}</small></div><button className="button primary" disabled={saving} onClick={() => void openAttendance(Number(lesson.group.id), lesson.date)}>{isSameSession(session, lesson.group.id, lesson.date) ? "Registro abierto" : "Pasar asistencia"}</button></article>)}</div> : <div className="schedule-empty"><h3>No hay clases que coincidan</h3><p>Prueba con otra fecha, curso o grupo.</p></div>}</>}
      </>) : <><div className="section-heading"><div><h3>Registrar sesión</h3><p>Selecciona un grupo y una fecha con clase programada.</p></div></div><form className="attendance-start" onSubmit={startSession}><label>Grupo<select value={groupId} onChange={(event) => setGroupId(event.target.value)} required><option value="">Seleccionar grupo…</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.curso_nombre} · {group.nombre}</option>)}</select></label><label>Fecha<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label><button className="button primary" disabled={saving}>Abrir asistencia</button></form></>}
      {session && <div className="attendance-session"><div className="section-heading"><div><span className="eyebrow">{selectedGroup?.curso_nombre || session.curso_nombre}</span><h3>{session.grupo_nombre}</h3><p>{selectedGroup?.ciclo_nombre || session.ciclo_nombre} · {selectedGroup ? `${selectedGroup.docente_nombres || ""} ${selectedGroup.docente_apellidos || ""}` : `${session.docente_nombres || ""} ${session.docente_apellidos || ""}`} · {formatDate(session.fecha)} · {session.estado}</p></div><span className="attendance-room-badge">{findRoom(selectedGroup, date) || "Aula asignada en horario"}</span></div>
        {students.length === 0 ? <div className="admin-empty-state compact"><strong>No hay estudiantes con matrícula activa para este turno</strong><p>Las matrículas del canal y del ciclo deben estar activas para aparecer en la lista.</p></div> : <div className="table-scroll"><table><thead><tr><th>Código</th><th>Estudiante</th><th>Asistencia</th></tr></thead><tbody>{students.map((student) => <tr key={student.id}><td>{student.codigo_estudiante}</td><td>{student.apellidos}, {student.nombres}</td><td><select value={states[Number(student.id)] || ""} disabled={session.estado === "CERRADA"} onChange={(event) => setStates((current) => ({ ...current, [Number(student.id)]: event.target.value }))}><option value="">Seleccionar estado…</option><option value="PRESENTE">Presente</option><option value="TARDANZA">Tardanza</option><option value="AUSENTE">Falta</option><option value="JUSTIFICADO">Justificado</option></select></td></tr>)}</tbody></table></div>}
        {session.estado === "ABIERTA" && students.length > 0 && <div className="dialog-actions"><button className="button secondary" disabled={saving} onClick={() => void closeSession()}>Cerrar sesión</button><button className="button primary" disabled={saving} onClick={() => void saveAttendance()}>{saving ? "Guardando…" : "Guardar asistencia"}</button></div>}
      </div>}
    </section>}
    <section className="table-panel"><div className="section-heading"><div><h3>{isStudent ? "Porcentaje de asistencia por curso" : "Sesiones registradas"}</h3><p>{loading ? "Consultando…" : `${visibleRows.length} ${isStudent ? "cursos" : "registros"}`}</p></div></div><div className="table-scroll"><table><thead><tr>{columns.map(([, label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan={columns.length} className="table-message">Consultando…</td></tr> : visibleRows.length === 0 ? <tr><td colSpan={columns.length} className="table-message">No hay registros de asistencia.</td></tr> : visibleRows.map((row, index) => <tr key={String(row.id ?? `${row.curso_nombre}-${row.grupo_nombre}-${index}`)}>{columns.map(([key]) => <td key={key}>{key === "fecha" ? formatDate(row[key]) : row[key] ?? "—"}</td>)}</tr>)}</tbody></table></div></section>
  </section>;
}

function getWeekdayLabel(date: string) { return new Intl.DateTimeFormat("es-PE", { weekday: "long" }).format(new Date(`${date}T12:00:00`)); }
function isSameSession(session: Row | null, groupId: number, date: string) { return Boolean(session && Number(session.grupo_id) === groupId && session.fecha === date); }
function dateInput(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function todayInput() { return dateInput(new Date()); }
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
