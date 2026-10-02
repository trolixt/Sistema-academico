import { matriculaRepository, MatriculaRepository } from '../repositories/matricula.repository';
import { estudianteRepository, EstudianteRepository } from '../repositories/estudiante.repository';
import { academicoRepository, AcademicoRepository } from '../repositories/academico.repository';
import {
  IMatriculaDetalle,
  CreateMatriculaDTO,
  CambiarEstadoMatriculaDTO,
  EstadoMatricula
} from '../types';

export class MatriculaService {
  private repo: MatriculaRepository;
  private estudianteRepo: EstudianteRepository;
  private academicoRepo: AcademicoRepository;

  constructor(
    repo: MatriculaRepository = matriculaRepository,
    estudianteRepo: EstudianteRepository = estudianteRepository,
    academicoRepo: AcademicoRepository = academicoRepository
  ) {
    this.repo = repo;
    this.estudianteRepo = estudianteRepo;
    this.academicoRepo = academicoRepo;
  }

  // ==========================================
  // CONSULTAS
  // ==========================================

  async getAllMatriculas(filtros?: {
    estudiante_id?: number;
    grupo_id?: number;
    ciclo_id?: number;
    estado?: EstadoMatricula;
  }): Promise<IMatriculaDetalle[]> {
    return await this.repo.findAll(filtros);
  }

  async getMatriculaById(id: number): Promise<IMatriculaDetalle> {
    const matricula = await this.repo.findById(id);
    if (!matricula) {
      const error: any = new Error(`Matrícula con ID ${id} no encontrada`);
      error.statusCode = 404;
      throw error;
    }
    return matricula;
  }

  async getMatriculasByEstudiante(estudianteId: number): Promise<IMatriculaDetalle[]> {
    // Verificar que el estudiante exista
    const estudiante = await this.estudianteRepo.findById(estudianteId);
    if (!estudiante) {
      const error: any = new Error(`Estudiante con ID ${estudianteId} no encontrado`);
      error.statusCode = 404;
      throw error;
    }
    return await this.repo.findByEstudiante(estudianteId);
  }

  // ==========================================
  // CREACIÓN DE MATRÍCULA (lógica de negocio)
  // ==========================================

