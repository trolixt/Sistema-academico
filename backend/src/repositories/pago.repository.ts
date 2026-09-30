import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { IPago, IPagoDetalle, CreatePagoDTO, EstadoPago } from '../types';

export class PagoRepository {

  /**
   * Lista pagos con filtros opcionales
   */
  async findAll(filtros?: { matricula_id?: number; estudiante_id?: number; estado?: EstadoPago }): Promise<IPagoDetalle[]> {
    let query = `
      SELECT
        p.id, p.matricula_id, p.concepto, p.monto, p.fecha, p.metodo_pago, p.estado,
        m.codigo_matricula,
        e.id AS estudiante_id, e.nombres AS estudiante_nombres, e.apellidos AS estudiante_apellidos, e.dni AS estudiante_dni,
        c.nombre AS curso_nombre,
        g.nombre AS grupo_nombre,
        ca.nombre AS ciclo_nombre
      FROM Pago p
      INNER JOIN Matricula m ON p.matricula_id = m.id
      INNER JOIN Estudiante e ON m.estudiante_id = e.id
      INNER JOIN Grupo g ON m.grupo_id = g.id
      INNER JOIN Curso c ON g.curso_id = c.id
      INNER JOIN CicloAcademico ca ON m.ciclo_id = ca.id
      WHERE 1 = 1
    `;
    const params: any[] = [];

    if (filtros?.matricula_id) { query += ' AND p.matricula_id = ?'; params.push(filtros.matricula_id); }
    if (filtros?.estudiante_id) { query += ' AND m.estudiante_id = ?'; params.push(filtros.estudiante_id); }
    if (filtros?.estado) { query += ' AND p.estado = ?'; params.push(filtros.estado); }

    query += ' ORDER BY p.id DESC';

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return rows as IPagoDetalle[];
  }

  /**
   * Busca un pago por ID
   */
  async findById(id: number): Promise<IPagoDetalle | null> {
    const query = `
      SELECT
        p.id, p.matricula_id, p.concepto, p.monto, p.fecha, p.metodo_pago, p.estado,
        m.codigo_matricula,
        e.id AS estudiante_id, e.nombres AS estudiante_nombres, e.apellidos AS estudiante_apellidos, e.dni AS estudiante_dni,
        c.nombre AS curso_nombre,
        g.nombre AS grupo_nombre,
        ca.nombre AS ciclo_nombre
      FROM Pago p
      INNER JOIN Matricula m ON p.matricula_id = m.id
      INNER JOIN Estudiante e ON m.estudiante_id = e.id
      INNER JOIN Grupo g ON m.grupo_id = g.id
      INNER JOIN Curso c ON g.curso_id = c.id
      INNER JOIN CicloAcademico ca ON m.ciclo_id = ca.id
      WHERE p.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
    if (rows.length === 0) return null;
    return rows[0] as IPagoDetalle;
  }

  /**
   * Registra un nuevo pago
   */
  async create(data: CreatePagoDTO): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO Pago (matricula_id, concepto, monto, metodo_pago, estado)
       VALUES (?, ?, ?, ?, 'PAGADO')`,
      [data.matricula_id, data.concepto.trim(), data.monto, data.metodo_pago]
    );
    return result.insertId;
  }

  /**
   * Cambia el estado de un pago (PAGADO → ANULADO)
   */
  async cambiarEstado(id: number, estado: EstadoPago): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE Pago SET estado = ? WHERE id = ?`,
      [estado, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Obtiene todos los pagos de una matrícula específica
   */
  async findByMatricula(matriculaId: number): Promise<IPagoDetalle[]> {
    return this.findAll({ matricula_id: matriculaId });
  }
}

export const pagoRepository = new PagoRepository();
