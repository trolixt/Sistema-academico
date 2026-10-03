"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api/client";

type Account = { id: number; id_acceso: string; rol: string; estado: "ACTIVO" | "INACTIVO"; nombres: string | null; apellidos: string | null; dni: string | null; correo: string | null; administrativo_id?: number | null };
type StaffForm = { nombres: string; apellidos: string; dni: string; correo: string; password: string };
const blank: StaffForm = { nombres: "", apellidos: "", dni: "", correo: "", password: "" };

export function SecretariaSection() {
  const { token } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selected, setSelected] = useState<Account | null>(null);
  const [form, setForm] = useState<StaffForm>(blank);
  const [editing, setEditing] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    if (!token) return;
    setLoading(true); setError("");
    try {
      const rows = await apiRequest<Account[]>("/usuarios?rol=ADMINISTRATIVO", token);
      setAccounts(rows);
      if (selected?.estado === "ACTIVO") setSelected(rows.find((row) => row.id === selected.id) || null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo cargar el personal de secretaría."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, [token]);

  const visible = useMemo(() => accounts.filter((row) => !search || `${row.id_acceso} ${row.nombres || ""} ${row.apellidos || ""} ${row.dni || ""}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())), [accounts, search]);

  async function searchById() {
    const id = search.trim();
    if (!token || !/^\d{1,9}$/.test(id)) return;
    setError("");
    try {
      const account = await apiRequest<Account>(`/usuarios/${id}`, token);
      if (account.rol !== "ADMINISTRATIVO") { setError(`El ID ${id} pertenece a otra clase de cuenta.`); return; }
      setSelected(account);
    } catch (cause) { setSelected(null); setError(cause instanceof Error ? cause.message : "No se encontró una cuenta de secretaría con ese ID."); }
  }

  function create() { setSelected(null); setEditing(false); setForm(blank); setDialog(true); setError(""); }
  function edit() {
    if (!selected) return;
    setEditing(true); setForm({ nombres: selected.nombres || "", apellidos: selected.apellidos || "", dni: selected.dni || "", correo: selected.correo || "", password: "" }); setDialog(true); setError("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!token) return;
    setSaving(true); setError(""); setNotice("");
    try {
      if (editing && selected) {
        const updated = await apiRequest<Account>(`/usuarios/${selected.id}/secretaria`, token, { method: "PUT", body: JSON.stringify({ nombres: form.nombres, apellidos: form.apellidos, dni: form.dni, correo: form.correo }) });
        if (form.password.trim()) await apiRequest(`/usuarios/${selected.id}/reset-password`, token, { method: "PATCH", body: JSON.stringify({ nueva_password: form.password }) });
        setSelected(updated); setNotice(`Datos guardados para la cuenta ID ${selected.id}.`);
      } else {
        const created = await apiRequest<Account>("/usuarios/secretaria", token, { method: "POST", body: JSON.stringify(form) });
      setSelected(created); setNotice(`Secretaría registrada. ID de acceso: ${created.id_acceso}. Comunica ese ID y la contraseña inicial.`);
      }
      setDialog(false); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo guardar la cuenta."); }
    finally { setSaving(false); }
  }

  async function changeStatus() {
    if (!token || !selected) return;
    const next = selected.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    setSaving(true); setError(""); setNotice("");
    try {
      const updated = await apiRequest<Account>(`/usuarios/${selected.id}/estado`, token, { method: "PATCH", body: JSON.stringify({ estado: next }) });
      setSelected(updated); setNotice(next === "ACTIVO" ? `Cuenta ID ${selected.id} activada.` : `Cuenta ID ${selected.id} desactivada y retirada de la lista activa.`);
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo cambiar el estado de la cuenta."); }
    finally { setSaving(false); }
  }

  return <section className="admin-section-content">
    <div className="admin-section-lead"><div><h3>Personal de secretaría</h3><p>Las cuentas inactivas no aparecen en el directorio. Para consultarlas, ingresa su ID de acceso.</p></div><button className="button primary" onClick={create}>＋ Nueva cuenta</button></div>
    {error && <div className="alert error" role="alert">{error}</div>}{notice && <div className="alert success">{notice}</div>}
    <div className="teacher-management-layout secretary-management-layout"><div className="teacher-directory"><div className="secretary-search"><label className="search-field"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void searchById(); } }} placeholder="ID, nombre o DNI" /></label><button className="button secondary small" onClick={() => void searchById()}>Buscar ID</button></div>{loading ? <div className="admin-loading"><i /><i /><i /></div> : visible.map((account) => <button key={account.id} className={selected?.id === account.id ? "selected" : ""} onClick={() => setSelected(account)}><span className="teacher-directory-avatar">{`${account.nombres?.[0] || "S"}${account.apellidos?.[0] || ""}`.toUpperCase()}</span><span><strong>{account.nombres} {account.apellidos}</strong><small>ID de acceso {account.id_acceso} · DNI {account.dni || "sin DNI"}</small></span><b>↗</b></button>)}{!loading && visible.length === 0 && <div className="admin-empty-state">No hay cuentas activas que coincidan con la búsqueda.</div>}</div>
      <div className="teacher-detail-column">{selected ? <><header className="teacher-profile-card"><span className="teacher-profile-avatar">{`${selected.nombres?.[0] || "S"}${selected.apellidos?.[0] || ""}`.toUpperCase()}</span><div><span className="eyebrow">ID DE ACCESO · {selected.id_acceso}</span><h3>{selected.nombres} {selected.apellidos}</h3><p>DNI {selected.dni || "sin registrar"} · {selected.correo || "Correo sin registrar"}</p></div><span className={`admin-state-dot ${selected.estado === "ACTIVO" ? "on" : "off"}`}>{selected.estado === "ACTIVO" ? "Activo" : "Inactivo"}</span></header><div className="admin-detail-panel secretary-account-panel"><header className="admin-panel-heading"><div><span className="panel-symbol">◈</span><div><h4>Cuenta de acceso</h4><p>El ingreso al sistema se realiza con este ID y su contraseña.</p></div></div></header><div className="student-facts"><div><span>ID de acceso</span><strong>{selected.id_acceso}</strong></div><div><span>Usuario interno</span><strong>{selected.nombres} {selected.apellidos}</strong></div></div><div className="dialog-actions"><button className="button secondary" onClick={edit}>Editar datos o contraseña</button><button className={`button ${selected.estado === "ACTIVO" ? "danger" : "primary"}`} disabled={saving} onClick={() => void changeStatus()}>{selected.estado === "ACTIVO" ? "Marcar inactiva" : "Activar cuenta"}</button></div></div></> : <div className="teacher-select-hint"><span>↖</span><h3>Elige una cuenta</h3><p>Aquí verás sus datos y su ID de acceso. Las cuentas inactivas se consultan escribiendo su ID.</p></div>}</div></div>
    {dialog && <div className="modal-backdrop"><section className="form-dialog" role="dialog" aria-modal="true"><div className="dialog-heading"><div><span className="eyebrow">ADMINISTRACIÓN DE CUENTAS</span><h2>{editing ? "Editar secretaría" : "Registrar secretaría"}</h2></div><button className="icon-button" onClick={() => setDialog(false)} aria-label="Cerrar">×</button></div><form className="form-stack" onSubmit={(event) => void save(event)}><div className="form-grid"><label>Nombres<input required value={form.nombres} onChange={(event) => setForm({ ...form, nombres: event.target.value })} /></label><label>Apellidos<input required value={form.apellidos} onChange={(event) => setForm({ ...form, apellidos: event.target.value })} /></label><label>DNI<input required pattern="[0-9]{8}" maxLength={8} value={form.dni} onChange={(event) => setForm({ ...form, dni: event.target.value })} /></label><label>Correo<input type="email" value={form.correo} onChange={(event) => setForm({ ...form, correo: event.target.value })} /></label><label className="form-span-two">{editing ? "Nueva contraseña (opcional)" : "Contraseña inicial"}<input type="password" minLength={6} required={!editing} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label></div><div className="dialog-actions"><button type="button" className="button secondary" onClick={() => setDialog(false)}>Cancelar</button><button className="button primary" disabled={saving}>{saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear cuenta"}</button></div></form></section></div>}
  </section>;
}
