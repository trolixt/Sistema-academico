import { Router } from 'express';
import { usuarioController } from '../controllers/usuario.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// El usuario autenticado cambia su propia contraseña (cualquier rol)
router.patch('/me/cambiar-password', usuarioController.cambiarPassword);

// Consulta administrativa de cuentas sin hashes de contraseña.
router.get('/', authorizeRoles('ADMINISTRADOR'), usuarioController.getAll);
router.post('/secretaria', authorizeRoles('ADMINISTRADOR'), usuarioController.createSecretaria);
router.put('/:id/secretaria', authorizeRoles('ADMINISTRADOR'), usuarioController.updateSecretaria);
router.patch('/:id/estado', authorizeRoles('ADMINISTRADOR'), usuarioController.updateEstado);

// Consulta por ID: Solo Administrador
router.get('/:id', authorizeRoles('ADMINISTRADOR'), usuarioController.getById);

// Reset de contraseña por el administrador
router.patch('/:id/reset-password', authorizeRoles('ADMINISTRADOR'), usuarioController.resetPassword);

export default router;
