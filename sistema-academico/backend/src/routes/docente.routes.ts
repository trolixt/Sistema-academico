import { Router } from 'express';
import { docenteController } from '../controllers/docente.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Consulta: Administrador, Administrativo (y docentes para saber quiénes son sus colegas)
router.get('/', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO', 'DOCENTE'), docenteController.getAll);
router.get('/:id', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO', 'DOCENTE'), docenteController.getById);

// Gestión: Solo Administrador
router.post('/', authorizeRoles('ADMINISTRADOR'), docenteController.create);
router.put('/:id', authorizeRoles('ADMINISTRADOR'), docenteController.update);
router.delete('/:id', authorizeRoles('ADMINISTRADOR'), docenteController.delete);

export default router;
