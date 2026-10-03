"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api/client";

type Row = Record<string, any>;

export function StudentCoursesPage() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<Row | null>(null);
  const [areas, setAreas] = useState<Row[]>([]);
  const [attendance, setAttendance] = useState<Row[]>([]);
  const [simulacros, setSimulacros] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    async function load() {
      setLoading(true); setError("");
      try {
        const student = await apiRequest<Row>("/estudiantes/me", token!);
        if (!student.canal_id) throw new Error("Tu cuenta todavía no tiene un canal asignado. Comunícate con administración.");
        const [courses, records, scores] = await Promise.all([
          apiRequest<Row[]>(`/academicos/canales/${student.canal_id}/areas`, token!),
          apiRequest<Row[]>("/asistencias/me", token!),
          apiRequest<Row[]>("/simulacros/me", token!),
        ]);
        if (!cancelled) { setProfile(student); setAreas(courses); setAttendance(records); setSimulacros(scores); }
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "No se pudieron cargar tus cursos.");
      } finally { if (!cancelled) setLoading(false); }
    }
    void load();
    return () => { cancelled = true; };
  }, [token]);

  const courseAttendance = useMemo(() => {
    if (!selected) return null;
    const records = attendance.filter((item) => item.curso_nombre === selected.nombre);
    let points = 0;
    let possible = 0;
    for (const record of records) {
      if (record.estado_asistencia === "JUSTIFICADO") continue;
      possible += 2;
      if (record.estado_asistencia === "PRESENTE") points += 2;
      if (record.estado_asistencia === "TARDANZA") points += 1;
    }
    return { points, possible, percentage: possible ? `${((points / possible) * 100).toLocaleString("es-PE", { maximumFractionDigits: 1 })}%` : "Sin sesiones computables" };
  }, [selected, attendance]);

  const channelResults = useMemo(() => simulacros.filter((result) => Number(result.canal_id) === Number(profile?.canal_id)), [simulacros, profile]);

  return <section className="student-courses-page">
    <div className="page-intro"><div><span className="eyebrow">TU PREPARACIÓN</span><h2>Mis cursos</h2><p>{profile?.canal_id ? `Canal ${profile.canal_id} · ${profile.canal_nombre || "Tus cursos asignados"}` : "Cursos incluidos en tu canal"}</p></div></div>
    {error && <div className="alert error" role="alert">{error}</div>}
    {loading ? <div className="profile-loading" aria-label="Cargando cursos"><span /><span /><span /></div> : areas.length ? <div className="student-course-grid">{areas.map((area, index) => <button className={`student-course-card student-course-art-${index % 4} ${selected?.id === area.id ? "selected" : ""}`} key={area.id} onClick={() => setSelected(area)}><span className="student-course-cover"><i>ÁREA {String(index + 1).padStart(2, "0")}</i><b>{area.nombre.slice(0, 1)}</b></span><span className="student-course-copy"><small>CANAL {String(profile?.canal_id || "").padStart(2, "0")}</small><strong>{area.nombre}</strong><span>{area.descripcion || "Área de preparación preuniversitaria"}</span><em>Ver mi avance <b>↗</b></em></span></button>)}</div> : !error && <div className="profile-empty">Este canal aún no tiene cursos configurados.</div>}
    {selected && courseAttendance && <section className="student-course-progress"><header><div><span className="eyebrow">CANAL {profile?.canal_id} · ÁREA</span><h3>{selected.nombre}</h3><p>Tu información de asistencia y simulacros es de solo lectura.</p></div><button className="icon-button" onClick={() => setSelected(null)} aria-label="Cerrar">×</button></header><div className="student-course-stat"><span>Porcentaje de asistencia</span><strong>{courseAttendance.percentage}</strong></div><section className="student-simulacro-results"><div><h4>Resultados de simulacros</h4><p>Puntajes registrados para tu canal, sobre 600 puntos.</p></div>{channelResults.length ? <div className="student-simulacro-list">{channelResults.map((result) => <article key={result.resultado_id}><span><strong>{result.nombre}</strong><small>{formatDate(result.fecha)}</small></span><b>{Number(result.puntaje).toLocaleString("es-PE", { maximumFractionDigits: 1 })}<small> / {result.puntaje_maximo}</small></b></article>)}</div> : <p className="profile-empty">Aún no hay resultados de simulacros registrados.</p>}</section></section>}
  </section>;
}

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "Fecha pendiente";
  const date = value instanceof Date ? value : new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.valueOf()) ? String(value) : new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(date);
}
