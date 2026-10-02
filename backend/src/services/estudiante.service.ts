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

  async getAllEstudiantes(): Promise<EstudianteConUsuario[]> {
    return await this.repo.findAll();
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

  async createEstudiante(dto: CreateEstudianteDTO): Promise<EstudianteConUsuario> {
    // 1. Validaciones obligatorias
    if (!dto.nombres?.trim() || !dto.apellidos?.trim()) {
      const error: any = new Error('Los nombres y apellidos son obligatorios');
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
    const nombreUsuario = dto.nombre_usuario?.trim() || dto.dni.trim();

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
      telefono: dto.telefono,
      correo: dto.correo,
      direccion: dto.direccion,
      codigo_estudiante: codigoEstudiante
    });

    return (await this.repo.findById(nuevoId))!;
  }

  async updateEstudiante(id: number, dto: UpdateEstudianteDTO): Promise<EstudianteConUsuario> {
    const estudianteActual = await this.getEstudianteById(id);
    validarDni(dto.dni);
    validarTelefono(dto.telefono);
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

    // Si se intenta desactivar, verificar que no tenga matrículas activas
    if (dto.estado === 'INACTIVO') {
      const tieneMatriculas = await this.repo.hasMatriculasActivas(id);
      if (tieneMatriculas) {
        const error: any = new Error('No se puede desactivar al estudiante porque tiene matrículas activas');
        error.statusCode = 400;
        throw error;
      }
      // Desactivar también la cuenta de usuario
      await this.repo.updateEstadoUsuario(estudianteActual.usuario_id, 'INACTIVO');
    }

    if (dto.estado === 'ACTIVO') {
      await this.repo.updateEstadoUsuario(estudianteActual.usuario_id, 'ACTIVO');
    }

    await this.repo.updateEstudiante(id, dto);
    return (await this.repo.findById(id))!;
  }

  async deleteEstudiante(id: number): Promise<{ message: string }> {
    const estudiante = await this.getEstudianteById(id);

    const tieneMatriculas = await this.repo.hasMatriculasActivas(id);
    if (tieneMatriculas) {
      const error: any = new Error('No se puede desactivar al estudiante porque tiene matrículas activas');
      error.statusCode = 400;
      throw error;
    }

    await this.repo.updateEstudiante(id, { estado: 'INACTIVO' });
    await this.repo.updateEstadoUsuario(estudiante.usuario_id, 'INACTIVO');

    return { message: `Estudiante ${estudiante.nombres} ${estudiante.apellidos} desactivado correctamente` };
  }
}

export const estudianteService = new EstudianteService();
