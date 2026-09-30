import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { asistenciaService } from '../services/asistencia.service';

export class AsistenciaController {
  getStudentsByGroup = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const docenteId = req.user?.rol === 'DOCENTE' ? req.user.perfil_id : undefined;
      res.status(200).json({ success: true, data: await asistenciaService.getEnrolledStudents(Number(req.params.grupoId), docenteId) });
    } catch (error) { next(error); }
  };

  getAll = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const grupoId = req.query.grupo_id ? Number(req.query.grupo_id) : undefined;
      const docenteId = req.user?.rol === 'DOCENTE' ? req.user.perfil_id : undefined;
      res.status(200).json({ success: true, data: await asistenciaService.getSessions({ grupo_id: grupoId, docente_id: docenteId }) });
    } catch (error) { next(error); }
  };

  getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try { res.status(200).json({ success: true, data: await asistenciaService.getStudentAttendance(req.user!.perfil_id!) }); }
    catch (error) { next(error); }
  };

  getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const docenteId = req.user?.rol === 'DOCENTE' ? req.user.perfil_id : undefined;
      res.status(200).json({ success: true, data: await asistenciaService.getSession(Number(req.params.id), docenteId) });
    }
    catch (error) { next(error); }
  };

  openSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const docenteId = req.user?.rol === 'DOCENTE' ? req.user.perfil_id : undefined;
      const session = await asistenciaService.openSession(Number(req.body.grupo_id), String(req.body.fecha || ''), docenteId);
      res.status(201).json({ success: true, data: session });
    } catch (error) { next(error); }
  };

  saveDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const docenteId = req.user?.rol === 'DOCENTE' ? req.user.perfil_id : undefined;
      const session = await asistenciaService.saveDetails(Number(req.params.id), req.body.detalles, docenteId);
      res.status(200).json({ success: true, data: session });
    } catch (error) { next(error); }
  };

  closeSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const docenteId = req.user?.rol === 'DOCENTE' ? req.user.perfil_id : undefined;
      const session = await asistenciaService.closeSession(Number(req.params.id), docenteId);
      res.status(200).json({ success: true, data: session });
    } catch (error) { next(error); }
  };
}
export const asistenciaController = new AsistenciaController();
