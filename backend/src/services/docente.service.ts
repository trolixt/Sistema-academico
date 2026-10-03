import bcrypt from 'bcrypt';
import { docenteRepository, DocenteRepository, DocenteConUsuario, CreateDocenteDTO, UpdateDocenteDTO } from '../repositories/docente.repository';
import { validarDni, validarTelefono } from '../utils/validaciones-personales';

export class DocenteService {
  private repo: DocenteRepository;

  constructor(repo: DocenteRepository = docenteRepository) {
    this.repo = repo;
  }

  private async generarCodigoDocente(): Promise<string> {
    const ultimo = await this.repo.getLastCodigoDocente();
    if (!ultimo) return 'DOC-0001';
    const partes = ultimo.split('-');
    const numero = parseInt(partes[1] || '0', 10) + 1;
    return `DOC-${String(numero).padStart(4, '0')}`;
  }

  async getAllDocentes(): Promise<DocenteConUsuario[]> {
    return await this.repo.findAll();
  }

  async getDocenteById(id: number): Promise<DocenteConUsuario> {
    const docente = await this.repo.findById(id);
    if (!docente) {
      const error: any = new Error(`Docente con ID ${id} no encontrado`);
      error.statusCode = 404;
      throw error;
    }
    return docente;
  }

  async createDocente(dto: CreateDocenteDTO): Promise<DocenteConUsuario> {
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

    // Verificar DNI único
    const existeDni = await this.repo.findByDni(dto.dni.trim());
    if (existeDni) {
      const error: any = new Error(`Ya existe un docente con el DNI "${dto.dni}"`);
      error.statusCode = 409;
      throw error;
    }

    // Nombre de usuario por defecto: DNI
    const nombreUsuario = dto.nombre_usuario?.trim() || `DOCENTE-${dto.dni.trim()}`;
    const existeUsuario = await this.repo.findByNombreUsuario(nombreUsuario);
    if (existeUsuario) {
      const error: any = new Error(`El nombre de usuario "${nombreUsuario}" ya está en uso`);
      error.statusCode = 409;
      throw error;
    }

    const passwordPlana = dto.password?.trim() || dto.dni.trim();
    const passwordHash = await bcrypt.hash(passwordPlana, 10);
    const codigoDocente = await this.generarCodigoDocente();

    const nuevoId = await this.repo.createWithTransaction({
      nombre_usuario: nombreUsuario,
      password_hash: passwordHash,
      codigo_docente: codigoDocente,
      nombres: dto.nombres,
      apellidos: dto.apellidos,
      dni: dto.dni,
      telefono: dto.telefono,
      correo: dto.correo
    });

    return (await this.repo.findById(nuevoId))!;
  }

  async updateDocente(id: number, dto: UpdateDocenteDTO): Promise<DocenteConUsuario> {
    const docenteActual = await this.getDocenteById(id);
    validarDni(dto.dni);
    validarTelefono(dto.telefono);
    if (dto.dni !== undefined) dto.dni = dto.dni.trim();
    if (dto.telefono !== undefined) dto.telefono = dto.telefono.trim();

    // Validar DNI único si se está cambiando
    if (dto.dni && dto.dni.trim() !== docenteActual.dni) {
      const existeDni = await this.repo.findByDni(dto.dni.trim());
      if (existeDni) {
        const error: any = new Error(`El DNI "${dto.dni}" ya pertenece a otro docente`);
        error.statusCode = 409;
        throw error;
      }
    }

    // Si se desactiva, verificar que no tenga grupos activos
    if (dto.estado === 'INACTIVO') {
      const tieneGrupos = await this.repo.hasGruposActivos(id);
      if (tieneGrupos) {
        const error: any = new Error('No se puede desactivar al docente porque tiene grupos activos asignados');
        error.statusCode = 400;
        throw error;
      }
      await this.repo.updateEstadoUsuario(docenteActual.usuario_id, 'INACTIVO');
    }

    if (dto.estado === 'ACTIVO') {
      await this.repo.updateEstadoUsuario(docenteActual.usuario_id, 'ACTIVO');
    }

    await this.repo.updateDocente(id, dto);
    return (await this.repo.findById(id))!;
  }

  async deleteDocente(id: number): Promise<{ message: string }> {
    const docente = await this.getDocenteById(id);

    const tieneGrupos = await this.repo.hasGruposActivos(id);
    if (tieneGrupos) {
      const error: any = new Error('No se puede desactivar al docente porque tiene grupos activos asignados');
      error.statusCode = 400;
      throw error;
    }

    await this.repo.updateDocente(id, { estado: undefined });
    await this.repo.updateEstadoUsuario(docente.usuario_id, 'INACTIVO');

    return { message: `Docente ${docente.nombres} ${docente.apellidos} desactivado correctamente` };
  }
}

export const docenteService = new DocenteService();
