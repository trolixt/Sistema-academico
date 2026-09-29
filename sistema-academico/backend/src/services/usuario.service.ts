import bcrypt from 'bcrypt';
import { usuarioRepository, UsuarioRepository } from '../repositories/usuario.repository';
import { IUsuario, EstadoUsuario } from '../types';

export class UsuarioService {
  private userRepo: UsuarioRepository;

  constructor(userRepo: UsuarioRepository = usuarioRepository) {
    this.userRepo = userRepo;
  }

  /**
   * Obtiene los datos de un usuario por ID (sin exponer el hash de contraseña)
   */
  async getUsuarioById(id: number): Promise<Omit<IUsuario, 'password_hash'>> {
    const usuario = await this.userRepo.findById(id);
    if (!usuario) {
      const error: any = new Error(`Usuario con ID ${id} no encontrado`);
      error.statusCode = 404;
      throw error;
    }
    const { password_hash, ...datosSeguro } = usuario;
    return datosSeguro;
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
