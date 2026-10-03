import { Request, Response, NextFunction } from 'express';
import { estudianteService, EstudianteService } from '../services/estudiante.service';
import { AuthenticatedRequest, CreateEstudianteDTO, UpdateEstudianteDTO } from '../types';

export class EstudianteController {
  private service: EstudianteService;

  constructor(service: EstudianteService = estudianteService) {
    this.service = service;
  }

  getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json({ success: true, data: await this.service.getEstudianteById(req.user!.perfil_id!) });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/estudiantes
   * Lista todos los estudiantes
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const estudiantes = await this.service.getAllEstudiantes();
      res.status(200).json({ success: true, data: estudiantes });
    } catch (error) {
      next(error);
    }
  };

  getByDni = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const estudiante = await this.service.getEstudianteByDni(String(req.params.dni));
      const data = estudiante && (estudiante.estado !== 'ACTIVO' || estudiante.estado_usuario !== 'ACTIVO')
        ? { registro_inactivo: true }
        : estudiante;
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getByEitherId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      if (!/^\d{1,9}$/.test(id)) {
        res.status(400).json({ success: false, message: 'Ingresa un ID numérico válido' });
        return;
      }
      const estudiante = await this.service.getEstudianteByEitherId(id);
      res.status(200).json({ success: true, data: estudiante });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/estudiantes/:id
   * Obtiene un estudiante por ID
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const estudiante = await this.service.getEstudianteById(id);
      res.status(200).json({ success: true, data: estudiante });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/estudiantes
   * Registra un nuevo estudiante con su cuenta de usuario
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as CreateEstudianteDTO;
      const nuevoEstudiante = await this.service.createEstudiante(dto);
      res.status(201).json({
        success: true,
        message: 'Estudiante registrado exitosamente. Cuenta de acceso creada.',
        data: nuevoEstudiante
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/estudiantes/:id
   * Actualiza los datos de un estudiante
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const dto = req.body as UpdateEstudianteDTO;
      const actualizado = await this.service.updateEstudiante(id, dto);
      res.status(200).json({
        success: true,
        message: 'Datos del estudiante actualizados correctamente',
        data: actualizado
      });
    } catch (error) {
      next(error);
    }
  };

  reincorporate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await this.service.reincorporateEstudiante(Number(req.params.id), req.body as UpdateEstudianteDTO);
      res.status(200).json({ success: true, message: 'Estudiante reincorporado correctamente', data: updated });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/estudiantes/:id
   * Desactivación lógica del estudiante (baja)
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const result = await this.service.deleteEstudiante(id);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  };
}

export const estudianteController = new EstudianteController();
