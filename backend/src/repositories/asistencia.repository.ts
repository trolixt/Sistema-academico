import pool from '../config/database';
import { ResultSetHeader, RowDataPacket, PoolConnection } from 'mysql2/promise';
import { EstadoAsistencia } from '../types';

export type AsistenciaFiltro = { grupo_id?: number; docente_id?: number };
export type DetalleAsistenciaInput = { estudiante_id: number; estado_asistencia: EstadoAsistencia };

export class AsistenciaRepository {
  async findGroup(grupoId: number, docenteId?: number) {
    const [rows] = await pool.execute<RowDataPacket[]>(`SELECT id, docente_id FROM Grupo WHERE id = ?${docenteId ? ' AND docente_id = ?' : ''}`,
      docenteId ? [grupoId, docenteId] : [grupoId]);
    return rows[0] || null;
  }

  async findSessions(filters: AsistenciaFiltro = {}) {
    let sql = `SELECT sa.id, sa.grupo_id, sa.fecha, sa.estado,
      g.nombre AS grupo_nombre, c.nombre AS curso_nombre,
      d.nombres AS docente_nombres, d.apellidos AS docente_apellidos,
      ca.nombre AS ciclo_nombre,
      COUNT(da.id) AS total_estudiantes,
      COALESCE(SUM(da.estado_asistencia = 'PRESENTE'), 0) AS presentes,
      COALESCE(SUM(da.estado_asistencia = 'AUSENTE'), 0) AS ausentes,
      COALESCE(SUM(da.estado_asistencia = 'TARDANZA'), 0) AS tardanzas,
      COALESCE(SUM(da.estado_asistencia = 'JUSTIFICADO'), 0) AS justificados
      FROM SesionAsistencia sa
      INNER JOIN Grupo g ON g.id = sa.grupo_id
      INNER JOIN Curso c ON c.id = g.curso_id
      INNER JOIN Docente d ON d.id = g.docente_id
      INNER JOIN CicloAcademico ca ON ca.id = g.ciclo_id
      LEFT JOIN DetalleAsistencia da ON da.sesion_asistencia_id = sa.id
      WHERE 1 = 1`;
    const params: number[] = [];
    if (filters.grupo_id) { sql += ' AND sa.grupo_id = ?'; params.push(filters.grupo_id); }
    if (filters.docente_id) { sql += ' AND g.docente_id = ?'; params.push(filters.docente_id); }
    sql += ' GROUP BY sa.id ORDER BY sa.fecha DESC, sa.id DESC';
    const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
    return rows;
  }

  async findById(id: number) {
    const [rows] = await pool.execute<RowDataPacket[]>(`SELECT sa.id, sa.grupo_id, sa.fecha, sa.estado,
      g.nombre AS grupo_nombre, c.nombre AS curso_nombre, g.docente_id,
      d.nombres AS docente_nombres, d.apellidos AS docente_apellidos, ca.nombre AS ciclo_nombre
      FROM SesionAsistencia sa INNER JOIN Grupo g ON g.id = sa.grupo_id
      INNER JOIN Curso c ON c.id = g.curso_id
      INNER JOIN Docente d ON d.id = g.docente_id
      INNER JOIN CicloAcademico ca ON ca.id = g.ciclo_id WHERE sa.id = ?`, [id]);
    return rows[0] || null;
  }

  async findDetails(sessionId: number) {
    const [rows] = await pool.execute<RowDataPacket[]>(`SELECT da.id, da.estudiante_id, da.estado_asistencia,
      e.codigo_estudiante, e.nombres, e.apellidos, e.dni
      FROM DetalleAsistencia da INNER JOIN Estudiante e ON e.id = da.estudiante_id
      WHERE da.sesion_asistencia_id = ? ORDER BY e.apellidos, e.nombres`, [sessionId]);
    return rows;
  }

  async findByStudent(estudianteId: number) {
    const [rows] = await pool.execute<RowDataPacket[]>(`SELECT sa.fecha, da.estado_asistencia,
      c.nombre AS curso_nombre, g.nombre AS grupo_nombre, ca.nombre AS ciclo_nombre,
      d.nombres AS docente_nombres, d.apellidos AS docente_apellidos
      FROM DetalleAsistencia da
      INNER JOIN SesionAsistencia sa ON sa.id = da.sesion_asistencia_id
      INNER JOIN Grupo g ON g.id = sa.grupo_id
      INNER JOIN Curso c ON c.id = g.curso_id
      INNER JOIN Docente d ON d.id = g.docente_id
      INNER JOIN CicloAcademico ca ON ca.id = g.ciclo_id
      WHERE da.estudiante_id = ?
      ORDER BY sa.fecha DESC, c.nombre`, [estudianteId]);
    return rows;
  }

  async findEnrolledStudents(grupoId: number) {
    const [rows] = await pool.execute<RowDataPacket[]>(`SELECT DISTINCT e.id, e.codigo_estudiante, e.nombres, e.apellidos
      FROM Grupo g INNER JOIN Estudiante e ON e.canal_id = g.canal_id
      INNER JOIN Matricula m ON m.estudiante_id = e.id AND m.canal_id = g.canal_id AND m.estado = 'ACTIVA'
      WHERE g.id = ? AND e.estado = 'ACTIVO' ORDER BY e.apellidos, e.nombres`, [grupoId]);
    return rows;
  }

  async openSession(grupoId: number, fecha: string): Promise<number> {
    const connection: PoolConnection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [existing] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM SesionAsistencia WHERE grupo_id = ? AND fecha = ? FOR UPDATE', [grupoId, fecha]);
      if (existing.length) {
        await connection.commit();
        return Number(existing[0].id);
      }
      const [result] = await connection.execute<ResultSetHeader>(
        "INSERT INTO SesionAsistencia (grupo_id, fecha, estado) VALUES (?, ?, 'ABIERTA')", [grupoId, fecha]);
      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async saveDetails(sessionId: number, details: DetalleAsistenciaInput[]) {
    const connection: PoolConnection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const detail of details) {
        await connection.execute(`INSERT INTO DetalleAsistencia (sesion_asistencia_id, estudiante_id, estado_asistencia)
          SELECT ?, e.id, ? FROM Estudiante e
          INNER JOIN SesionAsistencia sa ON sa.id = ?
          INNER JOIN Grupo g ON g.id = sa.grupo_id AND g.canal_id = e.canal_id
          WHERE e.id = ? AND e.estado = 'ACTIVO' AND EXISTS (
            SELECT 1 FROM Matricula m WHERE m.estudiante_id = e.id AND m.canal_id = g.canal_id AND m.estado = 'ACTIVA'
          )
          ON DUPLICATE KEY UPDATE estado_asistencia = VALUES(estado_asistencia)`,
        [sessionId, detail.estado_asistencia, sessionId, detail.estudiante_id]);
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async closeSession(id: number) {
    const [result] = await pool.execute<ResultSetHeader>("UPDATE SesionAsistencia SET estado = 'CERRADA' WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}
export const asistenciaRepository = new AsistenciaRepository();
