import { Router } from 'express';
import { matriculaController } from '../controllers/matricula.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Consultas: Administrador, Administrativo
router.get('/me', authorizeRoles('ESTUDIANTE'), matriculaController.getMe);
router.get('/', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO'), matriculaController.getAll);
router.get('/estudiante/:estudianteId', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO'), matriculaController.getByEstudiante);
router.get('/:id', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO'), matriculaController.getById);

// Registro de nueva matrícula: Administrador y Administrativo
router.post('/', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO'), matriculaController.create);

// Cambio de estado (cancelar/retirar): Administrador y Administrativo
router.patch('/:id/estado', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO'), matriculaController.cambiarEstado);

export default router;
