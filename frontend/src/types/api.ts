export type Rol = "ADMINISTRADOR" | "ADMINISTRATIVO" | "DOCENTE" | "ESTUDIANTE";
export type Perfil = Record<string, string | number | null> & { nombres?: string; apellidos?: string; id?: number };
export type Usuario = { id: number; id_acceso: string; nombre_usuario: string; rol: Rol; estado: string; perfil: Perfil | null };
export type ApiEnvelope<T> = { success: boolean; data: T; message?: string };
