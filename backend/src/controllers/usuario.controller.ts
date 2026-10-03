import { Request, Response, NextFunction } from 'express';
import { usuarioService, UsuarioService } from '../services/usuario.service';
import { AuthenticatedRequest } from '../types';

export class UsuarioController {
  private service: UsuarioService;

  constructor(service: UsuarioService = usuarioService) {
    this.service = service;
  }

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const role = typeof req.query.rol === 'string' ? req.query.rol as any : undefined;
      res.status(200).json({ success: true, data: await this.service.getAllSafe(role) });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/usuarios/:id
   * Obtiene datos de un usuario (sin password_hash)
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const usuario = await this.service.getUsuarioById(id);
      res.status(200).json({ success: true, data: usuario });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/usuarios/me/cambiar-password
   * El usuario autenticado cambia su propia contraseña
   */
  cambiarPassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usuarioId = req.user!.id;
      const { password_actual, password_nueva } = req.body;

      if (!password_actual || !password_nueva) {
        res.status(400).json({
          success: false,
          message: 'Se requieren los campos "password_actual" y "password_nueva"'
        });
        return;
      }

      const result = await this.service.cambiarPassword(usuarioId, password_actual, password_nueva);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/usuarios/:id/reset-password
   * El administrador restablece la contraseña de cualquier usuario
   */
  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usuarioId = Number(req.params.id);
      const { nueva_password } = req.body;

      if (!nueva_password) {
        res.status(400).json({
          success: false,
          message: 'Se requiere el campo "nueva_password"'
        });
        return;
      }

      const result = await this.service.resetPassword(usuarioId, nueva_password);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  };

  createSecretaria = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.createSecretaria(req.body);
      res.status(201).json({ success: true, message: 'Cuenta de secretaría creada', data });
    } catch (error) { next(error); }
  };

  updateSecretaria = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.updateSecretaria(Number(req.params.id), req.body);
      res.status(200).json({ success: true, message: 'Datos de secretaría actualizados', data });
    } catch (error) { next(error); }
  };

  updateEstado = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.updateEstado(Number(req.params.id), req.body.estado);
      res.status(200).json({ success: true, message: 'Estado de la cuenta actualizado', data });
    } catch (error) { next(error); }
  };
}

export const usuarioController = new UsuarioController();
