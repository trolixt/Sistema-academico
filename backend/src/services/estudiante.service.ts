import bcrypt from 'bcrypt';
import { estudianteRepository, EstudianteRepository } from '../repositories/estudiante.repository';
import {
  EstudianteConUsuario,
  CreateEstudianteDTO,
  UpdateEstudianteDTO
} from '../types';
import { validarDni, validarTelefono } from '../utils/validaciones-personales';

export class EstudianteService {
  private repo: EstudianteRepository;

  constructor(repo: EstudianteRepository = estudianteRepository) {
    this.repo = repo;
  }

  // ==========================================
  // UTILIDADES PRIVADAS
  // ==========================================

  /**
   * Genera un código de estudiante correlativo: EST-0001, EST-0002, ...
   */
  private async generarCodigoEstudiante(): Promise<string> {
    const ultimo = await this.repo.getLastCodigoEstudiante();
    if (!ultimo) return 'EST-0001';

    const partes = ultimo.split('-');
    const numero = parseInt(partes[1] || '0', 10) + 1;
    return `EST-${String(numero).padStart(4, '0')}`;
  }

  // ==========================================
  // OPERACIONES CRUD
  // ==========================================

  async getAllEstudiantes(includeInactive = false): Promise<EstudianteConUsuario[]> {
    return await this.repo.findAll(includeInactive);
  }

  async getEstudianteById(id: number): Promise<EstudianteConUsuario> {
    const estudiante = await this.repo.findById(id);
    if (!estudiante) {
      const error: any = new Error(`Estudiante con ID ${id} no encontrado`);
      error.statusCode = 404;
      throw error;
    }
    return estudiante;
  }

  async getEstudianteByDni(dni: string) {
    return this.repo.findByDni(dni.trim());
  }

  async getEstudianteByEitherId(id: string): Promise<EstudianteConUsuario> {
    const matches = await this.repo.findByEitherId(id);
    if (matches.length > 1) {
      const error: any = new Error('Ese número coincide con el ID de ficha y el ID de acceso de estudiantes distintos; usa el ID de ficha mostrado en el directorio');
      error.statusCode = 409;
      throw error;
    }
    if (!matches.length) {
      const error: any = new Error(`No se encontró un estudiante con el ID ${id}`);
      error.statusCode = 404;
      throw error;
    }
    return matches[0];
  }

  async createEstudiante(dto: CreateEstudianteDTO): Promise<EstudianteConUsuario> {
    // 1. Validaciones obligatorias
    if (!dto.nombres?.trim() || !dto.apellidos?.trim()) {
      const error: any = new Error('Los nombres y apellidos son obligatorios');
      error.statusCode = 400;
      throw error;
    }
    if (!isValidTurno(dto.turno)) {
      const error: any = new Error('Selecciona el turno mañana o tarde para el estudiante');
      error.statusCode = 400;
      throw error;
    }
    if (!dto.dni?.trim()) {
      const error: any = new Error('El DNI es obligatorio');
      error.statusCode = 400;
      throw error;
    }
    validarDni(dto.dni);
    validarTelefono(dto.telefono);
    dto.dni = dto.dni.trim();
    dto.telefono = dto.telefono?.trim();
    if (!dto.fecha_nacimiento) {
      const error: any = new Error('La fecha de nacimiento es obligatoria');
      error.statusCode = 400;
      throw error;
    }
    if (!dto.canal_id || !await this.repo.findChannel(Number(dto.canal_id))) {
      const error: any = new Error('Selecciona un canal activo para el estudiante');
      error.statusCode = 400;
      throw error;
    }

    // Validar formato de fecha
    const fechaNac = new Date(dto.fecha_nacimiento);
    if (isNaN(fechaNac.getTime())) {
      const error: any = new Error('El formato de la fecha de nacimiento es inválido (YYYY-MM-DD)');
      error.statusCode = 400;
      throw error;
    }

    // 2. Verificar que el DNI no esté duplicado
    const existeDni = await this.repo.findByDni(dto.dni.trim());
    if (existeDni) {
      const error: any = new Error(`Ya existe un estudiante con el DNI "${dto.dni}"`);
      error.statusCode = 409;
      throw error;
    }

    // 3. Determinar nombre de usuario (por defecto: el DNI)
    const nombreUsuario = dto.nombre_usuario?.trim() || `ESTUDIANTE-${dto.dni.trim()}`;

    // 4. Verificar que el nombre de usuario no esté tomado
    const existeUsuario = await this.repo.findByNombreUsuario(nombreUsuario);
    if (existeUsuario) {
      const error: any = new Error(`El nombre de usuario "${nombreUsuario}" ya está en uso`);
      error.statusCode = 409;
      throw error;
    }

    // 5. Hash de contraseña (por defecto: el DNI)
    const passwordPlana = dto.password?.trim() || dto.dni.trim();
    const passwordHash = await bcrypt.hash(passwordPlana, 10);

    // 6. Generar código de estudiante
    const codigoEstudiante = await this.generarCodigoEstudiante();

    // 7. Crear en transacción atómica
    const nuevoId = await this.repo.createWithTransaction({
      nombre_usuario: nombreUsuario,
      password_hash: passwordHash,
      nombres: dto.nombres,
      apellidos: dto.apellidos,
      dni: dto.dni,
      fecha_nacimiento: dto.fecha_nacimiento,
      turno: dto.turno,
      telefono: dto.telefono,
      correo: dto.correo,
      direccion: dto.direccion,
      canal_id: dto.canal_id,
      codigo_estudiante: codigoEstudiante
    });

    return (await this.repo.findById(nuevoId))!;
  }

