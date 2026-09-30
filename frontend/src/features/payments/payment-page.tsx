"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api/client";
import type { Rol } from "@/types/api";

type Payment = { id: number; matricula_id: number; codigo_matricula: string; estudiante_id: number; estudiante_nombres: string; estudiante_apellidos: string; curso_nombre: string; grupo_nombre: string; ciclo_nombre: string; concepto: string; monto: number; fecha: string; metodo_pago: string; estado: "PENDIENTE" | "PAGADO" | "ANULADO" };
type Enrollment = { id: number; codigo_matricula: string; estudiante_nombres: string; estudiante_apellidos: string; curso_nombre: string; estado: string };

export function PaymentPage() {
  const { token, usuario } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("TODOS");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const canRegister = usuario?.rol === "ADMINISTRADOR" || usuario?.rol === "ADMINISTRATIVO";
  const canVoid = usuario?.rol === "ADMINISTRADOR";
  const isStudent = usuario?.rol === "ESTUDIANTE";

  const refresh = useCallback(async () => {
    if (!token || !usuario) return;
    setLoading(true); setError("");
    try {
      const path = isStudent ? "/pagos/me" : "/pagos";
      const data = await apiRequest<Payment[]>(path, token);
      setPayments(data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudieron consultar los pagos."); }
    finally { setLoading(false); }
  }, [token, usuario, isStudent]);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!token || !canRegister) return;
    apiRequest<Enrollment[]>("/matriculas", token).then(setEnrollments)
      .catch((cause) => setError(cause instanceof Error ? cause.message : "No se pudieron cargar las matrículas."));
  }, [token, canRegister]);

  const filtered = useMemo(() => payments.filter((payment) => {
    const matchesState = status === "TODOS" || payment.estado === status;
    const query = search.trim().toLocaleLowerCase();
    const text = [payment.codigo_matricula, payment.estudiante_nombres, payment.estudiante_apellidos, payment.curso_nombre, payment.concepto].join(" ").toLocaleLowerCase();
    return matchesState && (!query || text.includes(query));
  }), [payments, status, search]);
  const sum = (state: Payment["estado"]) => payments.filter((payment) => payment.estado === state).reduce((total, payment) => total + Number(payment.monto), 0);

  async function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const form = new FormData(event.currentTarget);
    const payload = { matricula_id: Number(form.get("matricula_id")), concepto: String(form.get("concepto")), monto: Number(form.get("monto")), metodo_pago: String(form.get("metodo_pago")) };
    setSaving(true); setError(""); setMessage("");
    try {
      await apiRequest("/pagos", token, { method: "POST", body: JSON.stringify(payload) });
      setShowForm(false); setMessage("El pago se registró en la base de datos."); await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo registrar el pago."); }
    finally { setSaving(false); }
  }

  async function voidPayment(payment: Payment) {
    if (!token || !window.confirm(`¿Anular el pago “${payment.concepto}” de ${currency(payment.monto)}?`)) return;
    setError(""); setMessage("");
    try {
      await apiRequest(`/pagos/${payment.id}/anular`, token, { method: "PATCH" });
      setMessage("El pago se anuló y el cambio quedó guardado."); await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo anular el pago."); }
  }

  return <section className="payments-page">
    <div className="page-intro"><div><span className="eyebrow">CONTROL FINANCIERO</span><h2>{isStudent ? "Mis pagos" : "Pagos"}</h2><p>Historial y estados consultados directamente desde los registros de pagos.</p></div>{canRegister && <button className="button primary" onClick={() => setShowForm(true)}>＋ Registrar pago</button>}</div>
    <div className="payment-summary">
      <Summary label="Total registrado" value={currency(sum("PAGADO") + sum("PENDIENTE"))} note="No incluye pagos anulados" />
      <Summary label="Pagado" value={currency(sum("PAGADO"))} note={`${payments.filter((payment) => payment.estado === "PAGADO").length} registros`} />
      <Summary label="Pendiente" value={currency(sum("PENDIENTE"))} note={`${payments.filter((payment) => payment.estado === "PENDIENTE").length} registros`} />
      <Summary label="Anulado" value={currency(sum("ANULADO"))} note={`${payments.filter((payment) => payment.estado === "ANULADO").length} registros`} />
    </div>
    {error && <div className="alert error" role="alert">{error}</div>}{message && <div className="alert success">{message}</div>}
    <section className="table-panel payment-register"><div className="section-heading"><div><h3>Registro de operaciones</h3><p>{loading ? "Consultando MySQL…" : `${filtered.length} de ${payments.length} pagos`}</p></div>
      <div className="table-controls"><label className="search-field"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar estudiante, matrícula o concepto" /></label><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filtrar por estado"><option value="TODOS">Todos los estados</option><option value="PAGADO">Pagado</option><option value="PENDIENTE">Pendiente</option><option value="ANULADO">Anulado</option></select></div>
    </div><div className="table-scroll"><table><thead><tr><th>Fecha</th><th>Matrícula / estudiante</th><th>Curso</th><th>Concepto</th><th>Método</th><th>Importe</th><th>Estado</th>{canVoid && <th>Acción</th>}</tr></thead><tbody>
      {loading ? <tr><td colSpan={canVoid ? 8 : 7} className="table-message">Consultando pagos…</td></tr> : filtered.length === 0 ? <tr><td colSpan={canVoid ? 8 : 7} className="table-message">No hay pagos que coincidan con el filtro.</td></tr> : filtered.map((payment) => <tr key={payment.id}><td>{formatDate(payment.fecha)}</td><td><strong>{payment.codigo_matricula}</strong><small className="table-subtext">{payment.estudiante_nombres} {payment.estudiante_apellidos}</small></td><td>{payment.curso_nombre}</td><td>{payment.concepto}</td><td>{payment.metodo_pago}</td><td className="money-cell">{currency(Number(payment.monto))}</td><td><span className={`status-pill ${payment.estado.toLowerCase()}`}>{payment.estado}</span></td>{canVoid && <td>{payment.estado === "ANULADO" ? <span className="muted">—</span> : <button className="button danger small" onClick={() => voidPayment(payment)}>Anular</button>}</td>}</tr>)}
    </tbody></table></div></section>
    {showForm && <div className="modal-backdrop"><section className="form-dialog" role="dialog" aria-modal="true" aria-labelledby="payment-form-title"><div className="dialog-heading"><div><span className="eyebrow">NUEVO MOVIMIENTO</span><h2 id="payment-form-title">Registrar pago</h2></div><button className="icon-button" onClick={() => setShowForm(false)} aria-label="Cerrar">×</button></div>
      <form onSubmit={submitPayment} className="form-stack dialog-form"><label>Matrícula<select name="matricula_id" required defaultValue=""><option value="" disabled>Selecciona una matrícula</option>{enrollments.filter((enrollment) => enrollment.estado === "ACTIVA").map((enrollment) => <option key={enrollment.id} value={enrollment.id}>{enrollment.codigo_matricula} · {enrollment.estudiante_nombres} {enrollment.estudiante_apellidos} · {enrollment.curso_nombre}</option>)}</select></label><label>Concepto<input name="concepto" required maxLength={150} placeholder="Concepto del pago" /></label><div className="form-grid"><label>Importe (S/)<input name="monto" type="number" min="0.01" step="0.01" required /></label><label>Método<select name="metodo_pago" required defaultValue="EFECTIVO"><option value="EFECTIVO">Efectivo</option><option value="TRANSFERENCIA">Transferencia</option><option value="TARJETA">Tarjeta</option></select></label></div>
        <p className="form-note">Al confirmar, la API guardará el pago con la fecha y estado correspondientes.</p>{error && <div className="alert error">{error}</div>}<div className="dialog-actions"><button type="button" className="button secondary" onClick={() => setShowForm(false)}>Cancelar</button><button className="button primary" disabled={saving}>{saving ? "Guardando…" : "Confirmar pago"}</button></div>
      </form></section></div>}
  </section>;
}

function Summary({ label, value, note }: { label: string; value: string; note: string }) { return <article className="payment-summary-card"><span>{label}</span><strong>{value}</strong><small>{note}</small></article>; }
function currency(value: number) { return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(value); }
function formatDate(value: string) { return value ? new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(`${value.slice(0, 10)}T12:00:00`)) : "—"; }
