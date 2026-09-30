import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import {
  IUsuario,
  IAdministrador,
  IPersonalAdministrativo,
  IDocente,
  IEstudiante,
  PerfilUsuario,
  RolUsuario
} from '../types';

export class UsuarioRepository {
  async findAllSafe(): Promise<Array<{ id: number; nombre_usuario: string; rol: RolUsuario; estado: 'ACTIVO' | 'INACTIVO'; nombres: string | null; apellidos: string | null; correo: string | null }>> {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT u.id, u.nombre_usuario, u.rol, u.estado,
        COALESCE(a.nombres, pa.nombres, d.nombres, e.nombres) AS nombres,
        COALESCE(a.apellidos, pa.apellidos, d.apellidos, e.apellidos) AS apellidos,
        COALESCE(a.correo, pa.correo, d.correo, e.correo) AS correo
      FROM Usuario u
      LEFT JOIN Administrador a ON a.usuario_id = u.id
      LEFT JOIN PersonalAdministrativo pa ON pa.usuario_id = u.id
      LEFT JOIN Docente d ON d.usuario_id = u.id
      LEFT JOIN Estudiante e ON e.usuario_id = u.id
      ORDER BY u.id DESC
    `);
    return rows as Array<{ id: number; nombre_usuario: string; rol: RolUsuario; estado: 'ACTIVO' | 'INACTIVO'; nombres: string | null; apellidos: string | null; correo: string | null }>;
  }

  /**
   * Busca un usuario por su nombre_usuario exacto
   */
  async findByNombreUsuario(nombreUsuario: string): Promise<IUsuario | null> {
    const query = `
      SELECT id, nombre_usuario, password_hash, rol, estado
      FROM Usuario
      WHERE nombre_usuario = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query, [nombreUsuario]);

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as IUsuario;
  }

  /**
   * Busca un usuario por su ID
   */
  async findById(id: number): Promise<IUsuario | null> {
    const query = `
      SELECT id, nombre_usuario, password_hash, rol, estado
      FROM Usuario
      WHERE id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);

    if (rows.length === 0) {
      return null;
    }

    return rows[0] as IUsuario;
  }

  /**
   * Obtiene los datos del perfil específico según el rol del usuario
   */
  async findPerfilByUsuario(usuarioId: number, rol: RolUsuario): Promise<PerfilUsuario | null> {
    let query = '';

    switch (rol) {
      case 'ADMINISTRADOR':
        query = `SELECT id, usuario_id, nombres, apellidos, dni, correo FROM Administrador WHERE usuario_id = ? LIMIT 1`;
        break;
      case 'ADMINISTRATIVO':
        query = `SELECT id, usuario_id, nombres, apellidos, dni, correo FROM PersonalAdministrativo WHERE usuario_id = ? LIMIT 1`;
        break;
      case 'DOCENTE':
        query = `SELECT id, usuario_id, codigo_docente, nombres, apellidos, dni, telefono, correo FROM Docente WHERE usuario_id = ? LIMIT 1`;
        break;
      case 'ESTUDIANTE':
        query = `SELECT id, usuario_id, codigo_estudiante, nombres, apellidos, dni, fecha_nacimiento, telefono, correo, direccion, estado FROM Estudiante WHERE usuario_id = ? LIMIT 1`;
        break;
      default:
        return null;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(query, [usuarioId]);
    if (rows.length === 0) {
      return null;
    }

    return rows[0] as PerfilUsuario;
  }

  /**
   * Inserta un nuevo usuario (útil para futuros registros)
   */
  async create(nombreUsuario: string, passwordHash: string, rol: RolUsuario): Promise<number> {
    const query = `
      INSERT INTO Usuario (nombre_usuario, password_hash, rol, estado)
      VALUES (?, ?, ?, 'ACTIVO')
    `;
    const [result] = await pool.execute<ResultSetHeader>(query, [nombreUsuario, passwordHash, rol]);
    return result.insertId;
  }

  /**
   * Actualiza el hash de contraseña de un usuario
   */
  async updatePassword(usuarioId: number, passwordHash: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE Usuario SET password_hash = ? WHERE id = ?`,
      [passwordHash, usuarioId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Cambia el estado de un usuario (ACTIVO/INACTIVO)
   */
  async updateEstado(usuarioId: number, estado: 'ACTIVO' | 'INACTIVO'): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE Usuario SET estado = ? WHERE id = ?`,
      [estado, usuarioId]
    );
    return result.affectedRows > 0;
  }
}

export const usuarioRepository = new UsuarioRepository();
