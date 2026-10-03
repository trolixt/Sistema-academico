"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api/client";

type PaymentStatus = "PENDIENTE" | "PAGADO" | "VENCIDO" | "ANULADO";
type Payment = {
  id: number; matricula_id: number; codigo_pago: string | null; codigo_matricula: string; estudiante_id: number;
  estudiante_nombres: string; estudiante_apellidos: string; estudiante_dni: string;
  canal_nombre: string; curso_nombre: string | null; grupo_nombre: string | null; ciclo_nombre: string; concepto: string;
  tipo_pago: "MATRICULA" | "MENSUALIDAD" | "OTRO"; periodo: string | null;
  fecha_vencimiento: string | null; monto: number; monto_recibido: number | null; fecha: string | null;
  metodo_pago: "EFECTIVO" | "YAPE" | "TRANSFERENCIA" | null; referencia_operacion: string | null;
  estado: PaymentStatus;
};

export function PaymentPage() {
  const { token, usuario } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("TODOS");
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [charge, setCharge] = useState<Payment | null>(null);
  const [lookupBusy, setLookupBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");
  const canRegister = usuario?.rol === "ADMINISTRADOR" || usuario?.rol === "ADMINISTRATIVO";
  const canVoid = usuario?.rol === "ADMINISTRADOR";
  const isStudent = usuario?.rol === "ESTUDIANTE";

  const refresh = useCallback(async () => {
    if (!token || !usuario) return;
    setLoading(true); setError("");
    try { setPayments(await apiRequest<Payment[]>(isStudent ? "/pagos/me" : "/pagos", token)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudieron consultar los pagos."); }
    finally { setLoading(false); }
  }, [token, usuario, isStudent]);
  useEffect(() => { void refresh(); }, [refresh]);

  const filtered = useMemo(() => payments.filter((payment) => {
    const query = search.trim().toLocaleLowerCase();
    const searchable = [payment.codigo_pago, payment.codigo_matricula, payment.estudiante_nombres,
      payment.estudiante_apellidos, payment.estudiante_dni, payment.canal_nombre, payment.ciclo_nombre,
      payment.concepto, payment.periodo, payment.referencia_operacion].join(" ").toLocaleLowerCase();
    return (status === "TODOS" || payment.estado === status) && (!query || searchable.includes(query));
  }), [payments, status, search]);
  const sum = (states: PaymentStatus[]) => payments.filter((payment) => states.includes(payment.estado))
    .reduce((total, payment) => total + Number(payment.monto), 0);

  function openCashier(initialCode = "") {
    setCode(initialCode); setCharge(null); setShowForm(true); setError(""); setMessage("");
  }

  async function lookupCharge(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!token || !code.trim()) return;
    setLookupBusy(true); setError(""); setCharge(null);
    try { setCharge(await apiRequest<Payment>(`/pagos/codigo/${encodeURIComponent(code.trim())}`, token)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No se encontró el código de pago."); }
    finally { setLookupBusy(false); }
  }

  async function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !charge) return;
    const form = new FormData(event.currentTarget);
    const method = String(form.get("metodo_pago")) as Payment["metodo_pago"];
    const payload = {
      codigo_pago: charge.codigo_pago,
      monto_recibido: Number(form.get("monto_recibido")),
      metodo_pago: method,
      referencia_operacion: method === "EFECTIVO" ? undefined : String(form.get("referencia_operacion") || "").trim(),
    };
    setSaving(true); setError(""); setMessage("");
    try {
      await apiRequest<Payment>("/pagos", token, { method: "POST", body: JSON.stringify(payload) });
      setShowForm(false); setCharge(null); setMessage("Cobro recibido, verificado y aplicado a la cuota."); await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo registrar el cobro."); }
    finally { setSaving(false); }
  }

  async function copyCode(payment: Payment) {
    if (!payment.codigo_pago) return;
    try { await navigator.clipboard.writeText(payment.codigo_pago); setCopiedCode(payment.codigo_pago); }
    catch { setError("No se pudo copiar el código. Puedes seleccionarlo y copiarlo manualmente."); }
  }

  async function voidPayment(payment: Payment) {
    if (!token || !window.confirm(`¿Anular “${payment.concepto}” de ${currency(Number(payment.monto))}?`)) return;
    setError(""); setMessage("");
    try { await apiRequest(`/pagos/${payment.id}/anular`, token, { method: "PATCH" }); setMessage("La cuota se anuló."); await refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo anular la cuota."); }
  }

  const columns = (isStudent ? 6 : 8) + Number(canRegister || canVoid);
  return <section className="payments-page">
    <div className="page-intro"><div><span className="eyebrow">CONTROL FINANCIERO</span><h2>{isStudent ? "Mis pagos" : "Pagos y mensualidades"}</h2>
      <p>{isStudent ? "Consulta tus cuotas, importes y códigos para pagar." : "Consulta las cuotas y registra los importes recibidos en secretaría."}</p></div>
      {canRegister && <button className="button primary" onClick={() => openCashier()}>＋ Registrar cobro</button>}
    </div>
    {isStudent && <aside className="panel payment-instructions"><strong>Cómo pagar una cuota</strong><p>Usa el código como referencia al enviar el importe exacto por Yape o transferencia al destino oficial de la academia. Solicita los datos de destino a secretaría. El abono se verá aplicado cuando secretaría lo reciba y registre.</p></aside>}
    <div className="payment-summary">
      <Summary label="Cuotas programadas" value={currency(sum(["PAGADO", "PENDIENTE", "VENCIDO"]))} note={`${payments.length} cuotas`} />
      <Summary label="Pagado" value={currency(sum(["PAGADO"]))} note={`${payments.filter((payment) => payment.estado === "PAGADO").length} cuotas`} />
      <Summary label="Por pagar" value={currency(sum(["PENDIENTE", "VENCIDO"]))} note={`${payments.filter((payment) => payment.estado === "PENDIENTE" || payment.estado === "VENCIDO").length} pendientes o vencidas`} />
      {!isStudent && <Summary label="Anulado" value={currency(sum(["ANULADO"]))} note={`${payments.filter((payment) => payment.estado === "ANULADO").length} registros`} />}
    </div>
    {error && <div className="alert error" role="alert">{error}</div>}{message && <div className="alert success" role="status">{message}</div>}
    <section className="table-panel payment-register"><div className="section-heading"><div><h3>{isStudent ? "Mis cuotas" : "Cuotas y cobros"}</h3><p>{loading ? "Actualizando registros…" : `${filtered.length} de ${payments.length} cuotas`}</p></div>
      <div className="table-controls payment-filters">
        <label className="search-field"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={isStudent ? "Buscar por curso o código" : "Código, estudiante, DNI o curso"} /></label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filtrar por estado"><option value="TODOS">Todos los estados</option><option value="PAGADO">Pagado</option><option value="PENDIENTE">Pendiente</option><option value="VENCIDO">Vencido</option><option value="ANULADO">Anulado</option></select>
      </div>
    </div><div className="table-scroll"><table><thead><tr><th>Vencimiento</th>{!isStudent && <th>Estudiante</th>}<th>Curso y ciclo</th><th>Cuota</th><th>Código de pago</th>{!isStudent && <th>Forma / operación</th>}<th>Importe</th><th>Estado</th>{(canRegister || canVoid) && <th>Acción</th>}</tr></thead><tbody>
      {loading ? <tr><td colSpan={columns} className="table-message">Consultando pagos…</td></tr> : filtered.length === 0 ? <tr><td colSpan={columns} className="table-message">No hay cuotas que coincidan con los filtros.</td></tr> : filtered.map((payment) => <tr key={payment.id}>
        <td>{payment.fecha ? formatDate(payment.fecha) : payment.fecha_vencimiento ? formatDate(payment.fecha_vencimiento) : "—"}</td>
        {!isStudent && <td><strong>{payment.estudiante_nombres} {payment.estudiante_apellidos}</strong><small className="table-subtext">DNI {payment.estudiante_dni} · {payment.codigo_matricula}</small></td>}
        <td>{payment.canal_nombre}<small className="table-subtext">{payment.ciclo_nombre}</small></td>
        <td>{payment.tipo_pago === "MENSUALIDAD" ? `Mensualidad ${monthLabel(payment.periodo)}` : payment.tipo_pago === "MATRICULA" ? "Matrícula inicial" : payment.concepto}</td>
        <td><strong className="payment-code">{payment.codigo_pago || "Sin código"}</strong>{isStudent && (payment.estado === "PENDIENTE" || payment.estado === "VENCIDO") && payment.codigo_pago && <button className="button secondary small" onClick={() => void copyCode(payment)}>{copiedCode === payment.codigo_pago ? "Copiado" : "Copiar código"}</button>}</td>
        {!isStudent && <td>{payment.metodo_pago ? methodLabel(payment.metodo_pago) : "—"}<small className="table-subtext">{payment.referencia_operacion || ""}</small></td>}
        <td className="money-cell">{currency(Number(payment.monto))}</td>
        <td><span className={`status-pill ${payment.estado.toLowerCase()}`}>{statusLabel(payment.estado)}</span></td>
        {(canRegister || canVoid) && <td className="payment-actions">
          {canRegister && (payment.estado === "PENDIENTE" || payment.estado === "VENCIDO") && <button className="button secondary small" onClick={() => openCashier(payment.codigo_pago || "")}>Registrar cobro</button>}
          {canVoid && payment.estado !== "ANULADO" && <button className="button danger small" onClick={() => void voidPayment(payment)}>Anular</button>}
        </td>}
      </tr>)}
    </tbody></table></div></section>
    {showForm && <div className="modal-backdrop"><section className="form-dialog" role="dialog" aria-modal="true" aria-labelledby="payment-form-title"><div className="dialog-heading"><div><span className="eyebrow">CAJA DE SECRETARÍA</span><h2 id="payment-form-title">Registrar cobro recibido</h2></div><button className="icon-button" onClick={() => setShowForm(false)} aria-label="Cerrar">×</button></div>
      <form onSubmit={(event) => void lookupCharge(event)} className="form-stack dialog-form"><label>Código de pago<input value={code} onChange={(event) => { setCode(event.target.value.toUpperCase()); setCharge(null); }} placeholder="SA-0000000001" required /></label><button className="button secondary" type="submit" disabled={lookupBusy || !code.trim()}>{lookupBusy ? "Buscando…" : "Buscar cuota"}</button></form>
      {charge && <form onSubmit={submitPayment} className="form-stack dialog-form cashier-form">
        <div className="payment-quote"><strong>{charge.estudiante_nombres} {charge.estudiante_apellidos}</strong><span>{charge.canal_nombre} · {charge.ciclo_nombre}</span><span>{charge.concepto} · {charge.codigo_pago}</span><strong>Importe pendiente: {currency(Number(charge.monto))}</strong></div>
        <label>Importe recibido (S/)<input name="monto_recibido" type="number" min="0.01" step="0.01" defaultValue={Number(charge.monto).toFixed(2)} required /></label>
        <label>Forma de pago<select name="metodo_pago" required defaultValue=""><option value="" disabled>Seleccionar…</option><option value="YAPE">Yape recibido</option><option value="TRANSFERENCIA">Transferencia bancaria recibida</option><option value="EFECTIVO">Efectivo recibido en caja</option></select></label>
        <label>Número de operación (Yape o banco)<input name="referencia_operacion" maxLength={100} placeholder="Escribe la operación recibida" /></label>
        <p className="form-note">Comprueba el ingreso en la cuenta o billetera oficial antes de guardar. El sistema valida que el importe coincida exactamente y aplicará el cobro.</p>
        <div className="dialog-actions"><button type="button" className="button secondary" onClick={() => setShowForm(false)}>Cancelar</button><button className="button primary" disabled={saving}>{saving ? "Registrando…" : "Confirmar cobro recibido"}</button></div>
      </form>}
    </section></div>}
  </section>;
}

function Summary({ label, value, note }: { label: string; value: string; note: string }) { return <article className="payment-summary-card"><span>{label}</span><strong>{value}</strong><small>{note}</small></article>; }
function currency(value: number) { return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(value); }
function formatDate(value: string) { return value ? new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(`${value.slice(0, 10)}T12:00:00`)) : "—"; }
function monthLabel(value: string | null) { return value ? new Intl.DateTimeFormat("es-PE", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}-01T12:00:00Z`)) : ""; }
function methodLabel(value: string) { return value === "EFECTIVO" ? "Efectivo" : value === "YAPE" ? "Yape" : value === "TRANSFERENCIA" ? "Transferencia" : value; }
function statusLabel(value: PaymentStatus) { return value === "PAGADO" ? "Pagado" : value === "VENCIDO" ? "Vencido" : value === "PENDIENTE" ? "Pendiente" : "Anulado"; }
