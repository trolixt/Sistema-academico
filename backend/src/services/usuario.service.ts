import bcrypt from 'bcrypt';
import { usuarioRepository, UsuarioRepository } from '../repositories/usuario.repository';
import { EstadoUsuario, RolUsuario } from '../types';
import { validarDni } from '../utils/validaciones-personales';

export class UsuarioService {
  private userRepo: UsuarioRepository;

  constructor(userRepo: UsuarioRepository = usuarioRepository) {
    this.userRepo = userRepo;
  }

  async getAllSafe(rol?: RolUsuario) {
    return this.userRepo.findAllSafe(rol);
  }

  /**
   * Obtiene los datos de un usuario por ID (sin exponer el hash de contraseña)
   */
  async getUsuarioById(id: string | number) {
    const usuario = await this.userRepo.findAccountSafeById(id);
    if (!usuario) {
      const error: any = new Error(`Usuario con ID ${id} no encontrado`);
      error.statusCode = 404;
      throw error;
    }
    return usuario;
  }

  async createSecretaria(data: { nombres: string; apellidos: string; dni: string; correo?: string; password: string }) {
    if (!data.nombres?.trim() || !data.apellidos?.trim() || !data.dni?.trim()) {
      const error: any = new Error('Nombres, apellidos y DNI son obligatorios');
      error.statusCode = 400;
      throw error;
    }
    validarDni(data.dni);
    if (!data.password || data.password.trim().length < 6) {
      const error: any = new Error('La contraseña inicial debe tener al menos 6 caracteres');
      error.statusCode = 400;
      throw error;
    }
    if (await this.userRepo.findSecretariaByDni(data.dni.trim())) {
      const error: any = new Error(`Ya existe una cuenta de secretaría con ese DNI. Busca su ID para revisar o reactivar la cuenta.`);
      error.statusCode = 409;
      throw error;
    }
    const password_hash = await bcrypt.hash(data.password.trim(), 10);
    const id = await this.userRepo.createSecretaria({ ...data, dni: data.dni.trim(), password_hash });
    return this.getUsuarioById(id);
  }

  async updateSecretaria(id: number, data: { nombres?: string; apellidos?: string; dni?: string; correo?: string | null }) {
    const account = await this.getUsuarioById(id);
    if (account.rol !== 'ADMINISTRATIVO') {
      const error: any = new Error('El ID no corresponde a una cuenta de secretaría');
      error.statusCode = 400;
      throw error;
    }
    if (data.dni !== undefined) {
      validarDni(data.dni);
      const existing = await this.userRepo.findSecretariaByDni(data.dni.trim());
      if (existing && Number(existing.id) !== id) {
        const error: any = new Error('El DNI ya está asociado a otra cuenta de secretaría');
        error.statusCode = 409;
        throw error;
      }
      data.dni = data.dni.trim();
    }
    await this.userRepo.updateSecretaria(id, data);
    return this.getUsuarioById(id);
  }

  async updateEstado(id: number, estado: EstadoUsuario) {
    if (estado !== 'ACTIVO' && estado !== 'INACTIVO') {
      const error: any = new Error('El estado de la cuenta no es válido');
      error.statusCode = 400;
      throw error;
    }
    const updated = await this.userRepo.updateAccountStatus(id, estado);
    if (!updated) {
      const error: any = new Error(`Cuenta con ID ${id} no encontrada`);
      error.statusCode = 404;
      throw error;
    }
    return this.getUsuarioById(id);
  }

  /**
   * Cambia la contraseña de un usuario dado su ID
   */
  async cambiarPassword(usuarioId: number, passwordActual: string, passwordNueva: string): Promise<{ message: string }> {
    if (!passwordNueva || passwordNueva.trim().length < 6) {
      const error: any = new Error('La nueva contraseña debe tener al menos 6 caracteres');
      error.statusCode = 400;
      throw error;
    }

    const usuario = await this.userRepo.findById(usuarioId);
    if (!usuario) {
      const error: any = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Verificar contraseña actual
    const esValida = await bcrypt.compare(passwordActual, usuario.password_hash);
    if (!esValida) {
      const error: any = new Error('La contraseña actual es incorrecta');
      error.statusCode = 401;
      throw error;
    }

    const nuevoHash = await bcrypt.hash(passwordNueva.trim(), 10);
    await this.userRepo.updatePassword(usuarioId, nuevoHash);

    return { message: 'Contraseña actualizada correctamente' };
  }

  /**
   * Restablece la contraseña de un usuario (por el administrador, sin verificar la actual)
   */
  async resetPassword(usuarioId: number, nuevaPassword: string): Promise<{ message: string }> {
    if (!nuevaPassword || nuevaPassword.trim().length < 6) {
      const error: any = new Error('La nueva contraseña debe tener al menos 6 caracteres');
      error.statusCode = 400;
      throw error;
    }

    const usuario = await this.userRepo.findById(usuarioId);
    if (!usuario) {
      const error: any = new Error(`Usuario con ID ${usuarioId} no encontrado`);
      error.statusCode = 404;
      throw error;
    }

    const nuevoHash = await bcrypt.hash(nuevaPassword.trim(), 10);
    await this.userRepo.updatePassword(usuarioId, nuevoHash);

    return { message: `Contraseña del usuario "${usuario.nombre_usuario}" restablecida correctamente` };
  }
}

export const usuarioService = new UsuarioService();
