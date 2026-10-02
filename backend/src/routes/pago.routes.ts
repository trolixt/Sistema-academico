import { Router } from 'express';
import { pagoController } from '../controllers/pago.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Consulta: Administrador, Administrativo
router.get('/me', authorizeRoles('ESTUDIANTE'), pagoController.getMe);
router.get('/', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO'), pagoController.getAll);
router.get('/matricula/:matriculaId', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO'), pagoController.getByMatricula);
router.get('/codigo/:codigo', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO'), pagoController.getByCodigo);
router.get('/:id', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO'), pagoController.getById);

// Registro de pago: Administrador y Administrativo
router.post('/', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO'), pagoController.create);
// Anulación: Solo Administrador
router.patch('/:id/anular', authorizeRoles('ADMINISTRADOR'), pagoController.anular);

export default router;
