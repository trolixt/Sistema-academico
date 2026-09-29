import { Request, Response, NextFunction } from 'express';
import { evaluacionService, EvaluacionService } from '../services/evaluacion.service';
import { CreateEvaluacionDTO, UpdateEvaluacionDTO, RegistrarNotaDTO } from '../repositories/evaluacion.repository';
import { EstadoEvaluacion } from '../types';

export class EvaluacionController {
  private service: EvaluacionService;

  constructor(service: EvaluacionService = evaluacionService) {
    this.service = service;
  }

  /**
   * GET /api/evaluaciones
   * Filtros: ?grupo_id=&estado=
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filtros = {
        grupo_id: req.query.grupo_id ? Number(req.query.grupo_id) : undefined,
        estado: req.query.estado as EstadoEvaluacion | undefined
      };
      const evaluaciones = await this.service.getAllEvaluaciones(filtros);
      res.status(200).json({ success: true, data: evaluaciones });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/evaluaciones/:id
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const evaluacion = await this.service.getEvaluacionById(id);
      res.status(200).json({ success: true, data: evaluacion });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/evaluaciones/:id/notas
   * Notas de todos los estudiantes en una evaluación
   */
  getNotas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const notas = await this.service.getNotasByEvaluacion(id);
      res.status(200).json({ success: true, data: notas });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/evaluaciones
   * Crea una nueva evaluación en estado BORRADOR
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as CreateEvaluacionDTO;
      const nueva = await this.service.createEvaluacion(dto);
      res.status(201).json({
        success: true,
        message: 'Evaluación creada en estado BORRADOR',
        data: nueva
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/evaluaciones/:id
   * Actualiza nombre o fecha (solo si está en BORRADOR)
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const dto = req.body as UpdateEvaluacionDTO;
      const actualizada = await this.service.updateEvaluacion(id, dto);
      res.status(200).json({
        success: true,
        message: 'Evaluación actualizada correctamente',
        data: actualizada
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/evaluaciones/:id
   * Elimina una evaluación (solo si está en BORRADOR)
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const result = await this.service.deleteEvaluacion(id);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/evaluaciones/:id/publicar
   * Publica una evaluación (BORRADOR → PUBLICADA)
   */
  publicar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const publicada = await this.service.publicarEvaluacion(id);
      res.status(200).json({
        success: true,
        message: 'Evaluación publicada correctamente. Las notas son ahora visibles.',
        data: publicada
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/evaluaciones/:id/notas
   * Registra notas en bloque para una evaluación en BORRADOR
   */
  registrarNotas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const notas = req.body as RegistrarNotaDTO[];
      const result = await this.service.registrarNotasEnBloque(id, notas);
      res.status(200).json({ success: true, message: result.message, total: result.total });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/evaluaciones/:id/notas/:estudianteId
   * Elimina la nota de un estudiante en una evaluación BORRADOR
   */
  eliminarNota = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const evaluacionId = Number(req.params.id);
      const estudianteId = Number(req.params.estudianteId);
      const result = await this.service.eliminarNota(evaluacionId, estudianteId);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  };
}

export const evaluacionController = new EvaluacionController();
