"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api/client";
import type { Grupo, Horario } from "./admin-types";

type FormState = { grupo_id: string; dia_semana: string; hora_inicio: string; hora_fin: string; aula: string };
const blank: FormState = { grupo_id: "", dia_semana: "LUNES", hora_inicio: "08:00", hora_fin: "10:00", aula: "" };
const weekdays = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];

export function HorariosSection() {
  const { token } = useAuth();
  const [groups, setGroups] = useState<Grupo[]>([]);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<Horario | null>(null);
  const [form, setForm] = useState<FormState>(blank);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    if (!token) return;
    setLoading(true); setError("");
    try { setGroups(await apiRequest<Grupo[]>("/academicos/grupos", token)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudieron cargar los horarios."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, [token]);

  const schedules = useMemo(() => groups.flatMap((group) => (group.horarios || []).map((schedule) => ({ group, schedule })))
    .filter(({ group, schedule }) => !filter || `${group.curso_nombre} ${group.nombre} ${group.docente_nombres} ${group.docente_apellidos} ${schedule.dia_semana} ${schedule.aula}`.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => weekdays.indexOf(a.schedule.dia_semana) - weekdays.indexOf(b.schedule.dia_semana) || a.schedule.hora_inicio.localeCompare(b.schedule.hora_inicio)), [groups, filter]);

  function startCreate() { setEditing(null); setForm({ ...blank, grupo_id: groups.find((group) => group.estado === "ACTIVO") ? String(groups.find((group) => group.estado === "ACTIVO")!.id) : "" }); setDialog(true); }
  function startEdit(group: Grupo, schedule: Horario) { setEditing(schedule); setForm({ grupo_id: String(group.id), dia_semana: schedule.dia_semana, hora_inicio: schedule.hora_inicio.slice(0, 5), hora_fin: schedule.hora_fin.slice(0, 5), aula: schedule.aula }); setDialog(true); }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!token) return;
    const payload = { ...form, grupo_id: Number(form.grupo_id) };
    setSaving(true); setError(""); setNotice("");
    try {
      await apiRequest(editing ? `/academicos/horarios/${editing.id}` : "/academicos/horarios", token, { method: editing ? "PUT" : "POST", body: JSON.stringify(payload) });
      setDialog(false); setNotice(editing ? "Horario actualizado." : "Horario asignado."); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo guardar el horario."); }
    finally { setSaving(false); }
  }

  async function remove(schedule: Horario, group: Grupo) {
    if (!token || !window.confirm(`¿Eliminar el horario de ${group.curso_nombre} (${group.nombre})?`)) return;
    setSaving(true); setError(""); setNotice("");
    try { await apiRequest(`/academicos/horarios/${schedule.id}`, token, { method: "DELETE" }); setNotice("Horario eliminado."); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo eliminar el horario."); }
    finally { setSaving(false); }
  }

  return <section className="admin-section-content">
    <div className="admin-section-lead"><div><h3>Programación académica</h3><p>Horario de cada área, grupo, docente y aula.</p></div><button className="button primary" onClick={startCreate}>＋ Asignar horario</button></div>
    <div className="schedule-admin-toolbar"><label className="search-field"><span>⌕</span><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Buscar área, grupo, docente o aula" /></label><span>{schedules.length} horarios</span></div>
    {error && <div className="alert error" role="alert">{error}</div>}{notice && <div className="alert success">{notice}</div>}
    {loading ? <div className="admin-loading"><i /><i /><i /></div> : schedules.length ? <div className="admin-schedule-grid">{schedules.map(({ group, schedule }) => <article className="admin-schedule-card" key={schedule.id}><div className="schedule-card-time"><span>{schedule.hora_inicio.slice(0, 5)}</span><i /><span>{schedule.hora_fin.slice(0, 5)}</span></div><div className="schedule-card-main"><span className="eyebrow">{schedule.dia_semana}</span><h4>{group.curso_nombre}</h4><p>Canal {group.canal_id} · Grupo {group.nombre}</p><div className="schedule-card-footer"><span>◈ {schedule.aula}</span><Link href="/administracion/docentes">{group.docente_nombres} {group.docente_apellidos} →</Link></div></div><div className="schedule-card-actions"><button className="button secondary small" onClick={() => startEdit(group, schedule)}>Editar</button><button className="text-button danger-text" disabled={saving} onClick={() => void remove(schedule, group)}>Eliminar</button></div></article>)}</div> : <div className="admin-empty-state"><strong>{groups.length ? "Todavía no hay horarios" : "No hay grupos académicos"}</strong><p>Asigna un horario a un grupo activo para que aparezca en la programación.</p></div>}
    {dialog && <div className="modal-backdrop schedule-modal-backdrop"><section className="form-dialog schedule-form-dialog" role="dialog" aria-modal="true"><div className="dialog-heading"><div><span className="eyebrow">PROGRAMACIÓN ACADÉMICA</span><h2>{editing ? "Editar horario" : "Asignar horario"}</h2></div><button className="icon-button" onClick={() => setDialog(false)} aria-label="Cerrar">×</button></div><form className="form-stack dialog-form" onSubmit={(event) => void save(event)}><label>Área y grupo<select required value={form.grupo_id} onChange={(event) => setForm({ ...form, grupo_id: event.target.value })}><option value="">Seleccionar…</option>{groups.filter((group) => group.estado === "ACTIVO").map((group) => <option key={group.id} value={group.id}>Canal {group.canal_id} · {group.curso_nombre} · {group.nombre}</option>)}</select></label><div className="form-grid"><label>Día<select value={form.dia_semana} onChange={(event) => setForm({ ...form, dia_semana: event.target.value })}>{weekdays.map((day) => <option key={day} value={day}>{day}</option>)}</select></label><label>Aula<input required value={form.aula} onChange={(event) => setForm({ ...form, aula: event.target.value })} /></label><label>Hora de inicio<input required type="time" value={form.hora_inicio} onChange={(event) => setForm({ ...form, hora_inicio: event.target.value })} /></label><label>Hora de fin<input required type="time" value={form.hora_fin} onChange={(event) => setForm({ ...form, hora_fin: event.target.value })} /></label></div><p className="form-note">Se validará que el docente y el aula estén disponibles en ese horario.</p><div className="dialog-actions"><button type="button" className="button secondary" onClick={() => setDialog(false)}>Cancelar</button><button className="button primary" disabled={saving}>{saving ? "Guardando…" : "Guardar horario"}</button></div></form></section></div>}
  </section>;
}
