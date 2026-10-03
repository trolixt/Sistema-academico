import pool from '../config/database';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export class SimulacroRepository {
  async findByStudent(estudianteId: number) {
    const [rows] = await pool.execute<RowDataPacket[]>(`SELECT r.id AS resultado_id, r.estudiante_id, r.simulacro_id,
      r.puntaje, r.observacion, r.fecha_registro, s.nombre, s.fecha, s.puntaje_maximo, s.estado, s.canal_id, c.nombre AS canal_nombre
      FROM ResultadoSimulacro r INNER JOIN Simulacro s ON s.id = r.simulacro_id
      INNER JOIN Canal c ON c.id = s.canal_id WHERE r.estudiante_id = ? ORDER BY s.fecha DESC, r.id DESC`, [estudianteId]);
    return rows;
  }

  async create(canalId: number, data: { nombre: string; fecha: string; puntaje_maximo?: number }) {
    const [result] = await pool.execute<ResultSetHeader>(`INSERT INTO Simulacro (canal_id, nombre, fecha, puntaje_maximo, estado)
      VALUES (?, ?, ?, ?, 'REALIZADO')`, [canalId, data.nombre.trim(), data.fecha, data.puntaje_maximo || 600]);
    return result.insertId;
  }

  async saveResult(simulacroId: number, estudianteId: number, puntaje: number, observacion?: string) {
    await pool.execute(`INSERT INTO ResultadoSimulacro (simulacro_id, estudiante_id, puntaje, observacion)
      VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE puntaje = VALUES(puntaje), observacion = VALUES(observacion), fecha_registro = CURRENT_TIMESTAMP`,
      [simulacroId, estudianteId, puntaje, observacion?.trim() || null]);
    const [rows] = await pool.execute<RowDataPacket[]>(`SELECT id AS resultado_id, estudiante_id, simulacro_id, puntaje, observacion, fecha_registro
      FROM ResultadoSimulacro WHERE simulacro_id = ? AND estudiante_id = ?`, [simulacroId, estudianteId]);
    return rows[0];
  }

  async findExam(id: number) {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT id, canal_id, nombre, fecha, puntaje_maximo, estado FROM Simulacro WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async isStudentInChannel(estudianteId: number, canalId: number) {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT 1 FROM Estudiante WHERE canal_id = ? AND id = ? LIMIT 1', [canalId, estudianteId]);
    return rows.length > 0;
  }
}

export const simulacroRepository = new SimulacroRepository();
