import pool from '../config/database';
import { RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise';
import { EstudianteConUsuario, CreateEstudianteDTO, UpdateEstudianteDTO, EstadoUsuario } from '../types';
import { generarIdAcceso } from '../utils/id-acceso';

export class EstudianteRepository {

  /**
   * Lista todos los estudiantes con su estado de cuenta
   */
  async findAll(includeInactive = false): Promise<EstudianteConUsuario[]> {
    const query = `
      SELECT e.id, e.usuario_id, e.canal_id, ca.nombre AS canal_nombre, e.codigo_estudiante, e.nombres, e.apellidos, e.dni,
             e.fecha_nacimiento, e.telefono, e.correo, e.direccion, e.estado,
             u.id_acceso, u.nombre_usuario, u.estado AS estado_usuario
      FROM Estudiante e
      INNER JOIN Usuario u ON e.usuario_id = u.id
      LEFT JOIN Canal ca ON ca.id = e.canal_id
      ${includeInactive ? '' : "WHERE e.estado = 'ACTIVO' AND u.estado = 'ACTIVO'"}
      ORDER BY e.apellidos ASC, e.nombres ASC
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query);
    return rows as EstudianteConUsuario[];
  }

  /**
   * Busca un estudiante por ID con su cuenta de usuario
   */
  async findById(id: number): Promise<EstudianteConUsuario | null> {
    const query = `
      SELECT e.id, e.usuario_id, e.canal_id, ca.nombre AS canal_nombre, e.codigo_estudiante, e.nombres, e.apellidos, e.dni,
             e.fecha_nacimiento, e.telefono, e.correo, e.direccion, e.estado,
             u.id_acceso, u.nombre_usuario, u.estado AS estado_usuario
      FROM Estudiante e
      INNER JOIN Usuario u ON e.usuario_id = u.id
      LEFT JOIN Canal ca ON ca.id = e.canal_id
      WHERE e.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
    if (rows.length === 0) return null;
    return rows[0] as EstudianteConUsuario;
  }

  async findByEitherId(id: string): Promise<EstudianteConUsuario[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(`SELECT e.id, e.usuario_id, e.canal_id, ca.nombre AS canal_nombre,
      e.codigo_estudiante, e.nombres, e.apellidos, e.dni, e.fecha_nacimiento, e.telefono, e.correo, e.direccion,
      e.estado, u.id_acceso, u.nombre_usuario, u.estado AS estado_usuario
      FROM Estudiante e INNER JOIN Usuario u ON u.id = e.usuario_id
      LEFT JOIN Canal ca ON ca.id = e.canal_id
      WHERE e.id = ? OR u.id = ? OR u.id_acceso = ?
      ORDER BY CASE WHEN e.id = ? THEN 0 ELSE 1 END`, [id, id, id, id]);
    return rows as EstudianteConUsuario[];
  }

  /**
   * Busca un estudiante por DNI
   */
  async findByDni(dni: string): Promise<EstudianteConUsuario | null> {
    const query = `SELECT e.id, e.usuario_id, e.canal_id, ca.nombre AS canal_nombre, e.codigo_estudiante,
      e.nombres, e.apellidos, e.dni, e.fecha_nacimiento, e.telefono, e.correo, e.direccion, e.estado,
      u.id_acceso, u.nombre_usuario, u.estado AS estado_usuario
      FROM Estudiante e INNER JOIN Usuario u ON u.id = e.usuario_id
      LEFT JOIN Canal ca ON ca.id = e.canal_id WHERE e.dni = ? LIMIT 1`;
    const [rows] = await pool.execute<RowDataPacket[]>(query, [dni]);
    if (rows.length === 0) return null;
    return rows[0] as EstudianteConUsuario;
  }

  /**
   * Busca un estudiante por nombre_usuario (para validar unicidad)
   */
  async findByNombreUsuario(nombreUsuario: string): Promise<any | null> {
    const query = `SELECT id FROM Usuario WHERE nombre_usuario = ? LIMIT 1`;
    const [rows] = await pool.execute<RowDataPacket[]>(query, [nombreUsuario]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Obtiene el último código de estudiante para generar el siguiente
   */
  async getLastCodigoEstudiante(): Promise<string | null> {
    const query = `SELECT codigo_estudiante FROM Estudiante ORDER BY id DESC LIMIT 1`;
    const [rows] = await pool.execute<RowDataPacket[]>(query);
    if (rows.length === 0) return null;
    return rows[0].codigo_estudiante as string;
  }

  /**
   * Crea un estudiante en una transacción atómica:
   * 1. INSERT en Usuario
   * 2. INSERT en Estudiante
   */
  async createWithTransaction(
    data: {
      nombre_usuario: string;
      password_hash: string;
      nombres: string;
      apellidos: string;
      dni: string;
      fecha_nacimiento: string;
      telefono?: string;
      correo?: string;
      direccion?: string;
      canal_id?: number;
      codigo_estudiante: string;
    }
  ): Promise<number> {
    const conn: PoolConnection = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Crear cuenta de usuario
      const [userResult] = await conn.execute<ResultSetHeader>(
        `INSERT INTO Usuario (id_acceso, nombre_usuario, password_hash, rol, estado) VALUES (?, ?, ?, 'ESTUDIANTE', 'ACTIVO')`,
        [generarIdAcceso('ESTUDIANTE'), data.nombre_usuario, data.password_hash]
      );
      const usuarioId = userResult.insertId;

      // 2. Crear perfil de estudiante
      const [estudianteResult] = await conn.execute<ResultSetHeader>(
        `INSERT INTO Estudiante (usuario_id, canal_id, codigo_estudiante, nombres, apellidos, dni, fecha_nacimiento, telefono, correo, direccion, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVO')`,
        [
          usuarioId,
          data.canal_id ?? null,
          data.codigo_estudiante,
          data.nombres.trim(),
          data.apellidos.trim(),
          data.dni.trim(),
          data.fecha_nacimiento,
          data.telefono?.trim() || null,
          data.correo?.trim() || null,
          data.direccion?.trim() || null
        ]
      );

      await conn.commit();
      return estudianteResult.insertId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Actualiza los datos del perfil de un estudiante
   */
  async updateEstudiante(id: number, data: UpdateEstudianteDTO): Promise<boolean> {
    const fields: string[] = [];
    const params: any[] = [];

    if (data.nombres !== undefined) { fields.push('nombres = ?'); params.push(data.nombres.trim()); }
    if (data.canal_id !== undefined) { fields.push('canal_id = ?'); params.push(data.canal_id); }
    if (data.apellidos !== undefined) { fields.push('apellidos = ?'); params.push(data.apellidos.trim()); }
    if (data.dni !== undefined) { fields.push('dni = ?'); params.push(data.dni.trim()); }
    if (data.fecha_nacimiento !== undefined) { fields.push('fecha_nacimiento = ?'); params.push(data.fecha_nacimiento); }
    if (data.telefono !== undefined) { fields.push('telefono = ?'); params.push(data.telefono?.trim() || null); }
    if (data.correo !== undefined) { fields.push('correo = ?'); params.push(data.correo?.trim() || null); }
    if (data.direccion !== undefined) { fields.push('direccion = ?'); params.push(data.direccion?.trim() || null); }
    if (data.estado !== undefined) { fields.push('estado = ?'); params.push(data.estado); }

    if (fields.length === 0) return true;

    params.push(id);
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE Estudiante SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  }

  /**
   * Actualiza el estado del usuario asociado al estudiante (ACTIVO/INACTIVO)
   */
  async updateEstadoUsuario(usuarioId: number, estado: EstadoUsuario): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE Usuario SET estado = ? WHERE id = ?`,
      [estado, usuarioId]
    );
    return result.affectedRows > 0;
  }

  async findChannel(id: number) {
    const [rows] = await pool.execute<RowDataPacket[]>("SELECT id FROM Canal WHERE id = ? AND estado = 'ACTIVO'", [id]);
    return rows.length > 0;
  }

  async updateProfileAndStatus(id: number, usuarioId: number, status: EstadoUsuario, data: UpdateEstudianteDTO = {}) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      let cambiaCanal = false;
      if (data.canal_id !== undefined) {
        const [currentRows] = await connection.execute<RowDataPacket[]>('SELECT canal_id FROM Estudiante WHERE id = ? FOR UPDATE', [id]);
        cambiaCanal = Number(currentRows[0]?.canal_id) !== Number(data.canal_id);
      }
      const fields: string[] = [];
      const values: (string | number | null)[] = [];
      for (const key of ['nombres', 'apellidos', 'dni', 'fecha_nacimiento', 'telefono', 'correo', 'direccion', 'canal_id'] as const) {
        if (data[key] !== undefined) {
          fields.push(`${key} = ?`);
          const value = data[key];
          values.push(typeof value === 'string' ? value.trim() || null : value ?? null);
        }
      }
      fields.push('estado = ?');
      values.push(status);
      values.push(id);
      await connection.execute(`UPDATE Estudiante SET ${fields.join(', ')} WHERE id = ?`, values);
      await connection.execute('UPDATE Usuario SET estado = ? WHERE id = ?', [status, usuarioId]);
      if (status === 'INACTIVO' || cambiaCanal) {
        await connection.execute("UPDATE Matricula SET estado = 'RETIRADA' WHERE estudiante_id = ? AND estado IN ('ACTIVA', 'PENDIENTE_PAGO')", [id]);
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Verifica si el estudiante tiene matrículas ACTIVAS (para bloquear su desactivación)
   */
  async hasMatriculasActivas(estudianteId: number): Promise<boolean> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM Matricula WHERE estudiante_id = ? AND estado = 'ACTIVA'`,
      [estudianteId]
    );
    return Number(rows[0]?.total) > 0;
  }
}

export const estudianteRepository = new EstudianteRepository();
