import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { usuarioRepository, UsuarioRepository } from '../repositories/usuario.repository';
import {
  LoginDTO,
  LoginResponseDTO,
  UsuarioAutenticado,
  JWTPayload
} from '../types';

export class AuthService {
  private userRepo: UsuarioRepository;
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor(userRepo: UsuarioRepository = usuarioRepository) {
    this.userRepo = userRepo;
    this.jwtSecret = process.env.JWT_SECRET || 'sistema_academia_secret_key_2026';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '8h';
  }

  /**
   * Autentica a un usuario y genera su token JWT con su perfil correspondiente
   */
  async login(credentials: LoginDTO): Promise<LoginResponseDTO> {
    const { nombre_usuario, password } = credentials;

    if (!nombre_usuario || !password) {
      const error: any = new Error('El nombre de usuario y la contraseña son requeridos');
      error.statusCode = 400;
      throw error;
    }

    // 1. Buscar el usuario en la base de datos
    const usuario = await this.userRepo.findByNombreUsuario(nombre_usuario.trim());
    if (!usuario) {
      const error: any = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    // 2. Validar estado de la cuenta
    if (usuario.estado !== 'ACTIVO') {
      const error: any = new Error('La cuenta se encuentra inactiva. Contacte a la administración');
      error.statusCode = 403;
      throw error;
    }

    // 3. Comparar el hash de la contraseña
    const isPasswordValid = await bcrypt.compare(password, usuario.password_hash);
    if (!isPasswordValid) {
      const error: any = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    // 4. Obtener el perfil asociado según el rol
    const perfil = await this.userRepo.findPerfilByUsuario(usuario.id, usuario.rol);

    // 5. Generar el Payload y el Token JWT
    const payload: JWTPayload = {
      id: usuario.id,
      nombre_usuario: usuario.nombre_usuario,
      rol: usuario.rol,
      perfil_id: perfil ? perfil.id : undefined
    };

    const token = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn as any
    });

    const usuarioAutenticado: UsuarioAutenticado = {
      id: usuario.id,
      nombre_usuario: usuario.nombre_usuario,
      rol: usuario.rol,
      estado: usuario.estado,
      perfil
    };

    return {
      token,
      usuario: usuarioAutenticado
    };
  }

  /**
   * Obtiene la información del perfil del usuario actualmente autenticado
   */
  async getPerfilActual(usuarioId: number): Promise<UsuarioAutenticado> {
    const usuario = await this.userRepo.findById(usuarioId);
    if (!usuario) {
      const error: any = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (usuario.estado !== 'ACTIVO') {
      const error: any = new Error('La cuenta del usuario se encuentra inactiva');
      error.statusCode = 403;
      throw error;
    }

    const perfil = await this.userRepo.findPerfilByUsuario(usuario.id, usuario.rol);

    return {
      id: usuario.id,
      nombre_usuario: usuario.nombre_usuario,
      rol: usuario.rol,
      estado: usuario.estado,
      perfil
    };
  }
}

export const authService = new AuthService();
