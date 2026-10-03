"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api/client";
import type { Usuario } from "@/types/api";

type Row = Record<string, unknown>;
type Metrics = { label: string; value: number | string; description: string }[];

export function DashboardPage() {
  const { token, usuario } = useAuth();
  const [metrics, setMetrics] = useState<Metrics>([]);
  const [recent, setRecent] = useState<Row[]>([]);
  const [columns, setColumns] = useState<[string, string][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !usuario) return;
    let cancelled = false;
    async function load() {
      setLoading(true); setError("");
      try {
        const result = await dashboardData(token!, usuario!);
        if (!cancelled) { setMetrics(result.metrics); setRecent(result.recent); setColumns(result.columns); }
      } catch (cause) { if (!cancelled) setError(cause instanceof Error ? cause.message : "No se pudo consultar el resumen."); }
      finally { if (!cancelled) setLoading(false); }
    }
    void load();
    return () => { cancelled = true; };
  }, [token, usuario]);

  return <div className="dashboard-page">
    <div className="page-intro"><div><span className="eyebrow">INFORMACIÓN REGISTRADA</span><h2>Resumen académico</h2><p>Los indicadores se calculan con los registros disponibles en la base de datos.</p></div><span className="data-source-badge"><i /> Fuente: MySQL</span></div>
    {error && <div className="alert error">{error}</div>}
    <div className="metric-grid">{loading ? <div className="panel-loading">Consultando los registros…</div> : metrics.map((metric) => <article className="metric-card" key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.description}</small></article>)}</div>
    <section className="dashboard-table-section"><div className="section-heading"><div><h3>Registros recientes</h3><p>Ordenados por la fecha disponible en la base de datos.</p></div></div>
      <div className="table-panel"><div className="table-scroll"><table><thead><tr>{columns.map(([, label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>{loading ? <tr><td className="table-message" colSpan={columns.length || 1}>Consultando…</td></tr> : recent.length ? recent.map((row, index) => <tr key={String(row.id ?? index)}>{columns.map(([key]) => <td key={key}>{format(row[key])}</td>)}</tr>) : <tr><td className="table-message" colSpan={columns.length || 1}>La base de datos no tiene registros para mostrar.</td></tr>}</tbody></table></div></div>
    </section>
  </div>;
}

async function dashboardData(token: string, usuario: Usuario) {
  if (usuario.rol === "ESTUDIANTE") {
    const [matriculas, pagos, profile] = await Promise.all([
      apiRequest<Row[]>("/matriculas/me", token), apiRequest<Row[]>("/pagos/me", token), apiRequest<Row>("/estudiantes/me", token),
    ]);
    const areas = profile.canal_id ? await apiRequest<Row[]>(`/academicos/canales/${profile.canal_id}/areas`, token) : [];
    const activeChannels = new Set(matriculas.filter((row) => row.estado === "ACTIVA").map((row) => `${row.canal_id}-${row.ciclo_id}`));
    const pending = pagos.filter((pago) => pago.estado === "PENDIENTE");
    return {
      metrics: [
        { label: "Matrículas", value: activeChannels.size, description: "Canales vinculados a tu cuenta" },
        { label: "Cursos", value: areas.length, description: "Incluidos en tu canal" },
        { label: "Pagos pendientes", value: pending.length, description: "Registros pendientes en tu cuenta" },
        { label: "Importe pendiente", value: currency(pending.reduce((sum, payment) => sum + Number(payment.monto || 0), 0)), description: "Suma de pagos pendientes" },
      ],
      recent: pagos.slice(0, 6), columns: [["concepto", "Concepto"], ["canal_nombre", "Canal"], ["fecha", "Fecha"], ["monto", "Importe"], ["estado", "Estado"]] as [string, string][],
    };
  }
  if (usuario.rol === "DOCENTE") {
    const groups = await apiRequest<Row[]>("/academicos/grupos/me", token);
    return {
      metrics: [
        { label: "Grupos asignados", value: groups.length, description: "Según tu asignación docente" },
        { label: "Estudiantes matriculados", value: groups.reduce((sum, group) => sum + Number(group.matriculados_count || 0), 0), description: "Suma de matrículas activas en tus grupos" },
        { label: "Vacantes disponibles", value: groups.reduce((sum, group) => sum + Number(group.vacantes_disponibles || 0), 0), description: "Capacidad restante en tus grupos" },
      ],
      recent: groups.slice(0, 6), columns: [["nombre", "Grupo"], ["curso_nombre", "Curso"], ["ciclo_nombre", "Ciclo"], ["matriculados_count", "Estudiantes"], ["estado", "Estado"]] as [string, string][],
    };
  }
  const requests: [string, string][] = [["/estudiantes", "students"], ["/academicos/grupos", "groups"], ["/matriculas", "enrollments"], ["/pagos", "payments"]];
  if (usuario.rol === "ADMINISTRADOR") requests.push(["/docentes", "teachers"], ["/academicos/cursos", "courses"]);
  const data = Object.fromEntries(await Promise.all(requests.map(async ([path, key]) => [key, await apiRequest<Row[]>(path, token)] as const)));
  const payments = data.payments as Row[];
  const pending = payments.filter((payment) => payment.estado === "PENDIENTE");
  const enrollments = data.enrollments as Row[];
  const groups = data.groups as Row[];
  const metrics: Metrics = [
    { label: "Estudiantes", value: (data.students as Row[]).length, description: "Registros en la base de datos" },
    { label: "Matrículas activas", value: enrollments.filter((row) => row.estado === "ACTIVA").length, description: "Estado consultado en MySQL" },
    { label: "Grupos", value: groups.length, description: "Registros devueltos por la API" },
    { label: "Pagos pendientes", value: pending.length, description: currency(pending.reduce((sum, row) => sum + Number(row.monto || 0), 0)) },
  ];
  if (usuario.rol === "ADMINISTRADOR") {
    metrics.splice(1, 0, { label: "Docentes", value: (data.teachers as Row[]).length, description: "Registros en la base de datos" });
    metrics.splice(3, 0, { label: "Cursos", value: (data.courses as Row[]).length, description: "Registros en la base de datos" });
  }
  return { metrics, recent: enrollments.slice(0, 6), columns: [["codigo_matricula", "Matrícula"], ["estudiante_nombres", "Estudiante"], ["curso_nombre", "Curso"], ["grupo_nombre", "Grupo"], ["fecha_registro", "Fecha"], ["estado", "Estado"]] as [string, string][] };
}

function currency(amount: number) { return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(amount); }
function format(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return new Date(value).toLocaleDateString("es-PE");
  return String(value);
}
