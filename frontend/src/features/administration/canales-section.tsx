"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api/client";
import type { Area, Canal, Estudiante, Grupo } from "./admin-types";
import { StudentDetail } from "./student-detail";

type CursoOpcion = { id: number; nombre: string; descripcion: string | null; estado: string };
const artStyles = ["art-sky", "art-lines", "art-glow", "art-grid", "art-orbit"];
const channelThemes: Record<string, string> = { verde: "channel-theme-verde", azul: "channel-theme-azul", violeta: "channel-theme-violeta", ambar: "channel-theme-ambar" };

export function CanalesSection() {
  const { token } = useAuth();
  const [canales, setCanales] = useState<Canal[]>([]);
  const [canal, setCanal] = useState<Canal | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [areaGroups, setAreaGroups] = useState<Grupo[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [estudiante, setEstudiante] = useState<Estudiante | null>(null);
  const [cursos, setCursos] = useState<CursoOpcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState<"canal" | "areas" | null>(null);
  const [studentDialog, setStudentDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<number[]>([]);
  const [nuevoCurso, setNuevoCurso] = useState({ nombre: "", descripcion: "" });
  const [editingCourse, setEditingCourse] = useState<CursoOpcion | null>(null);
  const [studentNotice, setStudentNotice] = useState(false);
  const [studentAccessId, setStudentAccessId] = useState<string | null>(null);
  const [studentPasswordIsDni, setStudentPasswordIsDni] = useState(true);

  async function loadCanales() {
    if (!token) return;
    setLoading(true); setError("");
    try { setCanales(await apiRequest<Canal[]>("/academicos/canales", token)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudieron cargar los canales."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void loadCanales(); }, [token]);

  async function openChannel(next: Canal) {
    if (!token) return;
    setCanal(next); setEstudiante(null); setError(""); setLoading(true);
    try {
      const [nextAreas, nextStudents] = await Promise.all([
        apiRequest<Area[]>(`/academicos/canales/${next.id}/areas`, token),
        apiRequest<Estudiante[]>(`/academicos/canales/${next.id}/estudiantes`, token),
      ]);
      setAreas(nextAreas); setEstudiantes(nextStudents);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo abrir el canal."); }
    finally { setLoading(false); }
  }

  async function openAreasEditor() {
    if (!token || !canal) return;
    setError("");
    try {
      const allCourses = await apiRequest<CursoOpcion[]>("/academicos/cursos", token);
      setCursos(allCourses); setSelectedAreas(areas.map((area) => area.id)); setDialog("areas");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudieron cargar las áreas."); }
  }

  async function openAreaGroups(area: Area) {
    if (!token || !canal) return;
    setError(""); setSelectedArea(area); setAreaGroups([]);
    try { setAreaGroups(await apiRequest<Grupo[]>(`/academicos/grupos?curso_id=${area.id}&canal_id=${canal.id}`, token)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudieron cargar los grupos del área."); }
  }

  async function saveCanal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!token || !canal) return;
    const form = new FormData(event.currentTarget);
    setSaving(true); setError("");
    try {
      const updated = await apiRequest<Canal>(`/academicos/canales/${canal.id}`, token, { method: "PUT", body: JSON.stringify({ nombre: form.get("nombre"), descripcion: form.get("descripcion"), color: form.get("color") }) });
      setCanal(updated); setCanales((items) => items.map((item) => item.id === updated.id ? { ...item, ...updated } : item)); setDialog(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo guardar el canal."); }
    finally { setSaving(false); }
  }

  async function createStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!token) return;
    const form = new FormData(event.currentTarget);
    const initialPassword = String(form.get("password") || "").trim();
    const payload = { ...Object.fromEntries(form.entries()), canal_id: canal?.id };
    setSaving(true); setError("");
    try {
      const created = await apiRequest<Estudiante>("/estudiantes", token, { method: "POST", body: JSON.stringify(payload) });
      setEstudiantes((items) => [...items, created]); setStudentAccessId(created.id_acceso || null);
      setStudentPasswordIsDni(!initialPassword);
      setStudentDialog(false); setStudentNotice(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo registrar al estudiante."); }
    finally { setSaving(false); }
  }

  async function addCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!token || !canal || !nuevoCurso.nombre.trim()) return;
    setSaving(true); setError("");
    try {
      const added = await apiRequest<CursoOpcion>("/academicos/cursos", token, { method: "POST", body: JSON.stringify(nuevoCurso) });
      setCursos((items) => [...items, added]); setSelectedAreas((items) => [...items, added.id]); setNuevoCurso({ nombre: "", descripcion: "" });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo crear el área."); }
    finally { setSaving(false); }
  }

  async function updateCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!token || !editingCourse) return;
    setSaving(true); setError("");
    try {
      const saved = await apiRequest<CursoOpcion>(`/academicos/cursos/${editingCourse.id}`, token, { method: "PUT", body: JSON.stringify({ nombre: editingCourse.nombre, descripcion: editingCourse.descripcion }) });
      setCursos((items) => items.map((item) => item.id === saved.id ? saved : item)); setEditingCourse(null);
      setAreas((items) => items.map((item) => item.id === saved.id ? { ...item, nombre: saved.nombre, descripcion: saved.descripcion } : item));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo editar el área."); }
    finally { setSaving(false); }
  }

  async function saveAreas(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!token || !canal) return;
    setSaving(true); setError("");
    try {
      const updated = await apiRequest<Area[]>(`/academicos/canales/${canal.id}/areas`, token, { method: "PUT", body: JSON.stringify({ curso_ids: selectedAreas }) });
      setAreas(updated); setCanales((items) => items.map((item) => item.id === canal.id ? { ...item, areas_count: updated.length } : item)); setDialog(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudieron guardar las áreas."); }
    finally { setSaving(false); }
  }

  const selectedIndex = useMemo(() => canal ? canal.id : 1, [canal]);
  if (estudiante && canal) return <StudentDetail student={estudiante} channel={canal} onBack={() => setEstudiante(null)} />;

  return <div className="admin-section-content">
    {error && <div className="alert error" role="alert">{error}</div>}
    {!canal ? <>
      <div className="admin-section-lead"><div><h3>Los cuatro canales</h3><p>Elige una línea de preparación para consultar a sus estudiantes y áreas.</p></div><span>{canales.length} canales activos</span></div>
      {loading ? <div className="admin-loading"><i /><i /><i /></div> : <div className="admission-channel-grid">{canales.map((item) => <article className={`admission-channel-card ${channelThemes[item.color] || artStyles[(item.id - 1) % artStyles.length]}`} key={item.id}><button className="channel-card-open" onClick={() => void openChannel(item)}><span className="channel-index">CANAL 0{item.id}</span><strong>{item.nombre}</strong><span className="channel-card-metrics">{item.areas_count || 0} áreas <i /> {item.estudiantes_count || 0} estudiantes</span><span className="channel-open-label">Abrir canal <b>↗</b></span></button></article>)}</div>}
    </> : <>
      <button className="admin-back-link" onClick={() => { setCanal(null); setEstudiantes([]); setAreas([]); void loadCanales(); }}>← Todos los canales</button>
      <header className="channel-workspace-heading"><div className={`channel-emblem channel-color-${canal.id}`}>0{selectedIndex}</div><div><span className="eyebrow">CANAL {String(canal.id).padStart(2, "0")}</span><h3>{canal.nombre}</h3><p>{canal.descripcion}</p></div><div className="channel-heading-actions"><Link className="button secondary" href={`/administracion/horarios?canal=${canal.id}`}>Programar clases</Link><button className="button secondary" onClick={() => setDialog("canal")}>Editar canal</button><button className="button primary" onClick={() => void openAreasEditor()}>Editar áreas</button></div></header>
      {loading ? <div className="admin-loading"><i /><i /><i /></div> : <>
        <section className="channel-area-section"><div className="admin-section-lead"><div><h3>Áreas de estudio</h3><p>Tarjetas del canal · {areas.length} materias</p></div><button className="text-button" onClick={() => void openAreasEditor()}>Configurar áreas →</button></div><div className="admission-area-grid">{areas.map((area, index) => <article className="admission-area-card" key={area.id}><div className={`area-cover ${artStyles[index % artStyles.length]}`}><span>ÁREA {String(index + 1).padStart(2, "0")}</span><i className="area-cover-shape" /></div><div className="area-card-body"><small>{area.grupos_count || 0} grupos abiertos</small><h4>{area.nombre}</h4><p>{area.descripcion || "Área de preparación preuniversitaria."}</p><button onClick={() => void openAreaGroups(area)}>Ver grupos <span>↗</span></button></div></article>)}</div>{selectedArea && <section className="area-groups-panel"><header><div><span className="eyebrow">CANAL {canal.id} · ÁREA</span><h4>{selectedArea.nombre}</h4><p>Docentes, grupos y horarios asignados</p></div><button className="icon-button" onClick={() => setSelectedArea(null)} aria-label="Cerrar grupos">×</button></header>{areaGroups.length ? areaGroups.map((group) => <article key={group.id}><div><strong>{group.nombre}</strong><small>{group.ciclo_nombre} · {group.docente_nombres} {group.docente_apellidos}</small></div><span>{group.horarios?.length ? group.horarios.map((item) => `${item.dia_semana.slice(0, 3)} ${item.hora_inicio.slice(0, 5)}–${item.hora_fin.slice(0, 5)}`).join(" · ") : "Horario pendiente"}</span></article>) : <p className="area-groups-empty">No hay grupos abiertos para esta área en el canal.</p>}</section>}</section>
    <section className="channel-students-section"><div className="admin-section-lead"><div><h3>Estudiantes del canal</h3><p>Abre un perfil para revisar datos, cursos, asistencias y simulacros.</p></div><div className="channel-student-actions"><span>{estudiantes.length} estudiantes</span><button className="button secondary small" onClick={() => setStudentDialog(true)}>＋ Registrar estudiante</button></div></div>{studentNotice && <div className="admin-registration-success"><div><strong>Perfil registrado · ID de acceso {studentAccessId ?? "—"}</strong><p>Contraseña inicial: {studentPasswordIsDni ? "su DNI" : "la ingresada"}. El estudiante ya tiene las áreas de este canal; registra su matrícula para generar las cuotas.</p></div><Link className="button primary small" href="/matriculas">Continuar a Matrículas →</Link></div>}{estudiantes.length ? <div className="admin-student-list">{estudiantes.map((person) => <button className="admin-student-row" key={person.id} onClick={() => setEstudiante(person)}><span className="student-list-avatar">{`${person.nombres[0] || ""}${person.apellidos[0] || ""}`.toUpperCase()}</span><span className="admin-student-name"><strong>{person.nombres} {person.apellidos}</strong><small>{person.codigo_estudiante} · DNI {person.dni} · ID de acceso {person.id_acceso}</small></span><span className={`admin-state-dot ${person.estado_usuario === "ACTIVO" ? "on" : "off"}`}>{person.estado_usuario === "ACTIVO" ? "Activo" : "Inactivo"}</span><b className="admin-row-arrow">↗</b></button>)}</div> : <div className="admin-empty-state"><strong>Este canal aún no tiene estudiantes</strong><p>Registra o asigna estudiantes al canal para verlos aquí.</p></div>}</section>
      </>}
    </>}

    {dialog === "canal" && canal && <div className="modal-backdrop"><section className="form-dialog" role="dialog" aria-modal="true"><div className="dialog-heading"><div><span className="eyebrow">CONFIGURACIÓN DE CANAL</span><h2>Editar canal 0{canal.id}</h2></div><button className="icon-button" onClick={() => setDialog(null)} aria-label="Cerrar">×</button></div><form className="form-stack" onSubmit={(event) => void saveCanal(event)}><label>Nombre<input name="nombre" required defaultValue={canal.nombre} /></label><label>Descripción<textarea name="descripcion" rows={3} defaultValue={canal.descripcion} /></label><label>Color identificador<select name="color" defaultValue={canal.color}><option value="verde">Verde</option><option value="azul">Azul</option><option value="violeta">Violeta</option><option value="ambar">Ámbar</option></select></label><div className="dialog-actions"><button type="button" className="button secondary" onClick={() => setDialog(null)}>Cancelar</button><button className="button primary" disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</button></div></form></section></div>}
    {dialog === "areas" && canal && <div className="modal-backdrop"><section className="form-dialog admin-area-dialog" role="dialog" aria-modal="true"><div className="dialog-heading"><div><span className="eyebrow">OFERTA ACADÉMICA</span><h2>Áreas del canal 0{canal.id}</h2><p>Selecciona las materias que forman parte de este canal.</p></div><button className="icon-button" onClick={() => setDialog(null)} aria-label="Cerrar">×</button></div><form onSubmit={(event) => void saveAreas(event)}><div className="area-checkbox-list">{cursos.map((course) => <div className="area-checkbox-item" key={course.id}><label><input type="checkbox" checked={selectedAreas.includes(course.id)} onChange={(event) => setSelectedAreas((items) => event.target.checked ? [...items, course.id] : items.filter((id) => id !== course.id))} /><span><strong>{course.nombre}</strong><small>{course.descripcion || "Sin descripción"}</small></span></label><button type="button" className="text-button" onClick={() => setEditingCourse(course)}>Editar</button></div>)}</div><div className="dialog-actions"><button type="button" className="button secondary" onClick={() => setDialog(null)}>Cancelar</button><button className="button primary" disabled={saving}>{saving ? "Guardando…" : "Guardar áreas"}</button></div></form>{editingCourse && <form className="add-area-form" onSubmit={(event) => void updateCourse(event)}><strong>Editar área</strong><div className="form-grid"><label>Nombre<input required value={editingCourse.nombre} onChange={(event) => setEditingCourse({ ...editingCourse, nombre: event.target.value })} /></label><label>Descripción<input value={editingCourse.descripcion || ""} onChange={(event) => setEditingCourse({ ...editingCourse, descripcion: event.target.value })} /></label></div><div className="dialog-actions"><button type="button" className="button secondary" onClick={() => setEditingCourse(null)}>Cancelar</button><button className="button primary" disabled={saving}>{saving ? "Guardando…" : "Guardar área"}</button></div></form>}<form className="add-area-form" onSubmit={(event) => void addCourse(event)}><strong>Agregar nueva área</strong><div className="form-grid"><label>Nombre<input value={nuevoCurso.nombre} onChange={(event) => setNuevoCurso({ ...nuevoCurso, nombre: event.target.value })} required /></label><label>Descripción<input value={nuevoCurso.descripcion} onChange={(event) => setNuevoCurso({ ...nuevoCurso, descripcion: event.target.value })} /></label></div><button className="button secondary" disabled={saving}>＋ Crear área</button></form></section></div>}
    {studentDialog && canal && <div className="modal-backdrop"><section className="form-dialog" role="dialog" aria-modal="true"><div className="dialog-heading"><div><span className="eyebrow">CANAL {canal.id} · NUEVO PERFIL</span><h2>Registrar estudiante</h2></div><button className="icon-button" onClick={() => setStudentDialog(false)} aria-label="Cerrar">×</button></div><form className="form-stack" onSubmit={(event) => void createStudent(event)}><div className="form-grid"><label>Nombres<input name="nombres" required /></label><label>Apellidos<input name="apellidos" required /></label><label>DNI<input name="dni" required pattern="[0-9]{8}" maxLength={8} /></label><label>Fecha de nacimiento<input name="fecha_nacimiento" type="date" required /></label><label>Turno<select name="turno" required defaultValue=""><option value="" disabled>Seleccionar turno…</option><option value="MANANA">Mañana · 08:00 a 12:00</option><option value="TARDE">Tarde · 13:00 a 17:00</option></select></label><label>Correo<input name="correo" type="email" /></label><label>Teléfono<input name="telefono" pattern="[0-9]{9}" maxLength={9} /></label><label className="form-span-two">Dirección<input name="direccion" /></label><label>Contraseña inicial<input name="password" type="password" /></label></div><p className="form-note">El estudiante quedará asignado al canal {canal.id}, a todos sus cursos y al turno elegido. Sus cuotas se agregan desde Matrículas.</p><div className="dialog-actions"><button type="button" className="button secondary" onClick={() => setStudentDialog(false)}>Cancelar</button><button className="button primary" disabled={saving}>{saving ? "Guardando…" : "Guardar perfil"}</button></div></form></section></div>}
  </div>;
}
