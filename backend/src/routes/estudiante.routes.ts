import { Router } from 'express';
import { estudianteController } from '../controllers/estudiante.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Consulta: Administrador, Administrativo
router.get('/me', authorizeRoles('ESTUDIANTE'), estudianteController.getMe);
router.get('/', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO'), estudianteController.getAll);
router.get('/buscar-dni/:dni', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO'), estudianteController.getByDni);
router.get('/buscar-id/:id', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO'), estudianteController.getByEitherId);
router.put('/:id/reincorporar', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO'), estudianteController.reincorporate);
router.get('/:id', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO'), estudianteController.getById);

// Gestión: Solo Administrador y Administrativo
router.post('/', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO'), estudianteController.create);
router.put('/:id', authorizeRoles('ADMINISTRADOR'), estudianteController.update);
router.delete('/:id', authorizeRoles('ADMINISTRADOR'), estudianteController.delete);

export default router;
