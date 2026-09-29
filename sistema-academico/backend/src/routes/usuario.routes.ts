import { Router } from 'express';
import { usuarioController } from '../controllers/usuario.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// El usuario autenticado cambia su propia contraseña (cualquier rol)
router.patch('/me/cambiar-password', usuarioController.cambiarPassword);

// Consulta por ID: Solo Administrador
router.get('/:id', authorizeRoles('ADMINISTRADOR'), usuarioController.getById);

// Reset de contraseña por el administrador
router.patch('/:id/reset-password', authorizeRoles('ADMINISTRADOR'), usuarioController.resetPassword);

export default router;
