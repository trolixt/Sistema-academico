import { Request, Response, NextFunction } from 'express';
import { authService, AuthService } from '../services/auth.service';
import { AuthenticatedRequest, LoginDTO } from '../types';

export class AuthController {
  private authService: AuthService;

  constructor(service: AuthService = authService) {
    this.authService = service;
  }

  /**
   * Endpoint de Inicio de Sesión
   * POST /api/auth/login
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { nombre_usuario, password } = req.body as LoginDTO;

      const result = await this.authService.login({
        nombre_usuario,
        password
      });

      res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Endpoint para obtener el perfil del usuario autenticado actual
   * GET /api/auth/me
   */
  me = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'No autenticado'
        });
        return;
      }

      const perfilUsuario = await this.authService.getPerfilActual(req.user.id);

      res.status(200).json({
        success: true,
        data: perfilUsuario
      });
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
