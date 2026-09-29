import {
  evaluacionRepository, EvaluacionRepository,
  IEvaluacionDetalle, IDetalleNota,
  CreateEvaluacionDTO, UpdateEvaluacionDTO, RegistrarNotaDTO
} from '../repositories/evaluacion.repository';
import { academicoRepository, AcademicoRepository } from '../repositories/academico.repository';
import { matriculaRepository, MatriculaRepository } from '../repositories/matricula.repository';
import { EstadoEvaluacion } from '../types';

export class EvaluacionService {
  private repo: EvaluacionRepository;
  private academicoRepo: AcademicoRepository;
  private matriculaRepo: MatriculaRepository;

  constructor(
    repo: EvaluacionRepository = evaluacionRepository,
    academicoRepo: AcademicoRepository = academicoRepository,
    matriculaRepo: MatriculaRepository = matriculaRepository
  ) {
    this.repo = repo;
    this.academicoRepo = academicoRepo;
    this.matriculaRepo = matriculaRepo;
  }

  // ==========================================
  // CONSULTAS
  // ==========================================

  async getAllEvaluaciones(filtros?: { grupo_id?: number; estado?: EstadoEvaluacion }): Promise<IEvaluacionDetalle[]> {
    return await this.repo.findAll(filtros);
  }

  async getEvaluacionById(id: number): Promise<IEvaluacionDetalle> {
    const evaluacion = await this.repo.findById(id);
    if (!evaluacion) {
      const error: any = new Error(`Evaluación con ID ${id} no encontrada`);
      error.statusCode = 404;
      throw error;
    }
    return evaluacion;
  }

  async getNotasByEvaluacion(evaluacionId: number): Promise<IDetalleNota[]> {
    await this.getEvaluacionById(evaluacionId);
    return await this.repo.findNotasByEvaluacion(evaluacionId);
  }

  // ==========================================
  // GESTIÓN DE EVALUACIONES
  // ==========================================

  async createEvaluacion(dto: CreateEvaluacionDTO): Promise<IEvaluacionDetalle> {
    if (!dto.grupo_id) {
      const error: any = new Error('El grupo_id es obligatorio');
      error.statusCode = 400;
      throw error;
    }
    if (!dto.nombre_evaluacion?.trim()) {
      const error: any = new Error('El nombre de la evaluación es obligatorio');
      error.statusCode = 400;
      throw error;
    }
    if (!dto.fecha) {
      const error: any = new Error('La fecha de la evaluación es obligatoria');
      error.statusCode = 400;
      throw error;
    }

    // Verificar que el grupo exista y esté activo
    const grupo = await this.academicoRepo.findGrupoById(dto.grupo_id);
    if (!grupo) {
      const error: any = new Error(`El grupo con ID ${dto.grupo_id} no existe`);
      error.statusCode = 404;
      throw error;
    }
    if (grupo.estado !== 'ACTIVO') {
      const error: any = new Error('No se pueden crear evaluaciones para un grupo inactivo');
      error.statusCode = 400;
      throw error;
    }

    const nuevoId = await this.repo.create(dto);
    return (await this.repo.findById(nuevoId))!;
  }

  async updateEvaluacion(id: number, dto: UpdateEvaluacionDTO): Promise<IEvaluacionDetalle> {
    const evaluacion = await this.getEvaluacionById(id);

    // Si está PUBLICADA, no se puede modificar el nombre ni la fecha
    if (evaluacion.estado === 'PUBLICADA' && (dto.nombre_evaluacion || dto.fecha)) {
      const error: any = new Error('No se puede modificar el nombre o la fecha de una evaluación ya publicada');
      error.statusCode = 400;
      throw error;
    }

    await this.repo.update(id, dto);
    return (await this.repo.findById(id))!;
  }

  async deleteEvaluacion(id: number): Promise<{ message: string }> {
    const evaluacion = await this.getEvaluacionById(id);

    if (evaluacion.estado === 'PUBLICADA') {
      const error: any = new Error('No se puede eliminar una evaluación publicada');
      error.statusCode = 400;
      throw error;
    }

    await this.repo.delete(id);
    return { message: `Evaluación "${evaluacion.nombre_evaluacion}" eliminada correctamente` };
  }

  async publicarEvaluacion(id: number): Promise<IEvaluacionDetalle> {
    const evaluacion = await this.getEvaluacionById(id);

    if (evaluacion.estado === 'PUBLICADA') {
      const error: any = new Error('La evaluación ya se encuentra publicada');
      error.statusCode = 400;
      throw error;
    }

    await this.repo.update(id, { estado: 'PUBLICADA' });
    return (await this.repo.findById(id))!;
  }

  // ==========================================
  // GESTIÓN DE NOTAS
  // ==========================================

  async registrarNotasEnBloque(evaluacionId: number, notas: RegistrarNotaDTO[]): Promise<{ message: string; total: number }> {
    const evaluacion = await this.getEvaluacionById(evaluacionId);

    if (evaluacion.estado === 'PUBLICADA') {
      const error: any = new Error('No se pueden modificar notas de una evaluación ya publicada');
      error.statusCode = 400;
      throw error;
    }

    if (!Array.isArray(notas) || notas.length === 0) {
      const error: any = new Error('Se debe proporcionar al menos una nota');
      error.statusCode = 400;
      throw error;
    }

    // Validar que cada nota esté en rango 0-20
    for (const nota of notas) {
      if (nota.valor_nota < 0 || nota.valor_nota > 20) {
        const error: any = new Error(`La nota del estudiante ID ${nota.estudiante_id} debe estar entre 0 y 20`);
        error.statusCode = 400;
        throw error;
      }
    }

    await this.repo.registrarNotasEnBloque(evaluacionId, notas);
    return {
      message: `${notas.length} nota(s) registrada(s) correctamente`,
      total: notas.length
    };
  }

  async eliminarNota(evaluacionId: number, estudianteId: number): Promise<{ message: string }> {
    const evaluacion = await this.getEvaluacionById(evaluacionId);

    if (evaluacion.estado === 'PUBLICADA') {
      const error: any = new Error('No se pueden eliminar notas de una evaluación publicada');
      error.statusCode = 400;
      throw error;
    }

    const eliminada = await this.repo.deleteNota(evaluacionId, estudianteId);
    if (!eliminada) {
      const error: any = new Error(`No se encontró nota para el estudiante ID ${estudianteId} en esta evaluación`);
      error.statusCode = 404;
      throw error;
    }

    return { message: 'Nota eliminada correctamente' };
  }
}

export const evaluacionService = new EvaluacionService();