  async createMatricula(dto: CreateMatriculaDTO): Promise<IMatriculaDetalle> {
    // 1. Validar campos obligatorios
    if (!dto.estudiante_id || !dto.grupo_id || !dto.ciclo_id) {
      const error: any = new Error('El estudiante_id, grupo_id y ciclo_id son obligatorios');
      error.statusCode = 400;
      throw error;
    }

    // 2. Verificar que el estudiante exista y esté ACTIVO
    const estudiante = await this.estudianteRepo.findById(dto.estudiante_id);
    if (!estudiante) {
      const error: any = new Error(`El estudiante con ID ${dto.estudiante_id} no existe`);
      error.statusCode = 404;
      throw error;
    }
    if (estudiante.estado !== 'ACTIVO') {
      const error: any = new Error('El estudiante está inactivo y no puede ser matriculado');
      error.statusCode = 400;
      throw error;
    }

    // 3. Verificar que el grupo exista, esté ACTIVO y tenga vacantes disponibles
    const grupo = await this.academicoRepo.findGrupoById(dto.grupo_id);
    if (!grupo) {
      const error: any = new Error(`El grupo con ID ${dto.grupo_id} no existe`);
      error.statusCode = 404;
      throw error;
    }
    if (grupo.estado !== 'ACTIVO') {
      const error: any = new Error('El grupo seleccionado está inactivo');
      error.statusCode = 400;
      throw error;
    }

    // 4. Verificar que el ciclo académico coincida con el del grupo
    if (grupo.ciclo_id !== dto.ciclo_id) {
      const error: any = new Error('El ciclo_id proporcionado no corresponde al ciclo del grupo seleccionado');
      error.statusCode = 400;
      throw error;
    }

    // 5. Control de vacantes disponibles
    const matriculasActivas = await this.repo.countMatriculasActivasByGrupo(dto.grupo_id);
    if (matriculasActivas >= grupo.capacidad) {
      const error: any = new Error(
        `El grupo "${grupo.nombre}" no tiene vacantes disponibles (${grupo.capacidad}/${grupo.capacidad} ocupadas)`
      );
      error.statusCode = 400;
      throw error;
    }

    // 6. Restricción de unicidad: un estudiante no puede matricularse dos veces en el mismo grupo y ciclo
    const duplicada = await this.repo.findDuplicada(dto.estudiante_id, dto.grupo_id, dto.ciclo_id);
    if (duplicada) {
      const error: any = new Error(
        `El estudiante ya tiene una matrícula (${duplicada.codigo_matricula}) en este grupo para este ciclo con estado "${duplicada.estado}"`
      );
      error.statusCode = 409;
      throw error;
    }

    // 7. La matrícula requiere el pago inicial y la mensualidad del ciclo
    if (!dto.pago_inicial) {
      const error: any = new Error('Registra el monto de matrícula y mensualidad para continuar');
      error.statusCode = 400;
      throw error;
    }
    {
      const { concepto, monto, monto_mensualidad } = dto.pago_inicial;
      if (!concepto?.trim()) {
        const error: any = new Error('El concepto del pago inicial es obligatorio');
        error.statusCode = 400;
        throw error;
      }
      if (!monto || monto <= 0) {
        const error: any = new Error('El monto del pago debe ser mayor a 0');
        error.statusCode = 400;
        throw error;
      }
      if (!monto_mensualidad || monto_mensualidad <= 0) {
        const error: any = new Error('El monto mensual debe ser mayor a 0');
        error.statusCode = 400;
        throw error;
      }
    }

    // 8. Generar código de matrícula único
    const codigoMatricula = await this.repo.getNextCodigoMatricula();

    // 9. Crear matrícula (con pago inicial en transacción si corresponde)
    const nuevaId = await this.repo.createWithTransaction(
      {
        codigo_matricula: codigoMatricula,
        estudiante_id: dto.estudiante_id,
        grupo_id: dto.grupo_id,
        ciclo_id: dto.ciclo_id
      },
      {
        concepto: dto.pago_inicial.concepto.trim(),
        monto: dto.pago_inicial.monto,
        monto_mensualidad: dto.pago_inicial.monto_mensualidad
      }
    );

    return (await this.repo.findById(nuevaId))!;
  }

  // ==========================================
  // CAMBIO DE ESTADO
  // ==========================================

  async cambiarEstadoMatricula(id: number, dto: CambiarEstadoMatriculaDTO): Promise<IMatriculaDetalle> {
    const matricula = await this.getMatriculaById(id);

    const estadosValidos: EstadoMatricula[] = ['ACTIVA', 'CANCELADA', 'RETIRADA'];
    if (!estadosValidos.includes(dto.estado)) {
      const error: any = new Error(`Estado inválido. Use: ${estadosValidos.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    if (matricula.estado === dto.estado) {
      const error: any = new Error(`La matrícula ya se encuentra en estado "${dto.estado}"`);
      error.statusCode = 400;
      throw error;
    }

    if (matricula.estado === 'PENDIENTE_PAGO' && dto.estado === 'ACTIVA') {
      const error: any = new Error('Confirma el pago inicial desde Pagos para activar la matrícula');
      error.statusCode = 400;
      throw error;
    }

    // No se puede reactivar una matrícula cancelada o retirada
    if ((matricula.estado === 'CANCELADA' || matricula.estado === 'RETIRADA') && dto.estado === 'ACTIVA') {
      const error: any = new Error('No se puede reactivar una matrícula cancelada o retirada. Debe crear una nueva matrícula.');
      error.statusCode = 400;
      throw error;
    }

    await this.repo.cambiarEstado(id, dto.estado);
    return (await this.repo.findById(id))!;
  }
}

export const matriculaService = new MatriculaService();
