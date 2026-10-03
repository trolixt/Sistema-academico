import { Request, Response, NextFunction } from 'express';
import { canalService } from '../services/canal.service';

export class CanalController {
  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json({ success: true, data: await canalService.getCanales() }); } catch (error) { next(error); }
  };
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json({ success: true, data: await canalService.getCanal(Number(req.params.id)) }); } catch (error) { next(error); }
  };
  getAreas = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json({ success: true, data: await canalService.getAreas(Number(req.params.id)) }); } catch (error) { next(error); }
  };
  getStudents = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json({ success: true, data: await canalService.getEstudiantes(Number(req.params.id)) }); } catch (error) { next(error); }
  };
  update = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json({ success: true, message: 'Canal actualizado', data: await canalService.updateCanal(Number(req.params.id), req.body) }); } catch (error) { next(error); }
  };
  replaceAreas = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json({ success: true, message: 'Áreas del canal actualizadas', data: await canalService.replaceAreas(Number(req.params.id), req.body.curso_ids) }); } catch (error) { next(error); }
  };
}

export const canalController = new CanalController();
