"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api/client";
import type { Area, Canal, Docente, ExcepcionHorario, Grupo, Horario } from "./admin-types";

type Turno = "MANANA" | "TARDE";
type AcademicCycle = { id: number; nombre: string; fecha_inicio: string; fecha_fin: string; estado: string };
type FormState = { curso_id: string; docente_id: string; dias_semana: string[]; hora_inicio: string; hora_fin: string; aula: string; mes_inicio: number; duracion: number; nuevo_ciclo: boolean; ciclo_nombre: string; ciclo_fecha_inicio: string; ciclo_fecha_fin: string };
type ScheduleRow = { group: Grupo; schedule: Horario };
type Slot = { inicio: string; fin: string; descanso?: boolean };
const weekdays = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];
const weekdayLabels: Record<string, string> = { LUNES: "Lunes", MARTES: "Martes", MIERCOLES: "Miércoles", JUEVES: "Jueves", VIERNES: "Viernes", SABADO: "Sábado", DOMINGO: "Domingo" };
const monthNames = ["Mes 1", "Mes 2", "Mes 3", "Mes 4", "Mes 5", "Mes 6"];
const classrooms = ["Aula 101", "Aula 102", "Aula 103", "Aula 104", "Aula 201", "Aula 202", "Aula 203", "Aula 204"];
const slotsByTurn: Record<Turno, Slot[]> = {
  MANANA: [{ inicio: "08:00", fin: "09:00" }, { inicio: "09:00", fin: "09:45" }, { inicio: "09:45", fin: "10:00", descanso: true }, { inicio: "10:00", fin: "11:00" }, { inicio: "11:00", fin: "12:00" }],
  TARDE: [{ inicio: "13:00", fin: "14:00" }, { inicio: "14:00", fin: "14:45" }, { inicio: "14:45", fin: "15:00", descanso: true }, { inicio: "15:00", fin: "16:00" }, { inicio: "16:00", fin: "17:00" }],
};
const emptyForm: FormState = { curso_id: "", docente_id: "", dias_semana: ["LUNES"], hora_inicio: "08:00", hora_fin: "09:00", aula: "", mes_inicio: 1, duracion: 1, nuevo_ciclo: false, ciclo_nombre: "", ciclo_fecha_inicio: "", ciclo_fecha_fin: "" };
const artStyles = ["art-sky", "art-lines", "art-glow", "art-grid"];

function dateOnly(value: string | Date | null | undefined) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function asLocalDate(value: string) {
  return new Date(`${value}T12:00:00`);
}

function formatDate(value: string) {
  if (!value) return "";
  return asLocalDate(value).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });
}

function addMonths(value: string, amount: number) {
  const date = asLocalDate(value);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + amount);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return toDateInput(date);
}

function addDays(value: string, amount: number) {
  const date = asLocalDate(value);
  date.setDate(date.getDate() + amount);
  return toDateInput(date);
}

function toDateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function monthRange(cycle: { fecha_inicio?: string | Date; fecha_fin?: string | Date } | undefined, month: number, duration = 1) {
  const start = dateOnly(cycle?.fecha_inicio);
  const end = dateOnly(cycle?.fecha_fin);
  if (!start || !end) return { start: "", end: "" };
  let anchor = asLocalDate(start);
  anchor.setDate(1);
  const firstMonthMonday = (offset: number) => {
    const date = new Date(anchor);
    date.setMonth(date.getMonth() + offset);
    const day = date.getDay();
    date.setDate(1 + ((8 - day) % 7));
    return toDateInput(date);
  };
  let firstAcademicMonday = firstMonthMonday(0);
  let alignedStart = firstAcademicMonday < start ? addDays(start, (8 - asLocalDate(start).getDay()) % 7) : firstAcademicMonday;
  if (alignedStart >= firstMonthMonday(1)) {
    anchor = asLocalDate(alignedStart);
    anchor.setDate(1);
    firstAcademicMonday = firstMonthMonday(0);
    alignedStart = firstAcademicMonday;
  }
  const rangeStart = month === 1 ? alignedStart : firstMonthMonday(month - 1);
  const nextMonthMonday = firstMonthMonday(month - 1 + duration);
  const rangeEnd = addDays(nextMonthMonday, -1);
  return { start: rangeStart < start ? start : rangeStart, end: rangeEnd > end ? end : rangeEnd };
}

