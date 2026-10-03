import { academicoRepository, AcademicoRepository } from '../repositories/academico.repository';
import { docenteRepository, DocenteRepository } from '../repositories/docente.repository';
import {
  ICurso,
  CreateCursoDTO,
  UpdateCursoDTO,
  ICicloAcademico,
  CreateCicloDTO,
  UpdateCicloDTO,
  CreateGrupoDTO,
  UpdateGrupoDTO,
  IGrupoDetalle,
  FiltrosGrupoDTO,
  IHorario,
  CreateHorarioDTO,
  UpdateHorarioDTO
} from '../types';

export class AcademicoService {
  private repo: AcademicoRepository;
  private docenteRepo: DocenteRepository;

  constructor(
    repo: AcademicoRepository = academicoRepository,
    docenteRepo: DocenteRepository = docenteRepository
  ) {
    this.repo = repo;
    this.docenteRepo = docenteRepo;
  }

  // ==========================================
  // 1. GESTIÓN DE CURSOS
  // ==========================================

  async getCursos(soloActivos: boolean = false): Promise<ICurso[]> {
    return await this.repo.findCursos(soloActivos);
  }

  async getCursoById(id: number): Promise<ICurso> {
    const curso = await this.repo.findCursoById(id);
    if (!curso) {
      const error: any = new Error(`Curso con ID ${id} no encontrado`);
      error.statusCode = 404;
      throw error;
    }
    return curso;
  }

  async createCurso(dto: CreateCursoDTO): Promise<ICurso> {
    if (!dto.nombre || dto.nombre.trim() === '') {
      const error: any = new Error('El nombre del curso es obligatorio');
      error.statusCode = 400;
      throw error;
    }

    if (await this.repo.findCursoByName(dto.nombre)) {
      const error: any = new Error(`El área "${dto.nombre.trim()}" ya está registrada`);
      error.statusCode = 409;
      throw error;
    }

    const insertId = await this.repo.createCurso(dto);
    const nuevoCurso = await this.repo.findCursoById(insertId);
    return nuevoCurso!;
  }

  async updateCurso(id: number, dto: UpdateCursoDTO): Promise<ICurso> {
    const current = await this.getCursoById(id);

    if (dto.nombre !== undefined && dto.nombre.trim() === '') {
      const error: any = new Error('El nombre del curso no puede estar vacío');
      error.statusCode = 400;
      throw error;
    }

    if (dto.nombre !== undefined && dto.nombre.trim().toLocaleLowerCase() !== current.nombre.toLocaleLowerCase()) {
      if (await this.repo.findCursoByName(dto.nombre)) {
        const error: any = new Error(`El área "${dto.nombre.trim()}" ya está registrada`);
        error.statusCode = 409;
        throw error;
      }
    }

    await this.repo.updateCurso(id, dto);
    return (await this.repo.findCursoById(id))!;
  }

  async deleteCurso(id: number): Promise<{ message: string }> {
    await this.getCursoById(id);
    await this.repo.deleteCursoLogico(id);
    return { message: `Curso con ID ${id} desactivado correctamente` };
  }

  // ==========================================
  // 2. GESTIÓN DE CICLOS ACADÉMICOS
  // ==========================================

  async getCiclos(soloActivos: boolean = false): Promise<ICicloAcademico[]> {
    return await this.repo.findCiclos(soloActivos);
  }

  async getCicloById(id: number): Promise<ICicloAcademico> {
    const ciclo = await this.repo.findCicloById(id);
    if (!ciclo) {
      const error: any = new Error(`Ciclo académico con ID ${id} no encontrado`);
      error.statusCode = 404;
      throw error;
    }
    return ciclo;
  }

  async createCiclo(dto: CreateCicloDTO): Promise<ICicloAcademico> {
    if (!dto.nombre || dto.nombre.trim() === '') {
      const error: any = new Error('El nombre del ciclo es obligatorio');
      error.statusCode = 400;
      throw error;
    }

    if (!dto.fecha_inicio || !dto.fecha_fin) {
      const error: any = new Error('Las fechas de inicio y fin del ciclo son obligatorias');
      error.statusCode = 400;
      throw error;
    }

    const fechaInicio = new Date(dto.fecha_inicio);
    const fechaFin = new Date(dto.fecha_fin);

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      const error: any = new Error('El formato de las fechas es inválido (debe ser YYYY-MM-DD)');
      error.statusCode = 400;
      throw error;
    }

