import { Request } from 'express';

// ==========================================
// ENUMS & CONSTANTES DE ROL Y ESTADO
// ==========================================
export type RolUsuario = 'ADMINISTRADOR' | 'ADMINISTRATIVO' | 'DOCENTE' | 'ESTUDIANTE';
export type EstadoUsuario = 'ACTIVO' | 'INACTIVO';
export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO';
export type EstadoMatricula = 'PENDIENTE_PAGO' | 'ACTIVA' | 'CANCELADA' | 'RETIRADA';
export type MetodoPago = 'EFECTIVO' | 'YAPE' | 'TRANSFERENCIA';
export type EstadoPago = 'PENDIENTE' | 'PAGADO' | 'VENCIDO' | 'ANULADO';
export type TipoPago = 'MATRICULA' | 'MENSUALIDAD' | 'OTRO';
export type EstadoSesionAsistencia = 'ABIERTA' | 'CERRADA';
export type EstadoAsistencia = 'PRESENTE' | 'AUSENTE' | 'TARDANZA' | 'JUSTIFICADO';
export type EstadoEvaluacion = 'BORRADOR' | 'PUBLICADA';

// ==========================================
// ENTIDADES DE USUARIOS Y PERFILES
// ==========================================
export interface IUsuario {
  id: number;
  id_acceso: string;
  nombre_usuario: string;
  password_hash: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
}

export interface IAdministrador {
  id: number;
  usuario_id: number;
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string | null;
}

export interface IPersonalAdministrativo {
  id: number;
  usuario_id: number;
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string | null;
}

export interface IDocente {
  id: number;
  usuario_id: number;
  codigo_docente: string;
  nombres: string;
  apellidos: string;
  dni: string;
  telefono: string | null;
  correo: string | null;
}

export interface IEstudiante {
  id: number;
  usuario_id: number;
  canal_id: number | null;
  canal_nombre?: string | null;
  codigo_estudiante: string;
  nombres: string;
  apellidos: string;
  dni: string;
  fecha_nacimiento: string | Date;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  estado: EstadoUsuario;
}

// Tipo unión para cualquier perfil asociado
export type PerfilUsuario = IAdministrador | IPersonalAdministrativo | IDocente | IEstudiante;

// ==========================================
// DTOs DE AUTENTICACIÓN
// ==========================================
export interface LoginDTO {
  id_acceso: string;
  password: string;
}

export interface UsuarioAutenticado {
  id: number;
  id_acceso: string;
  nombre_usuario: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
  perfil: PerfilUsuario | null;
}

export interface LoginResponseDTO {
  token: string;
  usuario: UsuarioAutenticado;
}

export interface JWTPayload {
  id: number;
  nombre_usuario: string;
  rol: RolUsuario;
  perfil_id?: number;
}

// ==========================================
// CURSOS (ENTIDADES Y DTOs)
// ==========================================
export interface ICurso {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: EstadoUsuario;
}

export interface CreateCursoDTO {
  nombre: string;
  descripcion?: string;
}

export interface UpdateCursoDTO {
  nombre?: string;
  descripcion?: string;
  estado?: EstadoUsuario;
}

// ==========================================
// CICLOS ACADÉMICOS (ENTIDADES Y DTOs)
// ==========================================
export interface ICicloAcademico {
  id: number;
  nombre: string;
  fecha_inicio: string | Date;
  fecha_fin: string | Date;
  estado: EstadoUsuario;
}

export interface CreateCicloDTO {
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
}

export interface UpdateCicloDTO {
  nombre?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: EstadoUsuario;
}

// ==========================================
// HORARIOS (ENTIDADES Y DTOs)
// ==========================================
export interface IHorario {
  id: number;
  grupo_id: number;
  dia_semana: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
  aula: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
}

