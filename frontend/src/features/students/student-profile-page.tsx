"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api/client";

type StudentProfile = {
  codigo_estudiante: string;
  nombres: string;
  apellidos: string;
  dni: string;
  fecha_nacimiento: string;
  correo: string | null;
  telefono: string | null;
  direccion: string | null;
  estado: string;
  estado_usuario: string;
  canal_id: number | null;
  canal_nombre: string | null;
};

export function StudentProfilePage() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    apiRequest<StudentProfile>("/estudiantes/me", token)
      .then(setProfile)
      .catch((cause) => setError(cause instanceof Error ? cause.message : "No se pudieron cargar tus datos."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <section className="profile-loading" aria-label="Cargando perfil"><span /><span /><span /></section>;
  if (error) return <div className="alert error" role="alert">{error}</div>;
  if (!profile) return <div className="profile-empty">No se encontró un perfil asociado a esta cuenta.</div>;

  const initials = `${profile.nombres?.trim().charAt(0) || ""}${profile.apellidos?.trim().charAt(0) || ""}`.toUpperCase();
  const active = profile.estado_usuario === "ACTIVO";
  return <section className="student-profile-page">
    <div className="page-intro"><div><span className="eyebrow">TU ESPACIO PERSONAL</span><h2>Mis datos</h2><p>Tu información académica y personal, en un solo lugar.</p></div></div>
    <div className="profile-layout">
      <aside className="profile-identity-card"><div className="profile-orbit orbit-one"/><div className="profile-orbit orbit-two"/><div className="profile-avatar">{initials || "ES"}</div><span className="profile-role">ESTUDIANTE</span><h3>{profile.nombres} {profile.apellidos}</h3><p>Tu perfil en SA-studios</p><div className="profile-code"><span>CÓDIGO DE ESTUDIANTE</span><strong>{profile.codigo_estudiante}</strong></div><div className={`profile-account-state ${active ? "active" : "inactive"}`}><i /> Cuenta {active ? "activa" : "inactiva"}</div></aside>
      <div className="profile-details-column">
        <section className="profile-details-card"><header className="profile-section-heading"><span className="profile-section-icon">◈</span><div><h3>Información personal</h3><p>Datos registrados en tu cuenta</p></div></header><div className="profile-fields">
          <ProfileField label="Nombres" value={profile.nombres} />
          <ProfileField label="Apellidos" value={profile.apellidos} />
          <ProfileField label="Documento de identidad" value={profile.dni} />
          <ProfileField label="Fecha de nacimiento" value={formatDate(profile.fecha_nacimiento)} />
          <ProfileField label="Canal de preparación" value={profile.canal_id ? `Canal ${profile.canal_id} · ${profile.canal_nombre || ""}` : null} />
        </div></section>
        <section className="profile-details-card"><header className="profile-section-heading"><span className="profile-section-icon contact-icon">⌖</span><div><h3>Contacto</h3><p>Información para comunicarnos contigo</p></div></header><div className="profile-fields">
          <ProfileField label="Correo electrónico" value={profile.correo} />
          <ProfileField label="Teléfono" value={profile.telefono} />
          <ProfileField label="Dirección" value={profile.direccion} wide />
        </div></section>
        <p className="profile-footnote">Si algún dato necesita actualizarse, comunícate con administración.</p>
      </div>
    </div>
  </section>;
}

function ProfileField({ label, value, wide = false }: { label: string; value: string | null | undefined; wide?: boolean }) {
  return <div className={`profile-field ${wide ? "wide" : ""}`}><span>{label}</span><strong>{value?.trim() || "Sin registrar"}</strong></div>;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Sin registrar";
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.valueOf()) ? value : new Intl.DateTimeFormat("es-PE", { dateStyle: "long" }).format(date);
}
