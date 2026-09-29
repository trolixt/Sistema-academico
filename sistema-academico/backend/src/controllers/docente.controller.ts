import { Request, Response, NextFunction } from 'express';
import { docenteService, DocenteService } from '../services/docente.service';
import { CreateDocenteDTO, UpdateDocenteDTO } from '../repositories/docente.repository';

export class DocenteController {
  private service: DocenteService;

  constructor(service: DocenteService = docenteService) {
    this.service = service;
  }

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const docentes = await this.service.getAllDocentes();
      res.status(200).json({ success: true, data: docentes });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const docente = await this.service.getDocenteById(id);
      res.status(200).json({ success: true, data: docente });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as CreateDocenteDTO;
      const nuevoDocente = await this.service.createDocente(dto);
      res.status(201).json({
        success: true,
        message: 'Docente registrado exitosamente. Cuenta de acceso creada.',
        data: nuevoDocente
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const dto = req.body as UpdateDocenteDTO;
      const actualizado = await this.service.updateDocente(id, dto);
      res.status(200).json({
        success: true,
        message: 'Datos del docente actualizados correctamente',
        data: actualizado
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const result = await this.service.deleteDocente(id);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  };
}

export const docenteController = new DocenteController();