export interface CreateHorarioDTO {
  grupo_id: number;
  dia_semana: DiaSemana;
  hora_inicio: string;
  hora_fin: string;
  aula: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface UpdateHorarioDTO {
  grupo_id?: number;
  dia_semana?: DiaSemana;
  hora_inicio?: string;
  hora_fin?: string;
  aula?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface CreateHorarioRecurrenteDTO {
  grupo_id: number;
  dias_semana: DiaSemana[];
  hora_inicio: string;
  hora_fin: string;
  aula: string;
  fecha_inicio: string;
  fecha_fin: string;
}

export interface IExcepcionHorario {
  id: number;
  canal_id: number;
  fecha: string;
  motivo: string;
}

// ==========================================
// GRUPOS (ENTIDADES Y DTOs)
// ==========================================
export interface IGrupo {
  id: number;
  nombre: string;
  curso_id: number;
  canal_id: number;
  docente_id: number;
  ciclo_id: number;
  capacidad: number;
  estado: EstadoUsuario;
}

export interface CreateGrupoDTO {
  nombre: string;
  curso_id: number;
  canal_id: number;
  docente_id: number;
  ciclo_id: number;
  capacidad?: number;
}

export interface UpdateGrupoDTO {
  nombre?: string;
  curso_id?: number;
  canal_id?: number;
  docente_id?: number;
  ciclo_id?: number;
  capacidad?: number;
  estado?: EstadoUsuario;
}

export interface IGrupoDetalle extends IGrupo {
  canal_nombre: string;
  curso_nombre: string;
  curso_descripcion?: string | null;
  docente_nombres: string;
  docente_apellidos: string;
  docente_codigo: string;
  ciclo_nombre: string;
  ciclo_fecha_inicio: string | Date;
  ciclo_fecha_fin: string | Date;
  matriculados_count: number;
  vacantes_disponibles: number;
  horarios?: IHorario[];
}

export interface FiltrosGrupoDTO {
  canal_id?: number;
  ciclo_id?: number;
  curso_id?: number;
  docente_id?: number;
  estudiante_id?: number;
  soloActivos?: boolean;
}

// ==========================================
// ESTUDIANTES (DTOs TRANSACCIONALES)
// ==========================================
export interface CreateEstudianteDTO {
  canal_id?: number;
  nombres: string;
  apellidos: string;
  dni: string;
  fecha_nacimiento: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  nombre_usuario?: string;
  password?: string;
}

export interface UpdateEstudianteDTO {
  canal_id?: number | null;
  nombres?: string;
  apellidos?: string;
  dni?: string;
  fecha_nacimiento?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  estado?: EstadoUsuario;
}

export interface EstudianteConUsuario extends IEstudiante {
  id_acceso: string;
  nombre_usuario: string;
  estado_usuario: EstadoUsuario;
}

// ==========================================
// MATRÍCULAS (ENTIDADES Y DTOs)
// ==========================================
export interface IMatricula {
  id: number;
  codigo_matricula: string;
  estudiante_id: number;
  canal_id: number;
  grupo_id: number | null;
  ciclo_id: number;
  estado: EstadoMatricula;
  fecha_registro: string | Date;
}

export interface CreateMatriculaDTO {
  estudiante_id: number;
  canal_id: number;
  ciclo_id: number;
  pago_inicial: {
    concepto: string;
    monto: number;
    monto_mensualidad: number;
  };
}

export interface CambiarEstadoMatriculaDTO {
  estado: EstadoMatricula;
}

export interface IMatriculaDetalle extends IMatricula {
  estudiante_nombres: string;
  estudiante_apellidos: string;
  estudiante_dni: string;
  estudiante_codigo: string;
  estudiante_correo?: string | null;
  grupo_nombre: string | null;
  curso_id: number | null;
  canal_id: number;
  canal_nombre?: string;
  curso_nombre: string | null;
  ciclo_nombre: string;
  docente_id: number | null;
  docente_nombres: string | null;
  docente_apellidos: string | null;
}

// ==========================================
// PAGOS (ENTIDADES Y DTOs)
// ==========================================
export interface IPago {
  id: number;
  matricula_id: number;
  concepto: string;
  tipo_pago: TipoPago;
  periodo: string | null;
  fecha_vencimiento: string | Date | null;
  codigo_pago: string | null;
  monto: number;
  monto_recibido: number | null;
  fecha: string | Date | null;
  metodo_pago: MetodoPago | null;
  estado: EstadoPago;
  referencia_operacion: string | null;
}

export interface CreatePagoDTO {
  codigo_pago: string;
  monto_recibido: number;
  metodo_pago: MetodoPago;
  referencia_operacion?: string;
}

export interface IPagoDetalle extends IPago {
  codigo_matricula: string;
  estudiante_id: number;
  estudiante_nombres: string;
  estudiante_apellidos: string;
  estudiante_dni: string;
  curso_nombre: string | null;
  grupo_nombre: string | null;
  canal_nombre: string;
  ciclo_nombre: string;
}

// ==========================================
// RESPUESTA ESTÁNDAR DE LA API
// ==========================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// ==========================================
// EXTENSIÓN DE EXPRESS REQUEST CON SESIÓN
// ==========================================
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}
