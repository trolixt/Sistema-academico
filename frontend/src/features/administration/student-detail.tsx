"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api/client";
import type { Area, Asistencia, Canal, Estudiante, ResultadoSimulacro } from "./admin-types";

type SimulacroInput = { nombre: string; fecha: string; puntaje: string };

export function StudentDetail({ student: initialStudent, channel, onBack }: { student: Estudiante; channel: Canal; onBack: () => void }) {
  const { token } = useAuth();
  const [student, setStudent] = useState(initialStudent);
  const [areas, setAreas] = useState<Area[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [resultados, setResultados] = useState<ResultadoSimulacro[]>([]);
  const [channels, setChannels] = useState<Canal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [simulacro, setSimulacro] = useState<SimulacroInput>({ nombre: "", fecha: new Date().toISOString().slice(0, 10), puntaje: "" });
  const studentChannel = channels.find((item) => item.id === student.canal_id) || channel;
  const attendanceByCourse = asistencias.reduce((groups, item) => {
    const key = `${item.curso_nombre}::${item.grupo_nombre}`;
    const current = groups.get(key) || { curso: item.curso_nombre, grupo: item.grupo_nombre, puntos: 0, total: 0 };
    if (item.estado_asistencia !== "JUSTIFICADO") {
      current.total += 2;
      if (item.estado_asistencia === "PRESENTE") current.puntos += 2;
      if (item.estado_asistencia === "TARDANZA") current.puntos += 1;
    }
    groups.set(key, current);
    return groups;
  }, new Map<string, { curso: string; grupo: string; puntos: number; total: number }>());

  async function load() {
    if (!token) return;
    setLoading(true); setError("");
    try {
      const [profile, attendance, exams, availableChannels, channelAreas] = await Promise.all([
        apiRequest<Estudiante>(`/estudiantes/${student.id}`, token),
        apiRequest<Asistencia[]>(`/asistencias/estudiantes/${student.id}`, token),
        apiRequest<ResultadoSimulacro[]>(`/simulacros/estudiantes/${student.id}`, token),
        apiRequest<Canal[]>("/academicos/canales", token),
        apiRequest<Area[]>(`/academicos/canales/${student.canal_id || channel.id}/areas`, token),
      ]);
      setStudent(profile); setAreas(channelAreas); setAsistencias(attendance); setResultados(exams); setChannels(availableChannels);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo cargar el perfil del estudiante."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, [token, student.id]);

  async function saveStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!token) return;
    const formData = new FormData(event.currentTarget);
    const payload = { ...Object.fromEntries(formData.entries()), canal_id: Number(formData.get("canal_id")) };
    setSaving(true); setError("");
    try {
      const updated = await apiRequest<Estudiante>(`/estudiantes/${student.id}`, token, { method: "PUT", body: JSON.stringify(payload) });
      setStudent(updated); setEditing(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudieron guardar los datos."); }
    finally { setSaving(false); }
  }

  async function registerSimulation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!token) return;
    const score = Number(simulacro.puntaje);
    if (score < 0 || score > 600) { setError("El puntaje del simulacro debe estar entre 0 y 600."); return; }
    setSaving(true); setError("");
    try {
      const exam = await apiRequest<{ id: number }>(`/simulacros/canales/${studentChannel.id}`, token, { method: "POST", body: JSON.stringify({ nombre: simulacro.nombre, fecha: simulacro.fecha, puntaje_maximo: 600 }) });
      await apiRequest(`/simulacros/${exam.id}/estudiantes/${student.id}`, token, { method: "PUT", body: JSON.stringify({ puntaje: score }) });
      setSimulacro({ nombre: "", fecha: new Date().toISOString().slice(0, 10), puntaje: "" }); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo registrar el resultado."); }
    finally { setSaving(false); }
  }

  async function updateScore(result: ResultadoSimulacro, raw: string) {
    if (!token || raw === "") return;
    setSaving(true); setError("");
    try {
      await apiRequest(`/simulacros/${result.simulacro_id}/estudiantes/${student.id}`, token, { method: "PUT", body: JSON.stringify({ puntaje: Number(raw) }) });
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo actualizar el puntaje."); }
    finally { setSaving(false); }
  }

  return <section className="admin-student-detail">
    <button className="admin-back-link" onClick={onBack}>← Volver a estudiantes del canal</button>
    <header className="student-profile-heading"><span className="student-profile-large-avatar">{`${student.nombres[0] || ""}${student.apellidos[0] || ""}`.toUpperCase()}</span><div><span className="eyebrow">PERFIL · {student.codigo_estudiante}</span><h3>{student.nombres} {student.apellidos}</h3><p>Canal {studentChannel.id} · {studentChannel.nombre}</p></div><button className="button primary" onClick={() => setEditing(true)}>Editar datos</button></header>
    {error && <div className="alert error" role="alert">{error}</div>}
    {loading ? <div className="admin-loading"><i /><i /><i /></div> : <div className="student-profile-grid">
      <section className="admin-detail-panel personal-panel"><header className="admin-panel-heading"><div><span className="panel-symbol">◈</span><div><h4>Datos personales</h4><p>Información de registro</p></div></div><span className={`admin-state-dot ${student.estado_usuario === "ACTIVO" ? "on" : "off"}`}>{student.estado_usuario === "ACTIVO" ? "Activo" : "Inactivo"}</span></header><div className="student-facts"><StudentFact label="Código" value={student.codigo_estudiante} /><StudentFact label="ID de acceso" value={student.id_acceso} /><StudentFact label="Canal" value={student.canal_id ? `Canal ${student.canal_id} · ${channels.find((item) => item.id === student.canal_id)?.nombre || ""}` : null} /><StudentFact label="DNI" value={student.dni} /><StudentFact label="Nacimiento" value={formatDate(student.fecha_nacimiento)} /><StudentFact label="Correo" value={student.correo} /><StudentFact label="Teléfono" value={student.telefono} /><StudentFact label="Dirección" value={student.direccion} /><StudentFact label="Usuario" value={student.nombre_usuario} /></div></section>
      <section className="admin-detail-panel courses-panel"><header className="admin-panel-heading"><div><span className="panel-symbol blue">▤</span><div><h4>Cursos y áreas</h4><p>Todos los cursos incluidos en su canal</p></div></div><span className="panel-count">{areas.length}</span></header>{areas.length ? <div className="student-course-list">{areas.map((area) => <article key={area.id}><span className="course-mini-mark">{area.nombre.slice(0, 2).toUpperCase()}</span><div><strong>{area.nombre}</strong><small>{area.grupos_count ? `${area.grupos_count} grupos asignados` : "Área del canal"}</small></div><span className="course-channel-label">Canal {student.canal_id || channel.id}</span></article>)}</div> : <div className="admin-empty-state compact">Este canal todavía no tiene cursos configurados.</div>}</section>
      <section className="admin-detail-panel attendance-panel"><header className="admin-panel-heading"><div><span className="panel-symbol green">◷</span><div><h4>Asistencia por curso</h4><p>Porcentaje; las justificaciones no se cuentan</p></div></div><span className="panel-count">{attendanceByCourse.size}</span></header>{attendanceByCourse.size ? <div className="student-course-list">{[...attendanceByCourse.values()].map((item) => <article key={`${item.curso}-${item.grupo}`}><span className="course-mini-mark">%</span><div><strong>{item.curso}</strong><small>{item.grupo}</small></div><span className="course-channel-label">{item.total ? `${((item.puntos / item.total) * 100).toLocaleString("es-PE", { maximumFractionDigits: 1 })}%` : "Sin sesiones computables"}</span></article>)}</div> : <div className="admin-empty-state compact">Todavía no se han registrado asistencias.</div>}</section>
      <section className="admin-detail-panel simulations-panel"><header className="admin-panel-heading"><div><span className="panel-symbol violet">⌁</span><div><h4>Simulacros</h4><p>Puntajes en escala de 600 puntos</p></div></div><span className="panel-count">{resultados.length}</span></header>{resultados.length > 0 && <div className="simulation-results">{resultados.map((result) => <article key={result.resultado_id}><div><strong>{result.nombre}</strong><small>{formatDate(result.fecha)} · Canal {result.canal_id}</small></div><label><input aria-label={`Puntaje para ${result.nombre}`} type="number" min="0" max={result.puntaje_maximo} step="1" defaultValue={Number(result.puntaje)} onBlur={(event) => void updateScore(result, event.target.value)} disabled={saving} /><span>/ {result.puntaje_maximo}</span></label></article>)}</div>}<form className="simulation-entry-form" onSubmit={(event) => void registerSimulation(event)}><strong>{resultados.length ? "Registrar otro simulacro" : "Registrar primer simulacro"}</strong><div className="simulation-fields"><label>Nombre<input required value={simulacro.nombre} onChange={(event) => setSimulacro({ ...simulacro, nombre: event.target.value })} placeholder="Ej. Simulacro de admisión 01" /></label><label>Fecha<input required type="date" value={simulacro.fecha} onChange={(event) => setSimulacro({ ...simulacro, fecha: event.target.value })} /></label><label>Puntaje<input required type="number" min="0" max="600" step="1" value={simulacro.puntaje} onChange={(event) => setSimulacro({ ...simulacro, puntaje: event.target.value })} placeholder="0–600" /></label><button className="button primary" disabled={saving}>{saving ? "Guardando…" : "Guardar puntaje"}</button></div></form></section>
    </div>}

    {editing && <div className="modal-backdrop"><section className="form-dialog admin-student-dialog" role="dialog" aria-modal="true"><div className="dialog-heading"><div><span className="eyebrow">EDICIÓN DE PERFIL</span><h2>{student.nombres} {student.apellidos}</h2></div><button className="icon-button" onClick={() => setEditing(false)} aria-label="Cerrar">×</button></div><form className="form-stack" onSubmit={(event) => void saveStudent(event)}><div className="form-grid"><label>Nombres<input name="nombres" required defaultValue={student.nombres} /></label><label>Apellidos<input name="apellidos" required defaultValue={student.apellidos} /></label><label>DNI<input name="dni" required pattern="[0-9]{8}" maxLength={8} defaultValue={student.dni} /></label><label>Fecha de nacimiento<input name="fecha_nacimiento" type="date" required defaultValue={String(student.fecha_nacimiento).slice(0, 10)} /></label><label>Correo<input name="correo" type="email" defaultValue={student.correo || ""} /></label><label>Teléfono<input name="telefono" pattern="[0-9]{9}" maxLength={9} defaultValue={student.telefono || ""} /></label><label className="form-span-two">Dirección<input name="direccion" defaultValue={student.direccion || ""} /></label><label>Canal<select name="canal_id" required defaultValue={student.canal_id ?? channel.id}>{channels.map((item) => <option key={item.id} value={item.id}>Canal {item.id} · {item.nombre}</option>)}</select></label></div><div className="dialog-actions"><button type="button" className="button secondary" onClick={() => setEditing(false)}>Cancelar</button><button className="button primary" disabled={saving}>{saving ? "Guardando…" : "Guardar datos"}</button></div></form></section></div>}
  </section>;
}

function StudentFact({ label, value }: { label: string; value: string | number | null | undefined }) {
  return <div><span>{label}</span><strong>{value || "Sin registrar"}</strong></div>;
}

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  const source = value instanceof Date ? value.toISOString() : String(value);
  const date = new Date(`${source.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.valueOf()) ? source : new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(date);
}

function formatStatus(value: string) { return value.replaceAll("_", " ").toLowerCase().replace(/^./, (char) => char.toUpperCase()); }
