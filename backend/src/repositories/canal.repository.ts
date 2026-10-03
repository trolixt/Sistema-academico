import pool from '../config/database';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export class CanalRepository {
  async findAll() {
    const [rows] = await pool.execute<RowDataPacket[]>(`SELECT c.id, c.nombre, c.descripcion, c.color, c.orden, c.estado,
      (SELECT COUNT(*) FROM CanalCurso cc WHERE cc.canal_id = c.id) AS areas_count,
      (SELECT COUNT(*) FROM Estudiante e INNER JOIN Usuario u ON u.id = e.usuario_id
        WHERE e.canal_id = c.id AND e.estado = 'ACTIVO' AND u.estado = 'ACTIVO') AS estudiantes_count
      FROM Canal c ORDER BY c.orden`);
    return rows;
  }

  async findById(id: number) {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT id, nombre, descripcion, color, orden, estado FROM Canal WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async findAreas(canalId: number) {
    const [rows] = await pool.execute<RowDataPacket[]>(`SELECT c.id, c.nombre, c.descripcion, c.estado, cc.orden,
      (SELECT COUNT(DISTINCT g.id) FROM Grupo g WHERE g.curso_id = c.id AND g.canal_id = cc.canal_id AND g.estado = 'ACTIVO') AS grupos_count
      FROM CanalCurso cc INNER JOIN Curso c ON c.id = cc.curso_id
      WHERE cc.canal_id = ? ORDER BY cc.orden, c.nombre`, [canalId]);
    return rows;
  }

  async findStudents(canalId: number) {
    const [rows] = await pool.execute<RowDataPacket[]>(`SELECT DISTINCT e.id, e.usuario_id, e.codigo_estudiante, e.nombres, e.apellidos,
      e.dni, e.fecha_nacimiento, e.telefono, e.correo, e.direccion, e.estado, u.id_acceso, u.nombre_usuario, u.estado AS estado_usuario
      FROM Estudiante e INNER JOIN Usuario u ON u.id = e.usuario_id
      WHERE e.canal_id = ? AND e.estado = 'ACTIVO' AND u.estado = 'ACTIVO'
      ORDER BY e.apellidos, e.nombres`, [canalId]);
    return rows;
  }

  async update(id: number, data: { nombre?: string; descripcion?: string; color?: string; estado?: 'ACTIVO' | 'INACTIVO' }) {
    const fields: string[] = [];
    const values: any[] = [];
    for (const key of ['nombre', 'descripcion', 'color', 'estado'] as const) {
      if (data[key] !== undefined) { fields.push(`${key} = ?`); values.push(data[key]); }
    }
    if (!fields.length) return true;
    values.push(id);
    const [result] = await pool.execute<ResultSetHeader>(`UPDATE Canal SET ${fields.join(', ')} WHERE id = ?`, values);
    return result.affectedRows > 0;
  }

  async replaceAreas(canalId: number, courseIds: number[]) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute('DELETE FROM CanalCurso WHERE canal_id = ?', [canalId]);
      for (const [index, courseId] of courseIds.entries()) {
        await connection.execute('INSERT INTO CanalCurso (canal_id, curso_id, orden) VALUES (?, ?, ?)', [canalId, courseId, index + 1]);
      }
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export const canalRepository = new CanalRepository();