    if (fechaInicio > fechaFin) {
      const error: any = new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
      error.statusCode = 400;
      throw error;
    }
    if (monthDistance(fechaInicio, fechaFin) !== 5) {
      const error: any = new Error('El ciclo académico debe abarcar exactamente seis meses calendario');
      error.statusCode = 400;
      throw error;
    }

    const insertId = await this.repo.createCiclo(dto);
    return (await this.repo.findCicloById(insertId))!;
  }

  async updateCiclo(id: number, dto: UpdateCicloDTO): Promise<ICicloAcademico> {
    const cicloActual = await this.getCicloById(id);

    const fInicioStr = dto.fecha_inicio || cicloActual.fecha_inicio.toString();
    const fFinStr = dto.fecha_fin || cicloActual.fecha_fin.toString();

    const fechaInicio = new Date(fInicioStr);
    const fechaFin = new Date(fFinStr);

    if (fechaInicio > fechaFin) {
      const error: any = new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
      error.statusCode = 400;
      throw error;
    }
    if (monthDistance(fechaInicio, fechaFin) !== 5) {
      const error: any = new Error('El ciclo académico debe abarcar exactamente seis meses calendario');
      error.statusCode = 400;
      throw error;
    }

    await this.repo.updateCiclo(id, dto);
    return (await this.repo.findCicloById(id))!;
  }

  async deleteCiclo(id: number): Promise<{ message: string }> {
    await this.getCicloById(id);
    await this.repo.deleteCicloLogico(id);
    return { message: `Ciclo académico con ID ${id} desactivado correctamente` };
  }

  // ==========================================
  // 3. GESTIÓN DE GRUPOS
  // ==========================================

  async getGrupos(filtros?: FiltrosGrupoDTO): Promise<IGrupoDetalle[]> {
    const grupos = await this.repo.findGrupos(filtros);

    // Cargar los horarios asignados a cada grupo
    for (const grupo of grupos) {
      grupo.horarios = await this.repo.findHorariosByGrupo(grupo.id);
    }

    return grupos;
  }

  async getGrupoById(id: number): Promise<IGrupoDetalle> {
    const grupo = await this.repo.findGrupoById(id);
    if (!grupo) {
      const error: any = new Error(`Grupo con ID ${id} no encontrado`);
      error.statusCode = 404;
      throw error;
    }

    grupo.horarios = await this.repo.findHorariosByGrupo(grupo.id);
    return grupo;
  }

  async createGrupo(dto: CreateGrupoDTO): Promise<IGrupoDetalle> {
    // 1. Validaciones básicas de campos obligatorios
    if (!dto.nombre || dto.nombre.trim() === '') {
      const error: any = new Error('El nombre o código del grupo es obligatorio');
      error.statusCode = 400;
      throw error;
    }
    if (!dto.curso_id || !dto.docente_id || !dto.ciclo_id) {
      const error: any = new Error('El curso_id, docente_id y ciclo_id son obligatorios');
      error.statusCode = 400;
      throw error;
    }
    const canal = await this.repo.findCanal(Number(dto.canal_id));
    if (!canal || canal.estado !== 'ACTIVO') {
      const error: any = new Error('Selecciona uno de los cuatro canales activos');
      error.statusCode = 400;
      throw error;
    }

    const capacidad = dto.capacidad !== undefined ? Number(dto.capacidad) : 30;
    if (isNaN(capacidad) || capacidad <= 0) {
      const error: any = new Error('La capacidad del grupo debe ser un número entero mayor a 0');
      error.statusCode = 400;
      throw error;
    }

    // 2. Validar que el curso exista y esté ACTIVO
    const curso = await this.repo.findCursoById(dto.curso_id);
    if (!curso || curso.estado !== 'ACTIVO') {
      const error: any = new Error('El curso seleccionado no existe o se encuentra inactivo');
      error.statusCode = 400;
      throw error;
    }
    if (!await this.repo.isCursoInCanal(Number(dto.canal_id), Number(dto.curso_id))) {
      const error: any = new Error('El área seleccionada no pertenece al canal elegido');
      error.statusCode = 400;
      throw error;
    }

    // 3. Validar que el docente exista y esté ACTIVO
    const docente = await this.docenteRepo.findById(dto.docente_id);
    if (!docente || (docente as any).estado_usuario !== 'ACTIVO') {
      const error: any = new Error('El docente seleccionado no existe o se encuentra inactivo');
      error.statusCode = 400;
      throw error;
    }

    // 4. Validar que el ciclo académico exista y esté ACTIVO
    const ciclo = await this.repo.findCicloById(dto.ciclo_id);
    if (!ciclo || ciclo.estado !== 'ACTIVO') {
      const error: any = new Error('El ciclo académico seleccionado no existe o se encuentra inactivo');
      error.statusCode = 400;
      throw error;
    }

    const insertId = await this.repo.createGrupo({
      ...dto,
      capacidad
    });

    return (await this.getGrupoById(insertId));
  }

  async updateGrupo(id: number, dto: UpdateGrupoDTO): Promise<IGrupoDetalle> {
    const grupoActual = await this.getGrupoById(id);

    if (dto.canal_id !== undefined) {
      const canal = await this.repo.findCanal(Number(dto.canal_id));
      if (!canal || canal.estado !== 'ACTIVO') {
        const error: any = new Error('Selecciona uno de los cuatro canales activos');
        error.statusCode = 400;
        throw error;
      }
    }
    if (dto.curso_id !== undefined || dto.canal_id !== undefined) {
      const nextCurso = dto.curso_id ?? grupoActual.curso_id;
      const nextCanal = dto.canal_id ?? grupoActual.canal_id;
      if (!await this.repo.isCursoInCanal(Number(nextCanal), Number(nextCurso))) {
        const error: any = new Error('El área seleccionada no pertenece al canal elegido');
        error.statusCode = 400;
        throw error;
      }
    }

    // Si se actualiza la capacidad, validar que no sea menor a las matrículas activas ya existentes
    if (dto.capacidad !== undefined) {
      const nuevaCapacidad = Number(dto.capacidad);
      if (isNaN(nuevaCapacidad) || nuevaCapacidad <= 0) {
        const error: any = new Error('La capacidad del grupo debe ser mayor a 0');
        error.statusCode = 400;
        throw error;
      }

      const matriculasActivas = await this.repo.countMatriculasActivasByGrupo(id);
      if (nuevaCapacidad < matriculasActivas) {
        const error: any = new Error(
          `No se puede reducir la capacidad a ${nuevaCapacidad}. El grupo ya tiene ${matriculasActivas} matrículas activas.`
        );
        error.statusCode = 400;
        throw error;
      }
    }

    // Si se actualiza el curso, verificar que esté activo
    if (dto.curso_id !== undefined && dto.curso_id !== grupoActual.curso_id) {
      const curso = await this.repo.findCursoById(dto.curso_id);
      if (!curso || curso.estado !== 'ACTIVO') {
        const error: any = new Error('El curso seleccionado no existe o está inactivo');
        error.statusCode = 400;
        throw error;
      }
    }

    // Si se actualiza el docente, verificar que esté activo
    if (dto.docente_id !== undefined && dto.docente_id !== grupoActual.docente_id) {
      const docente = await this.docenteRepo.findById(dto.docente_id);
      if (!docente || (docente as any).estado_usuario !== 'ACTIVO') {
        const error: any = new Error('El docente seleccionado no existe o está inactivo');
        error.statusCode = 400;
        throw error;
      }
    }

    // Si se actualiza el ciclo, verificar que esté activo
    if (dto.ciclo_id !== undefined && dto.ciclo_id !== grupoActual.ciclo_id) {
      const ciclo = await this.repo.findCicloById(dto.ciclo_id);
      if (!ciclo || ciclo.estado !== 'ACTIVO') {
        const error: any = new Error('El ciclo académico seleccionado no existe o está inactivo');
        error.statusCode = 400;
        throw error;
      }
    }

    await this.repo.updateGrupo(id, dto);
    return (await this.getGrupoById(id));
  }

  async deleteGrupo(id: number): Promise<{ message: string }> {
    await this.getGrupoById(id);
    await this.repo.deleteGrupoLogico(id);
    return { message: `Grupo con ID ${id} desactivado correctamente` };
  }

  // ==========================================
  // 4. GESTIÓN DE HORARIOS Y CONTROL DE CRUCES
  // ==========================================

  async getHorariosByGrupo(grupoId: number): Promise<IHorario[]> {
    await this.getGrupoById(grupoId);
    return await this.repo.findHorariosByGrupo(grupoId);
  }

  async createHorario(dto: CreateHorarioDTO): Promise<IHorario> {
    const { grupo_id, dia_semana, hora_inicio, hora_fin, aula } = dto;

    if (!grupo_id || !dia_semana || !hora_inicio || !hora_fin || !aula) {
      const error: any = new Error('Todos los campos del horario son requeridos (grupo_id, dia_semana, hora_inicio, hora_fin, aula)');
      error.statusCode = 400;
      throw error;
    }

    if (hora_inicio >= hora_fin) {
      const error: any = new Error('La hora de inicio debe ser anterior a la hora de fin');
      error.statusCode = 400;
      throw error;
    }

    const grupo = await this.getGrupoById(grupo_id);
    if (grupo.estado !== 'ACTIVO') {
      const error: any = new Error('No se pueden asignar horarios a un grupo inactivo');
      error.statusCode = 400;
      throw error;
    }

    // Validación A: Control de colisión de horario del Docente
    const cruceDocente = await this.repo.checkCrucesHorarioDocente(
      grupo.docente_id,
      dia_semana,
      hora_inicio,
      hora_fin
    );
    if (cruceDocente) {
      const error: any = new Error(
        `Conflicto de Horario del Docente: El profesor ya tiene asignada la clase "${cruceDocente.curso_nombre}" (${cruceDocente.grupo_nombre}) el ${dia_semana} de ${cruceDocente.hora_inicio} a ${cruceDocente.hora_fin}.`
      );
      error.statusCode = 400;
      throw error;
    }

    // Validación B: Control de colisión de disponibilidad del Aula
    const cruceAula = await this.repo.checkCrucesHorarioAula(
      aula,
      dia_semana,
      hora_inicio,
      hora_fin
    );
    if (cruceAula) {
      const error: any = new Error(
        `Conflicto de Aula: El "${aula}" ya se encuentra ocupada por el grupo "${cruceAula.grupo_nombre}" (${cruceAula.curso_nombre}) el ${dia_semana} de ${cruceAula.hora_inicio} a ${cruceAula.hora_fin}.`
      );
      error.statusCode = 400;
      throw error;
    }

    const insertId = await this.repo.createHorario(dto);
    const nuevoHorario = await this.repo.findHorarioById(insertId);
    return nuevoHorario!;
  }

  async updateHorario(id: number, dto: UpdateHorarioDTO): Promise<IHorario> {
    const actual = await this.repo.findHorarioById(id);
    if (!actual) {
      const error: any = new Error(`Horario con ID ${id} no encontrado`);
      error.statusCode = 404;
      throw error;
    }

    const grupoId = dto.grupo_id ?? actual.grupo_id;
    const dia = dto.dia_semana ?? actual.dia_semana;
    const horaInicio = dto.hora_inicio ?? actual.hora_inicio;
    const horaFin = dto.hora_fin ?? actual.hora_fin;
    const aula = dto.aula ?? actual.aula;
    if (horaInicio >= horaFin) {
      const error: any = new Error('La hora de inicio debe ser anterior a la hora de fin');
      error.statusCode = 400;
      throw error;
    }

    const grupo = await this.getGrupoById(grupoId);
    if (grupo.estado !== 'ACTIVO') {
      const error: any = new Error('No se pueden asignar horarios a un grupo inactivo');
      error.statusCode = 400;
      throw error;
    }

    const cruceDocente = await this.repo.checkCrucesHorarioDocente(grupo.docente_id, dia, horaInicio, horaFin, undefined, id);
    if (cruceDocente) {
      const error: any = new Error(`Conflicto de Horario del Docente: El profesor ya tiene asignada la clase "${cruceDocente.curso_nombre}" (${cruceDocente.grupo_nombre}) el ${dia} de ${cruceDocente.hora_inicio} a ${cruceDocente.hora_fin}.`);
      error.statusCode = 400;
      throw error;
    }

    const cruceAula = await this.repo.checkCrucesHorarioAula(aula, dia, horaInicio, horaFin, undefined, id);
    if (cruceAula) {
      const error: any = new Error(`Conflicto de Aula: El "${aula}" ya se encuentra ocupada por el grupo "${cruceAula.grupo_nombre}" (${cruceAula.curso_nombre}) el ${dia} de ${cruceAula.hora_inicio} a ${cruceAula.hora_fin}.`);
      error.statusCode = 400;
      throw error;
    }

    await this.repo.updateHorario(id, dto);
    return (await this.repo.findHorarioById(id))!;
  }

  async deleteHorario(id: number): Promise<{ message: string }> {
    const horario = await this.repo.findHorarioById(id);
    if (!horario) {
      const error: any = new Error(`Horario con ID ${id} no encontrado`);
      error.statusCode = 404;
      throw error;
    }

    await this.repo.deleteHorario(id);
    return { message: `Horario con ID ${id} eliminado correctamente` };
  }
}

function monthDistance(start: Date, end: Date): number {
  return (end.getUTCFullYear() - start.getUTCFullYear()) * 12
    + end.getUTCMonth() - start.getUTCMonth();
}

export const academicoService = new AcademicoService();
