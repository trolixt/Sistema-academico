import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { asistenciaController } from '../controllers/asistencia.controller';

const router = Router();
router.use(authenticateToken);
router.get('/me', authorizeRoles('ESTUDIANTE'), asistenciaController.getMe);
router.get('/grupos/:grupoId/estudiantes', authorizeRoles('ADMINISTRADOR', 'DOCENTE'), asistenciaController.getStudentsByGroup);
router.get('/', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO', 'DOCENTE'), asistenciaController.getAll);
router.get('/sesiones/:id', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO', 'DOCENTE'), asistenciaController.getById);
router.post('/sesiones', authorizeRoles('ADMINISTRADOR', 'DOCENTE'), asistenciaController.openSession);
router.put('/sesiones/:id', authorizeRoles('ADMINISTRADOR', 'DOCENTE'), asistenciaController.saveDetails);
router.patch('/sesiones/:id/cerrar', authorizeRoles('ADMINISTRADOR', 'DOCENTE'), asistenciaController.closeSession);
export default router;
