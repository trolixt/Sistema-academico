import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JWTPayload, RolUsuario } from '../types';

/**
 * Middleware para validar el JWT en los headers de autorización
 */
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Token de autenticación no proporcionado'
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET || 'sistema_academia_secret_key_2026';

  try {
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Token inválido o expirado'
    });
    return;
  }
};

/**
 * Middleware para autorizar según uno o más roles permitidos
 */
export const authorizeRoles = (...rolesPermitidos: RolUsuario[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
      return;
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      res.status(403).json({
        success: false,
        message: 'No cuenta con los permisos necesarios para realizar esta acción'
      });
      return;
    }

    next();
  };
};
