import { Request, Response, NextFunction } from 'express';
import { academicoService, AcademicoService } from '../services/academico.service';
import { AuthenticatedRequest, CreateCursoDTO, UpdateCursoDTO, CreateCicloDTO, UpdateCicloDTO, CreateGrupoDTO, UpdateGrupoDTO, CreateHorarioDTO, UpdateHorarioDTO } from '../types';

export class AcademicoController {
  private service: AcademicoService;

  constructor(service: AcademicoService = academicoService) {
    this.service = service;
  }

  // ==========================================
  // 1. ENDPOINTS DE CURSOS
  // ==========================================

  getCursos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const soloActivos = req.query.activos === 'true';
      const cursos = await this.service.getCursos(soloActivos);
      res.status(200).json({
        success: true,
        data: cursos
      });
    } catch (error) {
      next(error);
    }
  };

  getCursoById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const curso = await this.service.getCursoById(id);
      res.status(200).json({
        success: true,
        data: curso
      });
    } catch (error) {
      next(error);
    }
  };

  createCurso = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as CreateCursoDTO;
      const nuevoCurso = await this.service.createCurso(dto);
      res.status(201).json({
        success: true,
        message: 'Curso creado exitosamente',
        data: nuevoCurso
      });
    } catch (error) {
      next(error);
    }
  };

  updateCurso = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const dto = req.body as UpdateCursoDTO;
      const cursoActualizado = await this.service.updateCurso(id, dto);
      res.status(200).json({
        success: true,
        message: 'Curso actualizado exitosamente',
        data: cursoActualizado
      });
    } catch (error) {
      next(error);
    }
  };

  deleteCurso = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const result = await this.service.deleteCurso(id);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // 2. ENDPOINTS DE CICLOS ACADÉMICOS
  // ==========================================

  getCiclos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const soloActivos = req.query.activos === 'true';
      const ciclos = await this.service.getCiclos(soloActivos);
      res.status(200).json({
        success: true,
        data: ciclos
      });
    } catch (error) {
      next(error);
    }
  };

  getCicloById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const ciclo = await this.service.getCicloById(id);
      res.status(200).json({
        success: true,
        data: ciclo
      });
    } catch (error) {
      next(error);
    }
  };

  createCiclo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as CreateCicloDTO;
      const nuevoCiclo = await this.service.createCiclo(dto);
      res.status(201).json({
        success: true,
        message: 'Ciclo académico creado exitosamente',
        data: nuevoCiclo
      });
    } catch (error) {
      next(error);
    }
  };

  updateCiclo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const dto = req.body as UpdateCicloDTO;
      const cicloActualizado = await this.service.updateCiclo(id, dto);
      res.status(200).json({
        success: true,
        message: 'Ciclo académico actualizado exitosamente',
        data: cicloActualizado
      });
    } catch (error) {
      next(error);
    }
  };

  deleteCiclo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const result = await this.service.deleteCiclo(id);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // 3. ENDPOINTS DE GRUPOS
  // ==========================================

  getGrupos = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ciclo_id = req.query.ciclo_id ? Number(req.query.ciclo_id) : undefined;
      const curso_id = req.query.curso_id ? Number(req.query.curso_id) : undefined;
      const canal_id = req.query.canal_id ? Number(req.query.canal_id) : undefined;
      const docente_id = req.user?.rol === 'DOCENTE' ? req.user.perfil_id : (req.query.docente_id ? Number(req.query.docente_id) : undefined);
      const soloActivos = req.query.activos === 'true';

      const grupos = await this.service.getGrupos({
        ciclo_id,
        curso_id,
        canal_id,
        docente_id,
        soloActivos
      });

      res.status(200).json({
        success: true,
        data: grupos
      });
    } catch (error) {
      next(error);
    }
  };

  getGruposMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = req.user?.rol === 'DOCENTE'
        ? { docente_id: req.user.perfil_id }
        : { estudiante_id: req.user!.perfil_id };
      res.status(200).json({ success: true, data: await this.service.getGrupos(filters) });
    } catch (error) { next(error); }
  };

  getGrupoById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const grupo = await this.service.getGrupoById(id);
      res.status(200).json({
        success: true,
        data: grupo
      });
    } catch (error) {
      next(error);
    }
  };

  createGrupo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as CreateGrupoDTO;
      const nuevoGrupo = await this.service.createGrupo(dto);
      res.status(201).json({
        success: true,
        message: 'Grupo aperturado exitosamente con control de capacidad',
        data: nuevoGrupo
      });
    } catch (error) {
      next(error);
    }
  };

  updateGrupo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const dto = req.body as UpdateGrupoDTO;
      const grupoActualizado = await this.service.updateGrupo(id, dto);
      res.status(200).json({
        success: true,
        message: 'Grupo actualizado exitosamente',
        data: grupoActualizado
      });
    } catch (error) {
      next(error);
    }
  };

  deleteGrupo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const result = await this.service.deleteGrupo(id);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // 4. ENDPOINTS DE HORARIOS
  // ==========================================

  getHorariosByGrupo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const grupoId = Number(req.params.grupoId);
      const horarios = await this.service.getHorariosByGrupo(grupoId);
      res.status(200).json({
        success: true,
        data: horarios
      });
    } catch (error) {
      next(error);
    }
  };

  createHorario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as CreateHorarioDTO;
      const nuevoHorario = await this.service.createHorario(dto);
      res.status(201).json({
        success: true,
        message: 'Horario asignado correctamente sin colisiones de docente ni aula',
        data: nuevoHorario
      });
    } catch (error) {
      next(error);
    }
  };

  updateHorario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const dto = req.body as UpdateHorarioDTO;
      const horario = await this.service.updateHorario(id, dto);
      res.status(200).json({ success: true, message: 'Horario actualizado correctamente', data: horario });
    } catch (error) {
      next(error);
    }
  };

  deleteHorario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const result = await this.service.deleteHorario(id);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  };
}

export const academicoController = new AcademicoController();
