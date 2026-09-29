import { Router } from 'express';
import { estudianteController } from '../controllers/estudiante.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Consulta: Administrador, Administrativo
router.get('/', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO'), estudianteController.getAll);
router.get('/:id', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO'), estudianteController.getById);

// Gestión: Solo Administrador y Administrativo
router.post('/', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO'), estudianteController.create);
router.put('/:id', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO'), estudianteController.update);
router.delete('/:id', authorizeRoles('ADMINISTRADOR'), estudianteController.delete);

export default router;
