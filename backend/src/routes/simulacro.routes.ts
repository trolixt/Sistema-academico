import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { simulacroController } from '../controllers/simulacro.controller';

const router = Router();
router.use(authenticateToken);
router.get('/me', authorizeRoles('ESTUDIANTE'), simulacroController.getMe);
router.use(authorizeRoles('ADMINISTRADOR'));
router.get('/estudiantes/:estudianteId', simulacroController.getByStudent);
router.post('/canales/:canalId', simulacroController.createExam);
router.put('/:simulacroId/estudiantes/:estudianteId', simulacroController.saveResult);
export default router;
