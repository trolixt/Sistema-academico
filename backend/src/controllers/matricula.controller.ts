import { Request, Response, NextFunction } from 'express';
import { matriculaService, MatriculaService } from '../services/matricula.service';
import { AuthenticatedRequest, CreateMatriculaDTO, CambiarEstadoMatriculaDTO, EstadoMatricula } from '../types';

export class MatriculaController {
  private service: MatriculaService;

  constructor(service: MatriculaService = matriculaService) {
    this.service = service;
  }

  getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const matriculas = await this.service.getMatriculasByEstudiante(req.user!.perfil_id!);
      res.status(200).json({ success: true, data: matriculas });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/matriculas
   * Lista todas las matrículas. Filtros opcionales: ?estudiante_id=&grupo_id=&ciclo_id=&estado=
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filtros = {
        estudiante_id: req.query.estudiante_id ? Number(req.query.estudiante_id) : undefined,
        grupo_id: req.query.grupo_id ? Number(req.query.grupo_id) : undefined,
        ciclo_id: req.query.ciclo_id ? Number(req.query.ciclo_id) : undefined,
        estado: req.query.estado as EstadoMatricula | undefined
      };
      const matriculas = await this.service.getAllMatriculas(filtros);
      res.status(200).json({ success: true, data: matriculas });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/matriculas/:id
   * Detalle de una matrícula específica
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const matricula = await this.service.getMatriculaById(id);
      res.status(200).json({ success: true, data: matricula });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/matriculas/estudiante/:estudianteId
   * Lista todas las matrículas de un estudiante
   */
  getByEstudiante = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const estudianteId = Number(req.params.estudianteId);
      const matriculas = await this.service.getMatriculasByEstudiante(estudianteId);
      res.status(200).json({ success: true, data: matriculas });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/matriculas
   * Registra una nueva matrícula (con pago inicial opcional)
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as CreateMatriculaDTO;
      const nuevaMatricula = await this.service.createMatricula(dto);
      res.status(201).json({
        success: true,
        message: `Matrícula ${nuevaMatricula.codigo_matricula} registrada exitosamente`,
        data: nuevaMatricula
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/matriculas/:id/estado
   * Cambia el estado de una matrícula (ACTIVA → CANCELADA | RETIRADA)
   */
  cambiarEstado = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const dto = req.body as CambiarEstadoMatriculaDTO;
      const actualizada = await this.service.cambiarEstadoMatricula(id, dto);
      res.status(200).json({
        success: true,
        message: `Estado de matrícula actualizado a "${dto.estado}"`,
        data: actualizada
      });
    } catch (error) {
      next(error);
    }
  };
}

export const matriculaController = new MatriculaController();
