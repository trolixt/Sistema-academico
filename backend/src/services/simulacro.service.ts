import { simulacroRepository, SimulacroRepository } from '../repositories/simulacro.repository';

export class SimulacroService {
  constructor(private repo: SimulacroRepository = simulacroRepository) {}

  async getByStudent(studentId: number) { return this.repo.findByStudent(studentId); }

  async createExam(channelId: number, body: { nombre?: string; fecha?: string; puntaje_maximo?: number }) {
    const max = body.puntaje_maximo === undefined ? 600 : Number(body.puntaje_maximo);
    if (!Number.isInteger(channelId) || channelId < 1 || channelId > 4) throw this.error('Canal inválido', 400);
    if (!body.nombre?.trim() || !body.fecha || !/^\d{4}-\d{2}-\d{2}$/.test(body.fecha)) throw this.error('Ingresa el nombre y una fecha válida para el simulacro', 400);
    if (!Number.isInteger(max) || max < 1 || max > 600) throw this.error('El puntaje máximo debe estar entre 1 y 600', 400);
    const id = await this.repo.create(channelId, { nombre: body.nombre, fecha: body.fecha, puntaje_maximo: max });
    return this.repo.findExam(id);
  }

  async saveResult(examId: number, studentId: number, body: { puntaje?: number; observacion?: string }) {
    const exam = await this.repo.findExam(examId);
    if (!exam) throw this.error('Simulacro no encontrado', 404);
    const score = Number(body.puntaje);
    if (!Number.isFinite(score) || score < 0 || score > Number(exam.puntaje_maximo)) throw this.error(`El puntaje debe estar entre 0 y ${exam.puntaje_maximo}`, 400);
    if (!await this.repo.isStudentInChannel(studentId, Number(exam.canal_id))) throw this.error('El estudiante no está matriculado en este canal', 400);
    return this.repo.saveResult(examId, studentId, score, body.observacion);
  }

  private error(message: string, statusCode: number) { return Object.assign(new Error(message), { statusCode }); }
}

export const simulacroService = new SimulacroService();
