import pool from '../config/database';
import { RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise';
import { IDocente, EstadoUsuario } from '../types';

export interface DocenteConUsuario extends IDocente {
  nombre_usuario: string;
  estado_usuario: EstadoUsuario;
}

export interface CreateDocenteDTO {
  nombres: string;
  apellidos: string;
  dni: string;
  telefono?: string;
  correo?: string;
  nombre_usuario?: string;
  password?: string;
}

export interface UpdateDocenteDTO {
  nombres?: string;
  apellidos?: string;
  dni?: string;
  telefono?: string;
  correo?: string;
  estado?: EstadoUsuario;
}

export class DocenteRepository {

  /**
   * Lista todos los docentes con su cuenta de usuario
   */
  async findAll(): Promise<DocenteConUsuario[]> {
    const query = `
      SELECT d.id, d.usuario_id, d.codigo_docente, d.nombres, d.apellidos, d.dni, d.telefono, d.correo,
             u.nombre_usuario, u.estado AS estado_usuario
      FROM Docente d
      INNER JOIN Usuario u ON d.usuario_id = u.id
      WHERE u.estado = 'ACTIVO'
      ORDER BY d.apellidos ASC, d.nombres ASC
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query);
    return rows as DocenteConUsuario[];
  }

  /**
   * Busca un docente por ID con su cuenta de usuario
   */
  async findById(id: number): Promise<DocenteConUsuario | null> {
    const query = `
      SELECT d.id, d.usuario_id, d.codigo_docente, d.nombres, d.apellidos, d.dni, d.telefono, d.correo,
             u.nombre_usuario, u.estado AS estado_usuario
      FROM Docente d
      INNER JOIN Usuario u ON d.usuario_id = u.id
      WHERE d.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
    if (rows.length === 0) return null;
    return rows[0] as DocenteConUsuario;
  }

  /**
   * Busca un docente por DNI (para validar unicidad)
   */
  async findByDni(dni: string): Promise<IDocente | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM Docente WHERE dni = ? LIMIT 1`,
      [dni]
    );
    return rows.length > 0 ? (rows[0] as IDocente) : null;
  }

  /**
   * Verifica si el nombre de usuario ya existe en la tabla Usuario
   */
  async findByNombreUsuario(nombreUsuario: string): Promise<any | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id FROM Usuario WHERE nombre_usuario = ? LIMIT 1`,
      [nombreUsuario]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Obtiene el último código de docente para generar el siguiente
   */
  async getLastCodigoDocente(): Promise<string | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT codigo_docente FROM Docente ORDER BY id DESC LIMIT 1`
    );
    return rows.length > 0 ? (rows[0].codigo_docente as string) : null;
  }

  /**
   * Crea un docente con transacción atómica Usuario + Docente
   */
  async createWithTransaction(data: {
    nombre_usuario: string;
    password_hash: string;
    codigo_docente: string;
    nombres: string;
    apellidos: string;
    dni: string;
    telefono?: string;
    correo?: string;
  }): Promise<number> {
    const conn: PoolConnection = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [userResult] = await conn.execute<ResultSetHeader>(
        `INSERT INTO Usuario (nombre_usuario, password_hash, rol, estado) VALUES (?, ?, 'DOCENTE', 'ACTIVO')`,
        [data.nombre_usuario, data.password_hash]
      );
      const usuarioId = userResult.insertId;

      const [docenteResult] = await conn.execute<ResultSetHeader>(
        `INSERT INTO Docente (usuario_id, codigo_docente, nombres, apellidos, dni, telefono, correo)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          usuarioId,
          data.codigo_docente,
          data.nombres.trim(),
          data.apellidos.trim(),
          data.dni.trim(),
          data.telefono?.trim() || null,
          data.correo?.trim() || null
        ]
      );

      await conn.commit();
      return docenteResult.insertId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Actualiza los datos del perfil de un docente
   */
  async updateDocente(id: number, data: UpdateDocenteDTO): Promise<boolean> {
    const fields: string[] = [];
    const params: any[] = [];

    if (data.nombres !== undefined) { fields.push('nombres = ?'); params.push(data.nombres.trim()); }
    if (data.apellidos !== undefined) { fields.push('apellidos = ?'); params.push(data.apellidos.trim()); }
    if (data.dni !== undefined) { fields.push('dni = ?'); params.push(data.dni.trim()); }
    if (data.telefono !== undefined) { fields.push('telefono = ?'); params.push(data.telefono?.trim() || null); }
    if (data.correo !== undefined) { fields.push('correo = ?'); params.push(data.correo?.trim() || null); }

    if (fields.length === 0) return true;
    params.push(id);

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE Docente SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  }

  /**
   * Actualiza el estado del usuario asociado al docente
   */
  async updateEstadoUsuario(usuarioId: number, estado: EstadoUsuario): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE Usuario SET estado = ? WHERE id = ?`,
      [estado, usuarioId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Verifica si el docente tiene grupos activos asignados (para bloquear su desactivación)
   */
  async hasGruposActivos(docenteId: number): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM Grupo WHERE docente_id = ? AND estado = 'ACTIVO'`,
      [docenteId]
    );
    return Number(rows[0]?.total) > 0;
  }
}

export const docenteRepository = new DocenteRepository();
