import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { simulacroService } from '../services/simulacro.service';

export class SimulacroController {
  getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try { res.json({ success: true, data: await simulacroService.getByStudent(req.user!.perfil_id!) }); } catch (error) { next(error); }
  };
  getByStudent = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json({ success: true, data: await simulacroService.getByStudent(Number(req.params.estudianteId)) }); } catch (error) { next(error); }
  };
  createExam = async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json({ success: true, data: await simulacroService.createExam(Number(req.params.canalId), req.body) }); } catch (error) { next(error); }
  };
  saveResult = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json({ success: true, data: await simulacroService.saveResult(Number(req.params.simulacroId), Number(req.params.estudianteId), req.body) }); } catch (error) { next(error); }
  };
}

export const simulacroController = new SimulacroController();