  async updateEstudiante(id: number, dto: UpdateEstudianteDTO): Promise<EstudianteConUsuario> {
    const estudianteActual = await this.getEstudianteById(id);
    if (dto.estado === 'ACTIVO' && (estudianteActual.estado !== 'ACTIVO' || estudianteActual.estado_usuario !== 'ACTIVO')) {
      const error: any = new Error('Usa el flujo de reincorporación para volver a activar al estudiante');
      error.statusCode = 409;
      throw error;
    }
    validarDni(dto.dni);
    validarTelefono(dto.telefono);
    if (dto.turno !== undefined && !isValidTurno(dto.turno)) {
      const error: any = new Error('Selecciona el turno mañana o tarde para el estudiante');
      error.statusCode = 400;
      throw error;
    }
    if (dto.dni !== undefined) dto.dni = dto.dni.trim();
    if (dto.telefono !== undefined) dto.telefono = dto.telefono.trim();

    // Validar que el nuevo DNI no esté en uso por otro estudiante
    if (dto.dni && dto.dni.trim() !== estudianteActual.dni) {
      const existeDni = await this.repo.findByDni(dto.dni.trim());
      if (existeDni) {
        const error: any = new Error(`El DNI "${dto.dni}" ya pertenece a otro estudiante`);
        error.statusCode = 409;
        throw error;
      }
    }

    if (dto.canal_id !== undefined && (!dto.canal_id || !await this.repo.findChannel(Number(dto.canal_id)))) {
      const error: any = new Error('Selecciona un canal activo para el estudiante');
      error.statusCode = 400;
      throw error;
    }
    const { estado, ...profile } = dto;
    await this.repo.updateProfileAndStatus(id, estudianteActual.usuario_id, estado || estudianteActual.estado, profile);
    return (await this.repo.findById(id))!;
  }

  async reincorporateEstudiante(id: number, dto: UpdateEstudianteDTO): Promise<EstudianteConUsuario> {
    const estudiante = await this.getEstudianteById(id);
    if (estudiante.estado === 'ACTIVO' && estudiante.estado_usuario === 'ACTIVO') {
      const error: any = new Error('El estudiante ya está activo');
      error.statusCode = 409;
      throw error;
    }
    if (dto.dni && dto.dni.trim() !== estudiante.dni && await this.repo.findByDni(dto.dni.trim())) {
      const error: any = new Error(`El DNI "${dto.dni}" ya pertenece a otro estudiante`);
      error.statusCode = 409;
      throw error;
    }
    if (!dto.nombres?.trim() || !dto.apellidos?.trim() || !dto.dni?.trim() || !dto.fecha_nacimiento || !dto.canal_id || !isValidTurno(dto.turno)) {
      const error: any = new Error('Completa nombres, apellidos, DNI, nacimiento, canal y turno para reincorporar');
      error.statusCode = 400;
      throw error;
    }
    validarDni(dto.dni);
    validarTelefono(dto.telefono);
    const fechaNac = new Date(dto.fecha_nacimiento);
    if (isNaN(fechaNac.getTime())) {
      const error: any = new Error('El formato de la fecha de nacimiento es inválido (YYYY-MM-DD)');
      error.statusCode = 400;
      throw error;
    }
    if (!await this.repo.findChannel(Number(dto.canal_id))) {
      const error: any = new Error('Selecciona un canal activo para el estudiante');
      error.statusCode = 400;
      throw error;
    }
    const { estado: _estado, ...profile } = dto;
    await this.repo.updateProfileAndStatus(id, estudiante.usuario_id, 'ACTIVO', profile);
    return (await this.repo.findById(id))!;
  }

  async deleteEstudiante(id: number): Promise<{ message: string }> {
    const estudiante = await this.getEstudianteById(id);
    await this.repo.updateProfileAndStatus(id, estudiante.usuario_id, 'INACTIVO');

    return { message: `Estudiante ${estudiante.nombres} ${estudiante.apellidos} desactivado correctamente` };
  }
}

export const estudianteService = new EstudianteService();

function isValidTurno(value: unknown): value is 'MANANA' | 'TARDE' {
  return value === 'MANANA' || value === 'TARDE';
}
