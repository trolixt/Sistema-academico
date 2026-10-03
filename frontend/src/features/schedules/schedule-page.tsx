"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api/client";

type Row = Record<string, any>;
type ScheduleException = { canal_id: number; fecha: string };
const weekdays = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];
const weekdayLabel: Record<string, string> = { LUNES: "Lunes", MARTES: "Martes", MIERCOLES: "Miércoles", JUEVES: "Jueves", VIERNES: "Viernes", SABADO: "Sábado", DOMINGO: "Domingo" };

export function SchedulePage() {
  const { token, usuario } = useAuth();
  const [groups, setGroups] = useState<Row[]>([]);
  const [exceptions, setExceptions] = useState<ScheduleException[]>([]);
  const [today, setToday] = useState("");
  const [filter, setFilter] = useState("TODOS");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const canCreate = usuario?.rol === "ADMINISTRADOR";

  const refresh = useCallback(async () => {
    if (!token || !usuario) return;
    setLoading(true); setError("");
    try {
      const path = usuario.rol === "ESTUDIANTE" || usuario.rol === "DOCENTE" ? "/academicos/grupos/me" : "/academicos/grupos";
      const [nextGroups, nextExceptions] = await Promise.all([
        apiRequest<Row[]>(path, token),
        apiRequest<ScheduleException[]>("/academicos/horarios/excepciones", token),
      ]);
      setGroups(nextGroups); setExceptions(nextExceptions);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudieron consultar los horarios."); }
    finally { setLoading(false); }
  }, [token, usuario]);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { const now = new Date(); setToday(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`); }, []);

  const schedules = useMemo<Row[]>(() => groups.flatMap((group) => (Array.isArray(group.horarios) ? group.horarios : []).map((schedule: Row) => ({
    ...schedule,
    grupo_id: Number(group.id),
    canal_id: Number(group.canal_id),
    fecha_inicio: schedule.fecha_inicio || group.ciclo_fecha_inicio,
    fecha_fin: schedule.fecha_fin || group.ciclo_fecha_fin,
    grupo_nombre: group.nombre,
    curso_nombre: group.curso_nombre,
    docente: [group.docente_nombres, group.docente_apellidos].filter(Boolean).join(" "),
  } as Row))).filter((schedule) => (filter === "TODOS" || String(schedule.grupo_id) === filter)
    && (!today || ((!schedule.fecha_inicio || String(schedule.fecha_inicio).slice(0, 10) <= today) && (!schedule.fecha_fin || String(schedule.fecha_fin).slice(0, 10) >= today)))
    && !exceptions.some((exception) => Number(exception.canal_id) === Number(schedule.canal_id) && exception.fecha === weekdayDate(today, schedule.dia_semana)))
    .sort((a, b) => weekdays.indexOf(a.dia_semana) - weekdays.indexOf(b.dia_semana) || String(a.hora_inicio).localeCompare(String(b.hora_inicio))), [groups, filter, exceptions, today]);

  async function createSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!token) return;
    const form = new FormData(event.currentTarget);
    const payload = { grupo_id: Number(form.get("grupo_id")), dia_semana: String(form.get("dia_semana")), hora_inicio: String(form.get("hora_inicio")), hora_fin: String(form.get("hora_fin")), aula: String(form.get("aula")) };
    setSaving(true); setError(""); setNotice("");
    try {
      await apiRequest("/academicos/horarios", token, { method: "POST", body: JSON.stringify(payload) });
      setShowForm(false); setNotice("El horario quedó guardado."); await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo guardar el horario."); }
    finally { setSaving(false); }
  }

  return <section className="schedule-page">
    <div className="page-intro"><div><span className="eyebrow">ORGANIZACIÓN ACADÉMICA</span><h2>{usuario?.rol === "ESTUDIANTE" || usuario?.rol === "DOCENTE" ? "Mi horario semanal" : "Horario semanal"}</h2><p>Clases y aulas organizadas por día, según los grupos y horarios registrados.</p></div>{canCreate && <button className="button primary" onClick={() => setShowForm((open) => !open)}>{showForm ? "Cerrar formulario" : "＋ Agregar horario"}</button>}</div>
    <div className="schedule-toolbar"><div><strong>{schedules.length}</strong> {schedules.length === 1 ? "clase programada" : "clases programadas"}</div><label>Grupo<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="TODOS">Todos mis grupos</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.curso_nombre} · {group.nombre}</option>)}</select></label></div>
    {error && <div className="alert error" role="alert">{error}</div>}{notice && <div className="alert success">{notice}</div>}
    {showForm && canCreate && <section className="table-panel schedule-form-panel"><div className="section-heading"><div><h3>Programar una clase</h3><p>El sistema avisará si coincide con otra clase del docente o del aula.</p></div></div><form className="schedule-form" onSubmit={createSchedule}><label>Grupo<select name="grupo_id" required defaultValue=""><option value="">Seleccionar grupo…</option>{groups.map((group) => <option key={group.id} value={group.id}>{group.curso_nombre} · {group.nombre}</option>)}</select></label><label>Día<select name="dia_semana" required defaultValue=""><option value="" disabled>Seleccionar día…</option>{weekdays.map((day) => <option key={day} value={day}>{weekdayLabel[day]}</option>)}</select></label><label>Desde<input name="hora_inicio" type="time" required /></label><label>Hasta<input name="hora_fin" type="time" required /></label><label>Aula<input name="aula" placeholder="Ej. Aula 3" required /></label><button className="button primary" disabled={saving}>{saving ? "Guardando…" : "Guardar horario"}</button></form></section>}
    {loading ? <div className="schedule-loading">Cargando los horarios…</div> : schedules.length === 0 ? <div className="schedule-empty"><span className="schedule-empty-icon">◷</span><h3>{filter === "TODOS" ? "Aún no hay clases programadas" : "Este grupo aún no tiene horarios"}</h3><p>Cuando se asignen horarios a los grupos, aparecerán aquí organizados por día.</p></div> : <div className="week-grid">{weekdays.map((day) => {
      const daySchedules = schedules.filter((schedule) => schedule.dia_semana === day);
      return <section className={`day-column ${daySchedules.length ? "has-classes" : ""}`} key={day}><header><h3>{weekdayLabel[day]}</h3><span>{daySchedules.length}</span></header>{daySchedules.length ? <div className="day-class-list">{daySchedules.map((schedule) => <article className="class-card" key={schedule.id}><div className="class-time"><span>◷</span>{timeLabel(schedule.hora_inicio)} – {timeLabel(schedule.hora_fin)}</div><h4>{schedule.curso_nombre}</h4><p className="class-group">Grupo {schedule.grupo_nombre}</p><div className="class-meta"><span>⌖ {schedule.aula || "Aula sin asignar"}</span>{schedule.docente && <span>Docente: {schedule.docente}</span>}</div></article>)}</div> : <p className="day-empty">Sin clases</p>}</section>;
    })}</div>}
  </section>;
}

function timeLabel(value: string) { return value ? String(value).slice(0, 5) : "—"; }
function weekdayDate(today: string, weekday: string) {
  if (!today) return "";
  const date = new Date(`${today}T12:00:00`);
  const mondayIndex = (date.getDay() + 6) % 7;
  const targetIndex = weekdays.indexOf(weekday);
  if (targetIndex < 0) return "";
  date.setDate(date.getDate() + targetIndex - mondayIndex);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
