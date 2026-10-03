"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api/client";
import type { Docente, Grupo } from "./admin-types";

type TeacherForm = { nombres: string; apellidos: string; dni: string; correo: string; telefono: string; password: string };
const emptyForm: TeacherForm = { nombres: "", apellidos: "", dni: "", correo: "", telefono: "", password: "" };

export function DocentesSection() {
  const { token } = useAuth();
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [selected, setSelected] = useState<Docente | null>(null);
  const [groups, setGroups] = useState<Grupo[]>([]);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<TeacherForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [searchId, setSearchId] = useState("");

  async function loadTeachers() {
    if (!token) return;
    setLoading(true); setError("");
    try {
      const rows = await apiRequest<Docente[]>("/docentes", token); setDocentes(rows);
      if (selected) setSelected(rows.find((item) => item.id === selected.id) || null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudieron cargar los docentes."); }
    finally { setLoading(false); }
  }

  async function openTeacher(teacher: Docente) {
    if (!token) return;
    setSelected(teacher); setError("");
    try { setGroups(await apiRequest<Grupo[]>(`/academicos/grupos?docente_id=${teacher.id}`, token)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudieron cargar los cursos del docente."); }
  }

  async function findTeacherById() {
    if (!token || !/^\d+$/.test(searchId.trim())) return;
    setError("");
    try {
      let teacher: Docente; try { const account = await apiRequest<{ rol: string; docente_id?: number }>(`/usuarios/${Number(searchId)}`, token); if (account.rol !== "DOCENTE" || !account.docente_id) throw new Error("Ese ID no corresponde a un docente."); teacher = await apiRequest<Docente>(`/docentes/${account.docente_id}`, token); } catch { teacher = await apiRequest<Docente>(`/docentes/${Number(searchId)}`, token); }
      setSelected(teacher);
      setGroups(await apiRequest<Grupo[]>(`/academicos/grupos?docente_id=${teacher.id}`, token));
    } catch (cause) { setSelected(null); setGroups([]); setError(cause instanceof Error ? cause.message : "No se encontró un docente con ese ID."); }
  }

  useEffect(() => { void loadTeachers(); }, [token]);

  function startCreate() { setSelected(null); setForm(emptyForm); setEditing(false); setDialog(true); }
  function startEdit() { if (!selected) return; setForm({ nombres: selected.nombres, apellidos: selected.apellidos, dni: selected.dni, correo: selected.correo || "", telefono: selected.telefono || "", password: "" }); setEditing(true); setDialog(true); }

  async function saveTeacher(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!token) return;
    const payload = editing ? { nombres: form.nombres, apellidos: form.apellidos, dni: form.dni, correo: form.correo, telefono: form.telefono } : { ...form };
    setSaving(true); setError(""); setNotice("");
    try {
      const saved = await apiRequest<Docente>(editing && selected ? `/docentes/${selected.id}` : "/docentes", token, { method: editing ? "PUT" : "POST", body: JSON.stringify(payload) });
      await loadTeachers(); setSelected(saved); setDialog(false); setNotice(editing ? "Datos del docente actualizados." : `Docente registrado. ID de acceso: ${saved.usuario_id}. Contraseña inicial: ${form.password.trim() ? "la que ingresaste" : "su DNI"}.`);
      setGroups(await apiRequest<Grupo[]>(`/academicos/grupos?docente_id=${saved.id}`, token));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo guardar el docente."); }
    finally { setSaving(false); }
  }

  async function changeTeacherStatus() {
    if (!token || !selected) return;
    const next = selected.estado_usuario === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    setSaving(true); setError(""); setNotice("");
    try {
      const updated = await apiRequest<Docente>(`/docentes/${selected.id}`, token, { method: "PUT", body: JSON.stringify({ estado: next }) });
      setSelected(next === "INACTIVO" ? null : updated); setGroups([]);
      setNotice(next === "INACTIVO" ? `Docente ID ${selected.id} desactivado. Ya no aparece en el directorio.` : `Docente ID ${selected.id} reactivado.`);
      await loadTeachers();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo cambiar el estado del docente."); }
    finally { setSaving(false); }
  }

  async function assignTeacher(group: Grupo, teacherId: number) {
    if (!token || !teacherId) return;
    setSaving(true); setError(""); setNotice("");
    try {
      await apiRequest(`/academicos/grupos/${group.id}`, token, { method: "PUT", body: JSON.stringify({ docente_id: teacherId }) });
      setNotice(`Asignación de ${group.curso_nombre} actualizada.`);
      if (teacherId === selected?.id) await openTeacher(selected); else await loadTeachers();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo cambiar el docente asignado."); }
    finally { setSaving(false); }
  }

  return <section className="admin-section-content">
    <div className="admin-section-lead"><div><h3>Equipo docente</h3><p>Selecciona un docente para revisar sus áreas y horarios. Para consultar una cuenta inactiva, ingresa su ID.</p></div><button className="button primary" onClick={startCreate}>＋ Nuevo docente</button></div>
    <div className="schedule-admin-toolbar"><label className="search-field"><span>⌕</span><input type="number" min="1" value={searchId} onChange={(event) => setSearchId(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void findTeacherById(); } }} placeholder="ID de acceso o ID docente" /></label><button className="button secondary small" disabled={!searchId} onClick={() => void findTeacherById()}>Buscar ID</button></div>
    {error && <div className="alert error" role="alert">{error}</div>}{notice && <div className="alert success">{notice}</div>}
    {loading ? <div className="admin-loading"><i /><i /><i /></div> : <div className="teacher-management-layout"><div className="teacher-directory">{docentes.map((teacher) => <button key={teacher.id} className={selected?.id === teacher.id ? "selected" : ""} onClick={() => void openTeacher(teacher)}><span className="teacher-directory-avatar">{`${teacher.nombres[0] || ""}${teacher.apellidos[0] || ""}`.toUpperCase()}</span><span><strong>{teacher.nombres} {teacher.apellidos}</strong><small>ID {teacher.id} · Acceso {teacher.usuario_id} · {teacher.codigo_docente}</small></span><b>↗</b></button>)}{docentes.length === 0 && <div className="admin-empty-state">Aún no hay docentes registrados.</div>}</div>
      <div className="teacher-detail-column">{selected ? <><header className="teacher-profile-card"><span className="teacher-profile-avatar">{`${selected.nombres[0] || ""}${selected.apellidos[0] || ""}`.toUpperCase()}</span><div><span className="eyebrow">DOCENTE ID {selected.id} · ACCESO ID {selected.usuario_id}</span><h3>{selected.nombres} {selected.apellidos}</h3><p>{selected.correo || "Correo sin registrar"} · {selected.telefono || "Teléfono sin registrar"} · {selected.estado_usuario === "ACTIVO" ? "Activo" : "Inactivo"}</p></div><div className="record-actions"><button className="button secondary" onClick={startEdit}>Editar datos</button><button className={`button ${selected.estado_usuario === "ACTIVO" ? "danger" : "primary"}`} disabled={saving} onClick={() => void changeTeacherStatus()}>{selected.estado_usuario === "ACTIVO" ? "Marcar inactivo" : "Reactivar por ID"}</button></div></header><div className="teacher-course-heading"><div><h4>Áreas y horarios asignados</h4><p>{groups.length} grupos en ciclo activo o histórico</p></div></div>{groups.length ? <div className="teacher-assignment-list">{groups.map((group) => <article key={group.id}><div className="teacher-assignment-top"><span className="course-mini-mark">{group.curso_nombre.slice(0, 2).toUpperCase()}</span><div><strong>{group.curso_nombre}</strong><small>Canal {group.canal_id} · {group.nombre} · {group.ciclo_nombre}</small></div><label className="teacher-change-select">Docente a cargo<select value={group.docente_id} disabled={saving || selected.estado_usuario !== "ACTIVO"} onChange={(event) => void assignTeacher(group, Number(event.target.value))}>{docentes.filter((item) => item.estado_usuario === "ACTIVO" || item.id === group.docente_id).map((item) => <option key={item.id} value={item.id}>{item.nombres} {item.apellidos}</option>)}</select></label></div><div className="teacher-schedule-strip">{group.horarios?.length ? group.horarios.map((schedule) => <span key={schedule.id}><b>{schedule.dia_semana}</b>{schedule.hora_inicio.slice(0, 5)}–{schedule.hora_fin.slice(0, 5)} · {schedule.aula}</span>) : <span>Sin horario asignado</span>}<Link href="/administracion/horarios">Administrar horario →</Link></div></article>)}</div> : <div className="admin-empty-state">Este docente aún no tiene áreas asignadas.</div>}</> : <div className="teacher-select-hint"><span>↖</span><h3>Elige un docente</h3><p>Aquí verás su ID de acceso, información, áreas a cargo y horarios.</p></div>}</div></div>}
    {dialog && <div className="modal-backdrop"><section className="form-dialog" role="dialog" aria-modal="true"><div className="dialog-heading"><div><span className="eyebrow">ADMINISTRACIÓN DE PERSONAL</span><h2>{editing ? "Editar docente" : "Registrar docente"}</h2></div><button className="icon-button" onClick={() => setDialog(false)} aria-label="Cerrar">×</button></div><form className="form-stack" onSubmit={(event) => void saveTeacher(event)}><div className="form-grid"><label>Nombres<input required value={form.nombres} onChange={(event) => setForm({ ...form, nombres: event.target.value })} /></label><label>Apellidos<input required value={form.apellidos} onChange={(event) => setForm({ ...form, apellidos: event.target.value })} /></label><label>DNI<input required pattern="[0-9]{8}" maxLength={8} value={form.dni} onChange={(event) => setForm({ ...form, dni: event.target.value })} /></label><label>Teléfono<input pattern="[0-9]{9}" maxLength={9} value={form.telefono} onChange={(event) => setForm({ ...form, telefono: event.target.value })} /></label><label>Correo<input type="email" value={form.correo} onChange={(event) => setForm({ ...form, correo: event.target.value })} /></label>{!editing && <label>Contraseña inicial (si se deja vacía, será el DNI)<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>}</div><div className="dialog-actions"><button type="button" className="button secondary" onClick={() => setDialog(false)}>Cancelar</button><button className="button primary" disabled={saving}>{saving ? "Guardando…" : "Guardar docente"}</button></div></form></section></div>}
  </section>;
}
