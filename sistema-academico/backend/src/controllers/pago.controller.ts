import { Request, Response, NextFunction } from 'express';
import { pagoService, PagoService } from '../services/pago.service';
import { CreatePagoDTO, EstadoPago } from '../types';

export class PagoController {
  private service: PagoService;

  constructor(service: PagoService = pagoService) {
    this.service = service;
  }

  /**
   * GET /api/pagos
   * Lista pagos. Filtros: ?matricula_id=&estado=
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filtros = {
        matricula_id: req.query.matricula_id ? Number(req.query.matricula_id) : undefined,
        estado: req.query.estado as EstadoPago | undefined
      };
      const pagos = await this.service.getAllPagos(filtros);
      res.status(200).json({ success: true, data: pagos });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/pagos/:id
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const pago = await this.service.getPagoById(id);
      res.status(200).json({ success: true, data: pago });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/pagos/matricula/:matriculaId
   * Todos los pagos de una matrícula
   */
  getByMatricula = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const matriculaId = Number(req.params.matriculaId);
      const pagos = await this.service.getPagosByMatricula(matriculaId);
      res.status(200).json({ success: true, data: pagos });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/pagos
   * Registra un nuevo pago para una matrícula activa
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as CreatePagoDTO;
      const nuevoPago = await this.service.createPago(dto);
      res.status(201).json({
        success: true,
        message: 'Pago registrado correctamente',
        data: nuevoPago
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/pagos/:id/anular
   * Anula un pago existente
   */
  anular = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const pago = await this.service.anularPago(id);
      res.status(200).json({
        success: true,
        message: 'Pago anulado correctamente',
        data: pago
      });
    } catch (error) {
      next(error);
    }
  };
}

export const pagoController = new PagoController();
