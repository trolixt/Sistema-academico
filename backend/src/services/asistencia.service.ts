import { asistenciaRepository, AsistenciaFiltro, DetalleAsistenciaInput } from '../repositories/asistencia.repository';
import { EstadoAsistencia } from '../types';

export class AsistenciaService {
  async getSessions(filters: AsistenciaFiltro = {}) { return asistenciaRepository.findSessions(filters); }
  async getStudentAttendance(estudianteId: number) { return asistenciaRepository.findByStudent(estudianteId); }

  async getEnrolledStudents(grupoId: number, docenteId?: number) {
    const group = await asistenciaRepository.findGroup(grupoId, docenteId);
    if (!group) { const error: any = new Error(docenteId ? 'El grupo no existe o no está asignado a este docente' : 'Grupo no encontrado'); error.statusCode = docenteId ? 403 : 404; throw error; }
    return asistenciaRepository.findEnrolledStudents(grupoId);
  }

  async getSession(id: number, docenteId?: number): Promise<any> {
    const session = await asistenciaRepository.findById(id);
    if (!session) { const error: any = new Error('Sesión de asistencia no encontrada'); error.statusCode = 404; throw error; }
    if (docenteId && Number(session.docente_id) !== docenteId) { const error: any = new Error('La sesión no pertenece a un grupo asignado a este docente'); error.statusCode = 403; throw error; }
    return { ...session, detalles: await asistenciaRepository.findDetails(id) };
  }

  async openSession(grupoId: number, fecha: string, docenteId?: number) {
    if (!Number.isInteger(grupoId) || grupoId <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      const error: any = new Error('Se requiere un grupo y una fecha válida (YYYY-MM-DD)'); error.statusCode = 400; throw error;
    }
    const group = await asistenciaRepository.findGroup(grupoId, docenteId);
    if (!group) { const error: any = new Error(docenteId ? 'El grupo no existe o no está asignado a este docente' : 'Grupo no encontrado'); error.statusCode = docenteId ? 403 : 404; throw error; }
    const id = await asistenciaRepository.openSession(grupoId, fecha);
    return this.getSession(id, docenteId);
  }

  async saveDetails(id: number, details: DetalleAsistenciaInput[], docenteId?: number) {
    const session = await this.getSession(id, docenteId);
    if (session.estado !== 'ABIERTA') { const error: any = new Error('La sesión está cerrada y no admite cambios'); error.statusCode = 400; throw error; }
    if (docenteId && Number(session.docente_id) !== docenteId) { const error: any = new Error('La sesión no pertenece a un grupo asignado a este docente'); error.statusCode = 403; throw error; }
    if (!Array.isArray(details) || details.length === 0) { const error: any = new Error('Se requiere al menos un registro de asistencia'); error.statusCode = 400; throw error; }
    const valid = new Set<EstadoAsistencia>(['PRESENTE', 'AUSENTE', 'TARDANZA']);
    if (details.some((detail) => !Number.isInteger(detail.estudiante_id) || !valid.has(detail.estado_asistencia))) {
      const error: any = new Error('Los detalles de asistencia contienen datos inválidos'); error.statusCode = 400; throw error;
    }
    await asistenciaRepository.saveDetails(id, details);
    return this.getSession(id, docenteId);
  }

  async closeSession(id: number, docenteId?: number) {
    const session = await this.getSession(id, docenteId);
    if (docenteId && Number(session.docente_id) !== docenteId) { const error: any = new Error('La sesión no pertenece a un grupo asignado a este docente'); error.statusCode = 403; throw error; }
    if (session.estado === 'CERRADA') { const error: any = new Error('La sesión ya está cerrada'); error.statusCode = 400; throw error; }
    await asistenciaRepository.closeSession(id);
    return this.getSession(id, docenteId);
  }
}
export const asistenciaService = new AsistenciaService();
