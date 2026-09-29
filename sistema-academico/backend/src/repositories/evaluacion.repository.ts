import pool from '../config/database';
import { RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise';
import { EstadoEvaluacion } from '../types';

export interface IEvaluacion {
  id: number;
  grupo_id: number;
  nombre_evaluacion: string;
  fecha: string;
  estado: EstadoEvaluacion;
}

export interface IEvaluacionDetalle extends IEvaluacion {
  grupo_nombre: string;
  curso_nombre: string;
  docente_nombres: string;
  docente_apellidos: string;
  ciclo_nombre: string;
  total_notas?: number;
}

export interface IDetalleNota {
  id: number;
  evaluacion_id: number;
  estudiante_id: number;
  valor_nota: number;
  estudiante_nombres?: string;
  estudiante_apellidos?: string;
  estudiante_dni?: string;
  codigo_estudiante?: string;
}

export interface CreateEvaluacionDTO {
  grupo_id: number;
  nombre_evaluacion: string;
  fecha: string;
}

export interface UpdateEvaluacionDTO {
  nombre_evaluacion?: string;
  fecha?: string;
  estado?: EstadoEvaluacion;
}

export interface RegistrarNotaDTO {
  estudiante_id: number;
  valor_nota: number;
}

export class EvaluacionRepository {

  /**
   * Lista evaluaciones con información del grupo y curso
   */
  async findAll(filtros?: { grupo_id?: number; estado?: EstadoEvaluacion }): Promise<IEvaluacionDetalle[]> {
    let query = `
      SELECT
        ev.id, ev.grupo_id, ev.nombre_evaluacion, ev.fecha, ev.estado,
        g.nombre AS grupo_nombre,
        c.nombre AS curso_nombre,
        d.nombres AS docente_nombres, d.apellidos AS docente_apellidos,
        ca.nombre AS ciclo_nombre,
        COUNT(dn.id) AS total_notas
      FROM EvaluacionNotas ev
      INNER JOIN Grupo g ON ev.grupo_id = g.id
      INNER JOIN Curso c ON g.curso_id = c.id
      INNER JOIN Docente d ON g.docente_id = d.id
      INNER JOIN CicloAcademico ca ON g.ciclo_id = ca.id
      LEFT JOIN DetalleNota dn ON ev.id = dn.evaluacion_id
      WHERE 1 = 1
    `;
    const params: any[] = [];

    if (filtros?.grupo_id) { query += ' AND ev.grupo_id = ?'; params.push(filtros.grupo_id); }
    if (filtros?.estado) { query += ' AND ev.estado = ?'; params.push(filtros.estado); }

    query += ' GROUP BY ev.id ORDER BY ev.fecha DESC';

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return rows as IEvaluacionDetalle[];
  }

  /**
   * Busca una evaluación por ID
   */
  async findById(id: number): Promise<IEvaluacionDetalle | null> {
    const query = `
      SELECT
        ev.id, ev.grupo_id, ev.nombre_evaluacion, ev.fecha, ev.estado,
        g.nombre AS grupo_nombre,
        c.nombre AS curso_nombre,
        d.nombres AS docente_nombres, d.apellidos AS docente_apellidos,
        ca.nombre AS ciclo_nombre,
        COUNT(dn.id) AS total_notas
      FROM EvaluacionNotas ev
      INNER JOIN Grupo g ON ev.grupo_id = g.id
      INNER JOIN Curso c ON g.curso_id = c.id
      INNER JOIN Docente d ON g.docente_id = d.id
      INNER JOIN CicloAcademico ca ON g.ciclo_id = ca.id
      LEFT JOIN DetalleNota dn ON ev.id = dn.evaluacion_id
      WHERE ev.id = ?
      GROUP BY ev.id
      LIMIT 1
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
    if (rows.length === 0) return null;
    return rows[0] as IEvaluacionDetalle;
  }

  /**
   * Crea una nueva evaluación
   */
  async create(data: CreateEvaluacionDTO): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO EvaluacionNotas (grupo_id, nombre_evaluacion, fecha, estado) VALUES (?, ?, ?, 'BORRADOR')`,
      [data.grupo_id, data.nombre_evaluacion.trim(), data.fecha]
    );
    return result.insertId;
  }

  /**
   * Actualiza una evaluación
   */
  async update(id: number, data: UpdateEvaluacionDTO): Promise<boolean> {
    const fields: string[] = [];
    const params: any[] = [];

    if (data.nombre_evaluacion !== undefined) { fields.push('nombre_evaluacion = ?'); params.push(data.nombre_evaluacion.trim()); }
    if (data.fecha !== undefined) { fields.push('fecha = ?'); params.push(data.fecha); }
    if (data.estado !== undefined) { fields.push('estado = ?'); params.push(data.estado); }

    if (fields.length === 0) return true;
    params.push(id);

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE EvaluacionNotas SET ${fields.join(', ')} WHERE id = ?`,
      params
    );
    return result.affectedRows > 0;
  }

  /**
   * Elimina una evaluación (y en cascada sus notas)
   */
  async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      `DELETE FROM EvaluacionNotas WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Obtiene todas las notas de una evaluación
   */
  async findNotasByEvaluacion(evaluacionId: number): Promise<IDetalleNota[]> {
    const query = `
      SELECT
        dn.id, dn.evaluacion_id, dn.estudiante_id, dn.valor_nota,
        e.nombres AS estudiante_nombres, e.apellidos AS estudiante_apellidos,
        e.dni AS estudiante_dni, e.codigo_estudiante
      FROM DetalleNota dn
      INNER JOIN Estudiante e ON dn.estudiante_id = e.id
      WHERE dn.evaluacion_id = ?
      ORDER BY e.apellidos ASC, e.nombres ASC
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query, [evaluacionId]);
    return rows as IDetalleNota[];
  }

  /**
   * Registra o actualiza la nota de un estudiante en una evaluación (UPSERT)
   */
  async upsertNota(evaluacionId: number, estudianteId: number, valorNota: number): Promise<void> {
    await pool.execute(
      `INSERT INTO DetalleNota (evaluacion_id, estudiante_id, valor_nota)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE valor_nota = VALUES(valor_nota)`,
      [evaluacionId, estudianteId, valorNota]
    );
  }

  /**
   * Registra las notas de múltiples estudiantes en transacción
   */
  async registrarNotasEnBloque(evaluacionId: number, notas: RegistrarNotaDTO[]): Promise<void> {
    const conn: PoolConnection = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const nota of notas) {
        await conn.execute(
          `INSERT INTO DetalleNota (evaluacion_id, estudiante_id, valor_nota)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE valor_nota = VALUES(valor_nota)`,
          [evaluacionId, nota.estudiante_id, nota.valor_nota]
        );
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Elimina la nota de un estudiante en una evaluación
   */
  async deleteNota(evaluacionId: number, estudianteId: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      `DELETE FROM DetalleNota WHERE evaluacion_id = ? AND estudiante_id = ?`,
      [evaluacionId, estudianteId]
    );
    return result.affectedRows > 0;
  }
}

export const evaluacionRepository = new EvaluacionRepository();
