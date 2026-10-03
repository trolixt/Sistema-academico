import { RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise';
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
import { generarIdAcceso } from '../utils/id-acceso';

export class UsuarioRepository {
  async findAllSafe(rol?: RolUsuario) {
    const params: string[] = [];
    let filter = "WHERE u.estado = 'ACTIVO'";
    if (rol) { filter += ' AND u.rol = ?'; params.push(rol); }
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT u.id, u.id_acceso, u.nombre_usuario, u.rol, u.estado,
        COALESCE(a.nombres, pa.nombres, d.nombres, e.nombres) AS nombres,
        COALESCE(a.apellidos, pa.apellidos, d.apellidos, e.apellidos) AS apellidos,
        COALESCE(a.correo, pa.correo, d.correo, e.correo) AS correo,
        COALESCE(a.dni, pa.dni, d.dni, e.dni) AS dni,
        e.id AS estudiante_id, d.id AS docente_id, pa.id AS administrativo_id
      FROM Usuario u
      LEFT JOIN Administrador a ON a.usuario_id = u.id
      LEFT JOIN PersonalAdministrativo pa ON pa.usuario_id = u.id
      LEFT JOIN Docente d ON d.usuario_id = u.id
      LEFT JOIN Estudiante e ON e.usuario_id = u.id
      ${filter}
      ORDER BY u.id DESC
    `, params);
    return rows;
  }

  async findAccountSafeById(id: string | number) {
    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT u.id, u.id_acceso, u.nombre_usuario, u.rol, u.estado,
        COALESCE(a.nombres, pa.nombres, d.nombres, e.nombres) AS nombres,
        COALESCE(a.apellidos, pa.apellidos, d.apellidos, e.apellidos) AS apellidos,
        COALESCE(a.correo, pa.correo, d.correo, e.correo) AS correo,
        COALESCE(a.dni, pa.dni, d.dni, e.dni) AS dni,
        e.id AS estudiante_id, d.id AS docente_id, pa.id AS administrativo_id
      FROM Usuario u
      LEFT JOIN Administrador a ON a.usuario_id = u.id
      LEFT JOIN PersonalAdministrativo pa ON pa.usuario_id = u.id
      LEFT JOIN Docente d ON d.usuario_id = u.id
      LEFT JOIN Estudiante e ON e.usuario_id = u.id
      WHERE u.id_acceso = ? OR u.id = ?
      ORDER BY CASE WHEN u.id_acceso = ? THEN 0 ELSE 1 END LIMIT 1
    `, [String(id), Number(id), String(id)]);
    return rows[0] || null;
  }

  async createSecretaria(data: { password_hash: string; nombres: string; apellidos: string; dni: string; correo?: string }): Promise<number> {
    const connection: PoolConnection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [userResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO Usuario (id_acceso, nombre_usuario, password_hash, rol, estado) VALUES (?, ?, ?, 'ADMINISTRATIVO', 'ACTIVO')`,
        [generarIdAcceso('ADMINISTRATIVO'), `SECRETARIA-${data.dni}`, data.password_hash]
      );
      const userId = userResult.insertId;
      await connection.execute(
        'INSERT INTO PersonalAdministrativo (usuario_id, nombres, apellidos, dni, correo) VALUES (?, ?, ?, ?, ?)',
        [userId, data.nombres.trim(), data.apellidos.trim(), data.dni.trim(), data.correo?.trim() || null]
      );
      await connection.commit();
      return userId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async findSecretariaByDni(dni: string) {
    const [rows] = await pool.execute<RowDataPacket[]>(`SELECT u.id, u.estado, pa.nombres, pa.apellidos, pa.dni, pa.correo
      FROM PersonalAdministrativo pa INNER JOIN Usuario u ON u.id = pa.usuario_id WHERE pa.dni = ? LIMIT 1`, [dni]);
    return rows[0] || null;
  }

  async updateSecretaria(usuarioId: number, data: { nombres?: string; apellidos?: string; dni?: string; correo?: string | null }) {
    const fields: string[] = [];
    const values: (string | null | number)[] = [];
    for (const key of ['nombres', 'apellidos', 'dni', 'correo'] as const) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        const value = data[key];
        values.push(typeof value === 'string' ? value.trim() || null : value ?? null);
      }
    }
    if (!fields.length) return;
    values.push(usuarioId);
    await pool.execute(`UPDATE PersonalAdministrativo SET ${fields.join(', ')} WHERE usuario_id = ?`, values);
  }

  async updateAccountStatus(id: number, estado: 'ACTIVO' | 'INACTIVO') {
    const connection: PoolConnection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [accounts] = await connection.execute<RowDataPacket[]>(`SELECT u.rol, e.id AS estudiante_id, d.id AS docente_id
        FROM Usuario u LEFT JOIN Estudiante e ON e.usuario_id = u.id LEFT JOIN Docente d ON d.usuario_id = u.id
        WHERE u.id = ? FOR UPDATE`, [id]);
      if (!accounts.length) { await connection.rollback(); return false; }
      const account = accounts[0];
      if (estado === 'INACTIVO' && account.rol === 'DOCENTE') {
        const [groups] = await connection.execute<RowDataPacket[]>("SELECT COUNT(*) AS total FROM Grupo WHERE docente_id = ? AND estado = 'ACTIVO'", [account.docente_id]);
        if (Number(groups[0]?.total) > 0) {
          const error: any = new Error('Reasigna los grupos activos del docente antes de desactivar su cuenta');
          error.statusCode = 409;
          throw error;
        }
      }
      await connection.execute('UPDATE Usuario SET estado = ? WHERE id = ?', [estado, id]);
      if (account.estudiante_id) {
        await connection.execute('UPDATE Estudiante SET estado = ? WHERE id = ?', [estado, account.estudiante_id]);
        if (estado === 'INACTIVO') await connection.execute("UPDATE Matricula SET estado = 'RETIRADA' WHERE estudiante_id = ? AND estado IN ('ACTIVA', 'PENDIENTE_PAGO')", [account.estudiante_id]);
      }
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Busca un usuario por su nombre_usuario exacto
   */
  async findByNombreUsuario(nombreUsuario: string): Promise<IUsuario | null> {
    const query = `
      SELECT id, id_acceso, nombre_usuario, password_hash, rol, estado
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
      SELECT id, id_acceso, nombre_usuario, password_hash, rol, estado
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

  async findByAccessId(idAcceso: string): Promise<IUsuario | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, id_acceso, nombre_usuario, password_hash, rol, estado FROM Usuario WHERE id_acceso = ? LIMIT 1',
      [idAcceso]
    );
    return rows.length ? rows[0] as IUsuario : null;
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
      INSERT INTO Usuario (id_acceso, nombre_usuario, password_hash, rol, estado)
      VALUES (?, ?, ?, ?, 'ACTIVO')
    `;
    const [result] = await pool.execute<ResultSetHeader>(query, [generarIdAcceso(rol), nombreUsuario, passwordHash, rol]);
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
