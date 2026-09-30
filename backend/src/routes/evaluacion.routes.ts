import { Router } from 'express';
import { evaluacionController } from '../controllers/evaluacion.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Consulta: Administrador, Administrativo, Docente
router.get('/me/notas', authorizeRoles('ESTUDIANTE'), evaluacionController.getNotasMe);
router.get('/', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO', 'DOCENTE'), evaluacionController.getAll);
router.get('/:id', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO', 'DOCENTE'), evaluacionController.getById);
router.get('/:id/notas', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO', 'DOCENTE'), evaluacionController.getNotas);

// Creación y gestión: Administrador y Docente
router.post('/', authorizeRoles('ADMINISTRADOR', 'DOCENTE'), evaluacionController.create);
router.put('/:id', authorizeRoles('ADMINISTRADOR', 'DOCENTE'), evaluacionController.update);
router.delete('/:id', authorizeRoles('ADMINISTRADOR', 'DOCENTE'), evaluacionController.delete);

// Publicación: Administrador y Docente
router.patch('/:id/publicar', authorizeRoles('ADMINISTRADOR', 'DOCENTE'), evaluacionController.publicar);

// Registro y eliminación de notas: Administrador y Docente
router.post('/:id/notas', authorizeRoles('ADMINISTRADOR', 'DOCENTE'), evaluacionController.registrarNotas);
router.delete('/:id/notas/:estudianteId', authorizeRoles('ADMINISTRADOR', 'DOCENTE'), evaluacionController.eliminarNota);

export default router;
