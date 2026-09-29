import pool from '../config/database';
import { RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise';
import { IEstudiante, EstudianteConUsuario, CreateEstudianteDTO, UpdateEstudianteDTO, EstadoUsuario } from '../types';

export class EstudianteRepository {

  /**
   * Lista todos los estudiantes con su estado de cuenta
   */
  async findAll(): Promise<EstudianteConUsuario[]> {
    const query = `
      SELECT e.id, e.usuario_id, e.codigo_estudiante, e.nombres, e.apellidos, e.dni,
             e.fecha_nacimiento, e.telefono, e.correo, e.direccion, e.estado,
             u.nombre_usuario, u.estado AS estado_usuario
      FROM Estudiante e
      INNER JOIN Usuario u ON e.usuario_id = u.id
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
      SELECT e.id, e.usuario_id, e.codigo_estudiante, e.nombres, e.apellidos, e.dni,
             e.fecha_nacimiento, e.telefono, e.correo, e.direccion, e.estado,
             u.nombre_usuario, u.estado AS estado_usuario
      FROM Estudiante e
      INNER JOIN Usuario u ON e.usuario_id = u.id
      WHERE e.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
    if (rows.length === 0) return null;
    return rows[0] as EstudianteConUsuario;
  }

  /**
   * Busca un estudiante por DNI
   */
  async findByDni(dni: string): Promise<IEstudiante | null> {
    const query = `SELECT * FROM Estudiante WHERE dni = ? LIMIT 1`;
    const [rows] = await pool.execute<RowDataPacket[]>(query, [dni]);
    if (rows.length === 0) return null;
    return rows[0] as IEstudiante;
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
      codigo_estudiante: string;
    }
  ): Promise<number> {
    const conn: PoolConnection = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Crear cuenta de usuario
      const [userResult] = await conn.execute<ResultSetHeader>(
        `INSERT INTO Usuario (nombre_usuario, password_hash, rol, estado) VALUES (?, ?, 'ESTUDIANTE', 'ACTIVO')`,
        [data.nombre_usuario, data.password_hash]
      );
      const usuarioId = userResult.insertId;

      // 2. Crear perfil de estudiante
      const [estudianteResult] = await conn.execute<ResultSetHeader>(
        `INSERT INTO Estudiante (usuario_id, codigo_estudiante, nombres, apellidos, dni, fecha_nacimiento, telefono, correo, direccion, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVO')`,
        [
          usuarioId,
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
