import { Router } from 'express';
import { academicoController } from '../controllers/academico.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// ==========================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ==========================================
router.use(authenticateToken);

// ==========================================
// 1. RUTAS DE CURSOS
// ==========================================
// Consulta: Administrador, Administrativo, Docente, Estudiante
router.get('/cursos', academicoController.getCursos);
router.get('/cursos/:id', academicoController.getCursoById);

// Gestión: Solo Administrador
router.post('/cursos', authorizeRoles('ADMINISTRADOR'), academicoController.createCurso);
router.put('/cursos/:id', authorizeRoles('ADMINISTRADOR'), academicoController.updateCurso);
router.delete('/cursos/:id', authorizeRoles('ADMINISTRADOR'), academicoController.deleteCurso);

// ==========================================
// 2. RUTAS DE CICLOS ACADÉMICOS
// ==========================================
// Consulta: Administrador, Administrativo, Docente, Estudiante
router.get('/ciclos', academicoController.getCiclos);
router.get('/ciclos/:id', academicoController.getCicloById);

// Gestión: Solo Administrador
router.post('/ciclos', authorizeRoles('ADMINISTRADOR'), academicoController.createCiclo);
router.put('/ciclos/:id', authorizeRoles('ADMINISTRADOR'), academicoController.updateCiclo);
router.delete('/ciclos/:id', authorizeRoles('ADMINISTRADOR'), academicoController.deleteCiclo);

// ==========================================
// 3. RUTAS DE GRUPOS
// ==========================================
// Consulta: Administrador, Administrativo, Docente, Estudiante (con soporte de filtros ?ciclo_id=&curso_id=)
router.get('/grupos/me', authorizeRoles('DOCENTE', 'ESTUDIANTE'), academicoController.getGruposMe);
router.get('/grupos', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO', 'DOCENTE'), academicoController.getGrupos);
router.get('/grupos/:id', authorizeRoles('ADMINISTRADOR', 'ADMINISTRATIVO', 'DOCENTE'), academicoController.getGrupoById);

// Gestión: Solo Administrador
router.post('/grupos', authorizeRoles('ADMINISTRADOR'), academicoController.createGrupo);
router.put('/grupos/:id', authorizeRoles('ADMINISTRADOR'), academicoController.updateGrupo);
router.delete('/grupos/:id', authorizeRoles('ADMINISTRADOR'), academicoController.deleteGrupo);

// ==========================================
// 4. RUTAS DE HORARIOS
// ==========================================
// Consulta de horarios por grupo
router.get('/grupos/:grupoId/horarios', academicoController.getHorariosByGrupo);

// Gestión: Solo Administrador
router.post('/horarios', authorizeRoles('ADMINISTRADOR'), academicoController.createHorario);
router.delete('/horarios/:id', authorizeRoles('ADMINISTRADOR'), academicoController.deleteHorario);

export default router;
