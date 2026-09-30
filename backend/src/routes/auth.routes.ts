import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Rutas públicas
router.post('/login', authController.login);

// Rutas protegidas
router.get('/me', authenticateToken, authController.me);

export default router;