function dateWeekday(date: string) {
  const index = asLocalDate(date).getDay();
  return ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"][index];
}

function timeMinutes(value: string) {
  const [hours, minutes] = value.slice(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
}

function intersects(startA: string, endA: string, startB: string, endB: string) {
  return timeMinutes(startA) < timeMinutes(endB) && timeMinutes(endA) > timeMinutes(startB);
}

function scheduleIsInMonth(item: ScheduleRow, month: number) {
  const range = monthRange({ fecha_inicio: item.group.ciclo_fecha_inicio, fecha_fin: item.group.ciclo_fecha_fin }, month, 1);
  const start = dateOnly(item.schedule.fecha_inicio) || dateOnly(item.group.ciclo_fecha_inicio);
  const end = dateOnly(item.schedule.fecha_fin) || dateOnly(item.group.ciclo_fecha_fin);
  return Boolean(range.start && range.end && start <= range.end && end >= range.start);
}

export function HorariosSection() {
  const { token } = useAuth();
  const [channels, setChannels] = useState<Canal[]>([]);
  const [groups, setGroups] = useState<Grupo[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [teachers, setTeachers] = useState<Docente[]>([]);
  const [cycles, setCycles] = useState<AcademicCycle[]>([]);
  const [exceptions, setExceptions] = useState<ExcepcionHorario[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
  const [selectedTurn, setSelectedTurn] = useState<Turno | null>(null);
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [monthView, setMonthView] = useState(1);
  const [dialog, setDialog] = useState<"turno" | "clase" | "todo" | null>(null);
  const [editing, setEditing] = useState<ScheduleRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [searchDate, setSearchDate] = useState("");
  const [holidayReason, setHolidayReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deepLinkHandled, setDeepLinkHandled] = useState(false);

  async function load() {
    if (!token) return;
    setLoading(true); setError("");
    try {
      const [nextChannels, nextGroups, nextExceptions, nextCycles, nextTeachers] = await Promise.all([
        apiRequest<Canal[]>("/academicos/canales", token),
        apiRequest<Grupo[]>("/academicos/grupos", token),
        apiRequest<ExcepcionHorario[]>("/academicos/horarios/excepciones", token),
        apiRequest<AcademicCycle[]>("/academicos/ciclos?activos=true", token),
        apiRequest<Docente[]>("/docentes", token),
      ]);
      setChannels(nextChannels); setGroups(nextGroups); setExceptions(nextExceptions); setCycles(nextCycles); setTeachers(nextTeachers);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudieron cargar los horarios."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, [token]);

  useEffect(() => {
    if (deepLinkHandled || loading || !channels.length) return;
    const channel = new URLSearchParams(window.location.search).get("canal");
    if (channel && ["1", "2", "3", "4"].includes(channel)) {
      setSelectedChannelId(Number(channel)); setDialog("turno");
    }
    setDeepLinkHandled(true);
  }, [deepLinkHandled, loading, channels]);

  const selectedChannel = channels.find((channel) => channel.id === selectedChannelId) || null;
  const channelGroups = useMemo(() => groups.filter((group) => group.canal_id === selectedChannelId && group.estado === "ACTIVO"), [groups, selectedChannelId]);
  useEffect(() => {
    if (!cycles.length) { setSelectedCycleId(""); return; }
    if (!cycles.some((cycle) => String(cycle.id) === selectedCycleId)) {
      setSelectedCycleId(String(cycles[0].id)); setMonthView(1);
    }
  }, [cycles, selectedCycleId]);

  const cycleGroups = channelGroups.filter((group) => String(group.ciclo_id) === selectedCycleId);
  const scheduleRows = useMemo<ScheduleRow[]>(() => cycleGroups.flatMap((group) => (group.horarios || []).map((schedule) => ({ group, schedule }))), [cycleGroups]);
  const monthSchedules = scheduleRows.filter((item) => scheduleIsInMonth(item, monthView));
  const selectedCycle = cycles.find((cycle) => String(cycle.id) === selectedCycleId);
  const cycleRange = selectedCycle ? { start: dateOnly(selectedCycle.fecha_inicio), end: dateOnly(selectedCycle.fecha_fin) } : { start: "", end: "" };
  const channelExceptions = exceptions.filter((item) => item.canal_id === selectedChannelId);
  const selectedDateException = channelExceptions.find((item) => item.fecha === searchDate);
  const dateSchedules = scheduleRows.filter(({ group, schedule }) => Boolean(searchDate && dateWeekday(searchDate) === schedule.dia_semana
    && (dateOnly(schedule.fecha_inicio) || dateOnly(group.ciclo_fecha_inicio)) <= searchDate
    && (dateOnly(schedule.fecha_fin) || dateOnly(group.ciclo_fecha_fin)) >= searchDate))
    .sort((a, b) => a.schedule.hora_inicio.localeCompare(b.schedule.hora_inicio));

  function openChannel(channel: Canal) {
    setSelectedChannelId(channel.id); setSelectedTurn(null); setDialog("turno"); setNotice(""); setError("");
    if (token) void apiRequest<Area[]>(`/academicos/canales/${channel.id}/areas`, token).then(setAreas).catch((cause) => setError(cause instanceof Error ? cause.message : "No se pudieron cargar las materias del canal."));
  }

  function startCreate(day: string, slot: Slot) {
    if (!selectedTurn || slot.descanso) return;
    setEditing(null);
    const today = toDateInput(new Date());
    const matchingGroup = cycleGroups.find((group) => group.curso_id === areas[0]?.id);
    setForm({ ...emptyForm, curso_id: String(areas[0]?.id || ""), docente_id: String(matchingGroup?.docente_id || teachers.find((teacher) => teacher.estado_usuario === "ACTIVO")?.id || ""), dias_semana: [day], hora_inicio: slot.inicio, hora_fin: slot.fin, aula: "", mes_inicio: monthView, duracion: 1, nuevo_ciclo: !selectedCycle, ciclo_nombre: selectedCycle?.nombre || `Ciclo ${new Date().getFullYear()} - Canal ${selectedChannelId}`, ciclo_fecha_inicio: selectedCycle?.fecha_inicio || today, ciclo_fecha_fin: selectedCycle?.fecha_fin || addMonths(today, 5) });
    setError(""); setNotice(""); setDialog("clase");
  }

  function startEdit(item: ScheduleRow) {
    const startDate = dateOnly(item.schedule.fecha_inicio) || dateOnly(item.group.ciclo_fecha_inicio);
    const groupCycle = { fecha_inicio: item.group.ciclo_fecha_inicio, fecha_fin: item.group.ciclo_fecha_fin };
    let startMonth = 1;
    for (let candidate = 1; candidate <= 6; candidate++) if (monthRange(groupCycle, candidate).start <= startDate && monthRange(groupCycle, candidate).end >= startDate) startMonth = candidate;
    let duration = 1;
    const endDate = dateOnly(item.schedule.fecha_fin) || dateOnly(item.group.ciclo_fecha_fin);
    for (let candidate = startMonth; candidate <= 6; candidate++) if (monthRange(groupCycle, startMonth, candidate - startMonth + 1).end >= endDate) { duration = candidate - startMonth + 1; break; }
    setEditing(item);
    setForm({ ...emptyForm, curso_id: String(item.group.curso_id), docente_id: String(item.group.docente_id), dias_semana: [item.schedule.dia_semana], hora_inicio: item.schedule.hora_inicio.slice(0, 5), hora_fin: item.schedule.hora_fin.slice(0, 5), aula: item.schedule.aula, mes_inicio: startMonth, duracion: Math.max(duration, 1), ciclo_nombre: item.group.ciclo_nombre, ciclo_fecha_inicio: item.group.ciclo_fecha_inicio || "", ciclo_fecha_fin: item.group.ciclo_fecha_fin || "" });
    setError(""); setNotice(""); setDialog("clase");
  }

  async function saveSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!token) return;
    const course = areas.find((item) => String(item.id) === form.curso_id);
    const teacher = teachers.find((item) => String(item.id) === form.docente_id && item.estado_usuario === "ACTIVO");
    if (!course || !teacher || !selectedTurn) { setError("Selecciona una materia y un docente activo."); return; }
    if (!form.dias_semana.length) { setError("Selecciona por lo menos un día de clase."); return; }
    if (!isTimeAllowed(form.hora_inicio, selectedTurn, "inicio") || !isTimeAllowed(form.hora_fin, selectedTurn, "fin") || timeMinutes(form.hora_inicio) >= timeMinutes(form.hora_fin)) {
      setError("El horario debe quedar en las franjas editables del turno y no puede empezar ni terminar durante el descanso."); return;
    }
    setSaving(true); setError(""); setNotice("");
    try {
      let cycle = selectedCycle;
      if (!editing && form.nuevo_ciclo) {
        if (!form.ciclo_nombre.trim() || !form.ciclo_fecha_inicio || !form.ciclo_fecha_fin) throw new Error("Completa los datos del ciclo académico.");
        cycle = await apiRequest<AcademicCycle>("/academicos/ciclos", token, { method: "POST", body: JSON.stringify({ nombre: form.ciclo_nombre.trim(), fecha_inicio: form.ciclo_fecha_inicio, fecha_fin: form.ciclo_fecha_fin }) });
      }
      const dates = monthRange(cycle ? { fecha_inicio: cycle.fecha_inicio, fecha_fin: cycle.fecha_fin } : undefined, form.mes_inicio, form.duracion);
      if (!dates.start || !dates.end || !cycle) throw new Error("No hay un ciclo académico válido para programar la clase.");
      let group = editing?.group || cycleGroups.find((item) => item.curso_id === course.id && item.docente_id === teacher.id && item.ciclo_id === cycle!.id);
      if (!group) group = await apiRequest<Grupo>("/academicos/grupos", token, { method: "POST", body: JSON.stringify({ nombre: `Canal ${selectedChannelId} · ${course.nombre} · ${teacher.nombres} ${teacher.apellidos}`, curso_id: course.id, canal_id: selectedChannelId, docente_id: teacher.id, ciclo_id: cycle.id, capacidad: 30 }) });
      const payload = { grupo_id: group.id, hora_inicio: form.hora_inicio, hora_fin: form.hora_fin, aula: form.aula.trim(), fecha_inicio: dates.start, fecha_fin: dates.end };
      if (editing) {
        await apiRequest(`/academicos/horarios/${editing.schedule.id}`, token, { method: "PUT", body: JSON.stringify({ ...payload, dia_semana: form.dias_semana[0] }) });
        setNotice("Horario actualizado.");
      } else {
        await apiRequest<Horario[]>("/academicos/horarios/recurrentes", token, { method: "POST", body: JSON.stringify({ ...payload, dias_semana: form.dias_semana }) });
        setNotice("La clase se repetirá en los días y meses seleccionados.");
      }
      setSelectedCycleId(String(cycle.id)); setDialog(null); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo guardar el horario."); }
    finally { setSaving(false); }
  }

  async function removeSchedule(item: ScheduleRow) {
    if (!token || !window.confirm(`¿Eliminar ${item.group.curso_nombre} del ${weekdayLabels[item.schedule.dia_semana]}?`)) return;
    setSaving(true); setError(""); setNotice("");
    try { await apiRequest(`/academicos/horarios/${item.schedule.id}`, token, { method: "DELETE" }); setDialog(null); setNotice("Clase eliminada del horario."); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo eliminar la clase."); }
    finally { setSaving(false); }
  }

  async function addHoliday(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!token || !selectedChannelId || !searchDate) return;
    setSaving(true); setError(""); setNotice("");
    try {
      await apiRequest<ExcepcionHorario>("/academicos/horarios/excepciones", token, { method: "POST", body: JSON.stringify({ canal_id: selectedChannelId, fecha: searchDate, motivo: holidayReason }) });
      setHolidayReason(""); setNotice("Se marcó el día como feriado para todo el canal."); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo marcar el día como feriado."); }
    finally { setSaving(false); }
  }

  async function removeHoliday(exception: ExcepcionHorario) {
    if (!token || !window.confirm(`¿Quitar el feriado del ${formatDate(exception.fecha)}?`)) return;
    setSaving(true); setError(""); setNotice("");
    try { await apiRequest(`/academicos/horarios/excepciones/${exception.id}`, token, { method: "DELETE" }); setNotice("El feriado se quitó del calendario."); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo quitar el feriado."); }
    finally { setSaving(false); }
  }

  return <section className="admin-section-content">
    {error && <div className="alert error" role="alert">{error}</div>}{notice && <div className="alert success">{notice}</div>}
    {!selectedChannel ? <>
      <div className="admin-section-lead"><div><h3>Horarios por canal</h3><p>Selecciona un canal y luego el turno que quieres programar.</p></div><span>{channels.length} canales</span></div>
      {loading ? <div className="admin-loading"><i /><i /><i /></div> : <div className="admission-channel-grid schedule-channel-grid">{channels.map((channel, index) => <article className={`admission-channel-card ${artStyles[index % artStyles.length]}`} key={channel.id}><button className="channel-card-open" onClick={() => openChannel(channel)}><span className="channel-index">CANAL {String(channel.id).padStart(2, "0")}</span><strong>{channel.nombre}</strong><span className="channel-card-metrics">{channel.areas_count || 0} materias <i /> {channel.estudiantes_count || 0} estudiantes</span><span className="channel-open-label">Elegir turno <b>↗</b></span></button></article>)}</div>}
    </> : <>
      <button className="admin-back-link" onClick={() => { setSelectedChannelId(null); setSelectedTurn(null); setSelectedCycleId(""); setDialog(null); }}>← Los cuatro canales</button>
      <header className="schedule-workspace-heading"><span className={`channel-emblem channel-color-${selectedChannel.id}`}>{String(selectedChannel.id).padStart(2, "0")}</span><div><span className="eyebrow">PROGRAMACIÓN ACADÉMICA · CANAL {selectedChannel.id}</span><h3>{selectedChannel.nombre}</h3><p>{selectedTurn === "MANANA" ? "Turno mañana · 08:00 a 12:00" : selectedTurn === "TARDE" ? "Turno tarde · 13:00 a 17:00" : "Elige un turno para abrir el horario"}</p></div><div className="schedule-heading-actions"><button className="button secondary" onClick={() => setDialog("turno")}>Cambiar turno</button><button className="button primary" disabled={!selectedTurn} onClick={() => { setSearchDate(cycleRange.start || toDateInput(new Date())); setDialog("todo"); }}>Ver todo el horario</button></div></header>
      {selectedTurn && <>
        <div className="schedule-grid-toolbar"><label>Ciclo<select value={selectedCycleId} onChange={(event) => { setSelectedCycleId(event.target.value); setMonthView(1); }}>{cycles.length ? cycles.map((cycle) => <option key={cycle.id} value={cycle.id}>{cycle.nombre}</option>) : <option value="">Sin ciclo · se creará al programar</option>}</select></label><label>Mes del ciclo<select value={monthView} onChange={(event) => setMonthView(Number(event.target.value))}>{monthNames.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select></label><span>{selectedCycle ? `${formatDate(cycleRange.start)} — ${formatDate(cycleRange.end)}` : "La primera clase iniciará un ciclo"}</span><button className="button secondary" onClick={startCreate.bind(null, "LUNES", slotsByTurn[selectedTurn][0])}>＋ Agregar clase</button></div>
        <div className="schedule-grid-scroll"><div className="schedule-week-table" style={{ "--schedule-columns": "8" } as React.CSSProperties}>
          <div className="schedule-grid-corner">Hora</div>{weekdays.map((day) => <div className="schedule-grid-day" key={day}>{weekdayLabels[day]}</div>)}
          {slotsByTurn[selectedTurn].map((slot) => <div className={`schedule-grid-row ${slot.descanso ? "rest-row" : ""}`} key={`${slot.inicio}-${slot.fin}`}>
            <div className="schedule-grid-time">{slot.descanso ? <><strong>Descanso</strong><span>15 min</span></> : <><strong>{slot.inicio}</strong><span>{slot.fin}</span></>}</div>
            {weekdays.map((day) => {
              if (slot.descanso) return <div className="schedule-grid-rest" key={day} aria-label="Descanso no editable">Pausa</div>;
              const existing = monthSchedules.find(({ schedule }) => schedule.dia_semana === day && intersects(schedule.hora_inicio, schedule.hora_fin, slot.inicio, slot.fin));
              return existing ? <button className="schedule-grid-cell occupied" key={day} onClick={() => startEdit(existing)} title={`Editar ${existing.group.curso_nombre}`}><strong>{existing.group.curso_nombre}</strong><span>{existing.schedule.hora_inicio.slice(0, 5)}–{existing.schedule.hora_fin.slice(0, 5)}</span><small>{existing.schedule.aula || "Aula sin asignar"}</small></button>
                : <button className="schedule-grid-cell empty" key={day} onClick={() => startCreate(day, slot)} aria-label={`Agregar clase ${weekdayLabels[day]} ${slot.inicio} a ${slot.fin}`}><span>＋</span><small>Agregar</small></button>;
            })}
          </div>)}
        </div></div>
        <div className="schedule-grid-legend"><span><i /> Horario editable</span><span><i className="legend-break" /> Descanso fijo · no editable</span><span>Haz clic en un bloque ocupado para editarlo.</span></div>
        {!areas.length && <div className="admin-empty-state schedule-no-groups"><strong>Este canal aún no tiene materias configuradas</strong><p>Configura sus áreas antes de programar clases.</p><Link className="button secondary" href="/administracion">Configurar canales →</Link></div>}
      </>}
    </>}

    {dialog === "turno" && selectedChannel && <div className="modal-backdrop schedule-modal-backdrop"><section className="form-dialog turn-picker-dialog" role="dialog" aria-modal="true" aria-labelledby="turn-picker-title"><div className="dialog-heading"><div><span className="eyebrow">CANAL {String(selectedChannel.id).padStart(2, "0")}</span><h2 id="turn-picker-title">¿Qué turno vas a programar?</h2><p>Selecciona el horario del canal {selectedChannel.id}.</p></div><button className="icon-button" onClick={() => setDialog(null)} aria-label="Cerrar">×</button></div><div className="turn-picker-options"><button className={`turn-option ${selectedTurn === "MANANA" ? "selected" : ""}`} onClick={() => { setSelectedTurn("MANANA"); setDialog(null); }}><span className="turn-option-icon">☀</span><strong>Turno mañana</strong><small>08:00 — 12:00</small><i>Ver horario →</i></button><button className={`turn-option ${selectedTurn === "TARDE" ? "selected" : ""}`} onClick={() => { setSelectedTurn("TARDE"); setDialog(null); }}><span className="turn-option-icon">◐</span><strong>Turno tarde</strong><small>13:00 — 17:00</small><i>Ver horario →</i></button></div></section></div>}

    {dialog === "clase" && selectedTurn && <div className="modal-backdrop schedule-modal-backdrop"><section className="form-dialog schedule-form-dialog" role="dialog" aria-modal="true"><div className="dialog-heading"><div><span className="eyebrow">CANAL {selectedChannelId} · TURNO {selectedTurn === "MANANA" ? "MAÑANA" : "TARDE"}</span><h2>{editing ? "Editar clase" : "Agregar clase al horario"}</h2></div><button className="icon-button" onClick={() => setDialog(null)} aria-label="Cerrar">×</button></div><form className="form-stack dialog-form" onSubmit={(event) => void saveSchedule(event)}><div className="form-grid"><label>Materia<select required value={form.curso_id} onChange={(event) => setForm({ ...form, curso_id: event.target.value })}>{areas.map((area) => <option key={area.id} value={area.id}>{area.nombre}</option>)}</select></label><label>Docente<select required value={form.docente_id} onChange={(event) => setForm({ ...form, docente_id: event.target.value })}>{teachers.filter((teacher) => teacher.estado_usuario === "ACTIVO" || String(teacher.id) === form.docente_id).map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.nombres} {teacher.apellidos}</option>)}</select></label></div>{(!areas.length || !teachers.some((teacher) => teacher.estado_usuario === "ACTIVO")) && <p className="schedule-break-note">{!areas.length ? "Configura las materias del canal para poder programar." : "Registra o activa un docente para asignarlo a la clase."} <Link href={!areas.length ? "/administracion/canales" : "/administracion/docentes"}>Ir a configuración →</Link></p>}{!selectedCycle && !editing && <section className="schedule-cycle-fields"><div><span className="eyebrow">PRIMER HORARIO DEL CANAL</span><strong>Crear ciclo académico de seis meses</strong></div><label>Nombre del ciclo<input required value={form.ciclo_nombre} onChange={(event) => setForm({ ...form, ciclo_nombre: event.target.value })} /></label><div className="form-grid"><label>Fecha de inicio<input required type="date" value={form.ciclo_fecha_inicio} onChange={(event) => setForm({ ...form, ciclo_fecha_inicio: event.target.value, ciclo_fecha_fin: addMonths(event.target.value, 5) })} /></label><label>Fecha de fin<input required type="date" value={form.ciclo_fecha_fin} onChange={(event) => setForm({ ...form, ciclo_fecha_fin: event.target.value })} /></label></div></section>}<fieldset className="schedule-weekdays"><legend>Días de clase</legend>{editing ? <select value={form.dias_semana[0]} onChange={(event) => setForm({ ...form, dias_semana: [event.target.value] })}>{weekdays.map((day) => <option key={day} value={day}>{weekdayLabels[day]}</option>)}</select> : weekdays.map((day) => <label key={day}><input type="checkbox" checked={form.dias_semana.includes(day)} onChange={(event) => setForm((current) => ({ ...current, dias_semana: event.target.checked ? [...current.dias_semana, day] : current.dias_semana.filter((item) => item !== day) }))} /><span>{weekdayLabels[day]}</span></label>)}</fieldset><div className="form-grid"><label>Hora de inicio<input required type="time" min={selectedTurn === "MANANA" ? "08:00" : "13:00"} max={selectedTurn === "MANANA" ? "12:00" : "17:00"} value={form.hora_inicio} onChange={(event) => setForm({ ...form, hora_inicio: event.target.value })} /></label><label>Hora de fin<input required type="time" min={selectedTurn === "MANANA" ? "08:00" : "13:00"} max={selectedTurn === "MANANA" ? "12:00" : "17:00"} value={form.hora_fin} onChange={(event) => setForm({ ...form, hora_fin: event.target.value })} /></label><label>Mes de inicio<select value={form.mes_inicio} onChange={(event) => setForm({ ...form, mes_inicio: Number(event.target.value), duracion: Math.min(form.duracion, 7 - Number(event.target.value)) })}>{monthNames.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select></label><label>Duración<select value={form.duracion} onChange={(event) => setForm({ ...form, duracion: Number(event.target.value) })}>{Array.from({ length: 7 - form.mes_inicio }, (_, index) => index + 1).map((months) => <option key={months} value={months}>{months} {months === 1 ? "mes" : "meses"}</option>)}</select></label><label className="form-span-two">Aula<select required value={form.aula} onChange={(event) => setForm({ ...form, aula: event.target.value })}><option value="">Seleccionar aula…</option>{classrooms.map((room) => <option key={room} value={room}>{room}</option>)}</select></label></div>{(() => { const range = monthRange(selectedCycle ? { fecha_inicio: selectedCycle.fecha_inicio, fecha_fin: selectedCycle.fecha_fin } : { fecha_inicio: form.ciclo_fecha_inicio, fecha_fin: form.ciclo_fecha_fin }, form.mes_inicio, form.duracion); return <p className="schedule-break-note">Se repetirá del {formatDate(range.start)} al {formatDate(range.end)}. Las pausas fijas (09:45–10:00 y 14:45–15:00) no se pueden programar.</p>; })()}{error && <div className="alert error" role="alert">{error}</div>}<div className="dialog-actions"><button type="button" className="button secondary" onClick={() => setDialog(null)}>Cancelar</button>{editing && <button type="button" className="button danger" disabled={saving} onClick={() => void removeSchedule(editing)}>Eliminar</button>}<button className="button primary" disabled={saving || !areas.length || !teachers.some((teacher) => teacher.estado_usuario === "ACTIVO")}>{saving ? "Guardando…" : editing ? "Guardar cambios" : "Agregar clase"}</button></div></form></section></div>}

    {dialog === "todo" && selectedChannel && selectedTurn && <div className="modal-backdrop schedule-modal-backdrop"><section className="form-dialog all-schedule-dialog" role="dialog" aria-modal="true"><div className="dialog-heading"><div><span className="eyebrow">CANAL {selectedChannel.id} · TURNO {selectedTurn === "MANANA" ? "MAÑANA" : "TARDE"}</span><h2>Ver todo el horario</h2><p>Busca una fecha del ciclo y revisa las clases de ese día.</p></div><button className="icon-button" onClick={() => setDialog(null)} aria-label="Cerrar">×</button></div><div className="all-schedule-content"><label className="all-schedule-date">Buscar día<input type="date" min={cycleRange.start || undefined} max={cycleRange.end || undefined} value={searchDate} onChange={(event) => setSearchDate(event.target.value)} /></label>{searchDate && <section className="all-schedule-day"><header><div><span className="eyebrow">{weekdayLabels[dateWeekday(searchDate)]} · {formatDate(searchDate)}</span><h3>Clases programadas</h3></div><span>{selectedDateException ? "Día feriado" : `${dateSchedules.filter(({ schedule }) => inSelectedTurn(schedule, selectedTurn)).length} clases`}</span></header>{selectedDateException ? <div className="holiday-notice"><span>✳</span><div><strong>No hay clases · {selectedDateException.motivo}</strong><small>Este día está marcado como feriado para todo el canal.</small></div><button className="button secondary small" disabled={saving} onClick={() => void removeHoliday(selectedDateException)}>Quitar feriado</button></div> : dateSchedules.filter(({ schedule }) => inSelectedTurn(schedule, selectedTurn)).length ? <div className="all-schedule-class-list">{dateSchedules.filter(({ schedule }) => inSelectedTurn(schedule, selectedTurn)).map(({ group, schedule }) => <article key={schedule.id}><time>{schedule.hora_inicio.slice(0, 5)}–{schedule.hora_fin.slice(0, 5)}</time><span><strong>{group.curso_nombre}</strong><small>{group.nombre} · {group.docente_nombres} {group.docente_apellidos} · {schedule.aula}</small></span></article>)}</div> : <p className="schedule-exception-empty">No hay clases programadas para este día.</p>}{!selectedDateException && <form className="mark-holiday-form" onSubmit={(event) => void addHoliday(event)}><label>Si no habrá clases todo el día, marca feriado<input required maxLength={150} value={holidayReason} onChange={(event) => setHolidayReason(event.target.value)} placeholder="Ej. Feriado nacional" /></label><button className="button secondary" disabled={saving}>Marcar día sin clases</button></form>}</section>}{channelExceptions.length > 0 && <section className="all-schedule-holidays"><h3>Feriados del canal</h3>{channelExceptions.sort((a, b) => a.fecha.localeCompare(b.fecha)).map((exception) => <button key={exception.id} onClick={() => setSearchDate(exception.fecha)}><span>{formatDate(exception.fecha)}</span><small>{exception.motivo}</small></button>)}</section>}{error && <div className="alert error" role="alert">{error}</div>}{notice && <div className="alert success">{notice}</div>}</div></section></div>}
  </section>;
}

function inSelectedTurn(schedule: Horario, turn: Turno) {
  const earliest = turn === "MANANA" ? "08:00" : "13:00";
  const latest = turn === "MANANA" ? "12:00" : "17:00";
  return schedule.hora_inicio.slice(0, 5) >= earliest && schedule.hora_fin.slice(0, 5) <= latest;
}

function isTimeAllowed(value: string, turn: Turno, edge: "inicio" | "fin") {
  const time = value.slice(0, 5);
  const min = turn === "MANANA" ? "08:00" : "13:00";
  const max = turn === "MANANA" ? "12:00" : "17:00";
  const inBreak = edge === "inicio"
    ? (time >= "09:45" && time < "10:00") || (time >= "14:45" && time < "15:00")
    : (time > "09:45" && time < "10:00") || (time > "14:45" && time < "15:00");
  return time >= min && time <= max && !inBreak;
}
