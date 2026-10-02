import pool from '../config/database';
import { RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise';
import { IPagoDetalle, CreatePagoDTO, EstadoPago } from '../types';
import { crearCalendarioMensual } from '../utils/calendario-cuotas';

const paymentProjection = `
  p.id, p.codigo_pago, p.matricula_id, p.concepto, p.tipo_pago, p.periodo, p.fecha_vencimiento,
  p.monto, p.monto_recibido, p.fecha, p.metodo_pago, p.referencia_operacion,
  CASE WHEN p.estado = 'PENDIENTE' AND p.fecha_vencimiento < CURDATE() THEN 'VENCIDO' ELSE p.estado END AS estado,
  m.codigo_matricula,
  e.id AS estudiante_id, e.nombres AS estudiante_nombres, e.apellidos AS estudiante_apellidos, e.dni AS estudiante_dni,
  c.nombre AS curso_nombre, g.nombre AS grupo_nombre, ca.nombre AS ciclo_nombre`;
const paymentJoins = `
  FROM Pago p INNER JOIN Matricula m ON p.matricula_id = m.id
  INNER JOIN Estudiante e ON m.estudiante_id = e.id
  INNER JOIN Grupo g ON m.grupo_id = g.id
  INNER JOIN Curso c ON g.curso_id = c.id
  INNER JOIN CicloAcademico ca ON m.ciclo_id = ca.id`;

export class PagoRepository {
  async findAll(filtros?: { matricula_id?: number; estudiante_id?: number; estado?: EstadoPago }): Promise<IPagoDetalle[]> {
    let query = `SELECT ${paymentProjection} ${paymentJoins} WHERE 1 = 1`;
    const params: (number | string)[] = [];
    if (filtros?.matricula_id) { query += ' AND p.matricula_id = ?'; params.push(filtros.matricula_id); }
    if (filtros?.estudiante_id) { query += ' AND m.estudiante_id = ?'; params.push(filtros.estudiante_id); }
    if (filtros?.estado === 'VENCIDO') query += " AND p.estado = 'PENDIENTE' AND p.fecha_vencimiento < CURDATE()";
    else if (filtros?.estado) { query += ' AND p.estado = ?'; params.push(filtros.estado); }
    query += ' ORDER BY p.id DESC';
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return rows as IPagoDetalle[];
  }

  async findById(id: number): Promise<IPagoDetalle | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(`SELECT ${paymentProjection} ${paymentJoins} WHERE p.id = ? LIMIT 1`, [id]);
    return rows.length ? rows[0] as IPagoDetalle : null;
  }

  async findByCode(codigo: string): Promise<IPagoDetalle | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(`SELECT ${paymentProjection} ${paymentJoins} WHERE p.codigo_pago = ? LIMIT 1`, [codigo]);
    return rows.length ? rows[0] as IPagoDetalle : null;
  }

  async registrar(data: CreatePagoDTO): Promise<boolean> {
    const connection: PoolConnection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT p.id, p.matricula_id, p.tipo_pago, p.monto, p.estado, m.estado AS estado_matricula,
          m.monto_mensualidad, ca.fecha_inicio
         FROM Pago p INNER JOIN Matricula m ON m.id = p.matricula_id
         INNER JOIN CicloAcademico ca ON ca.id = m.ciclo_id
         WHERE p.codigo_pago = ? FOR UPDATE`, [data.codigo_pago]);
      if (!rows.length || rows[0].estado !== 'PENDIENTE'
        || Number(rows[0].monto) !== Number(data.monto_recibido)
        || (rows[0].tipo_pago === 'MATRICULA' && rows[0].estado_matricula !== 'PENDIENTE_PAGO')
        || (rows[0].tipo_pago !== 'MATRICULA' && rows[0].estado_matricula !== 'ACTIVA')) {
        await connection.rollback();
        return false;
      }
      const payment = rows[0];
      const [result] = await connection.execute<ResultSetHeader>(
        `UPDATE Pago SET metodo_pago = ?, referencia_operacion = ?, monto_recibido = ?,
          estado = 'PAGADO', fecha = CURRENT_TIMESTAMP WHERE id = ? AND estado = 'PENDIENTE'`,
        [data.metodo_pago, data.referencia_operacion?.trim() || null, data.monto_recibido, payment.id]);
      if (!result.affectedRows) { await connection.rollback(); return false; }
      if (payment.tipo_pago === 'MATRICULA') {
        await connection.execute("UPDATE Matricula SET estado = 'ACTIVA' WHERE id = ? AND estado = 'PENDIENTE_PAGO'", [payment.matricula_id]);
        await this.crearMensualidades(connection, Number(payment.matricula_id), Number(payment.monto_mensualidad), payment.fecha_inicio);
      }
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally { connection.release(); }
  }

  private async assignCode(connection: PoolConnection, id: number): Promise<void> {
    await connection.execute('UPDATE Pago SET codigo_pago = ? WHERE id = ?', [`SA-${String(id).padStart(10, '0')}`, id]);
  }

  async crearMensualidades(connection: PoolConnection, matriculaId: number, monto: number, inicioCiclo: string | Date): Promise<void> {
    for (const cuota of crearCalendarioMensual(inicioCiclo)) {
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO Pago (matricula_id, concepto, tipo_pago, periodo, fecha_vencimiento, monto, metodo_pago, estado)
         SELECT ?, ?, 'MENSUALIDAD', ?, ?, ?, NULL, 'PENDIENTE'
         WHERE NOT EXISTS (SELECT 1 FROM Pago WHERE matricula_id = ? AND tipo_pago = 'MENSUALIDAD' AND periodo = ?)`,
        [matriculaId, `Mensualidad — ${cuota.periodo}`, cuota.periodo, cuota.vencimiento, monto, matriculaId, cuota.periodo]);
      if (result.insertId) await this.assignCode(connection, result.insertId);
    }
  }

  async cambiarEstado(id: number, estado: EstadoPago): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>('UPDATE Pago SET estado = ? WHERE id = ?', [estado, id]);
    return result.affectedRows > 0;
  }

  async findByMatricula(matriculaId: number): Promise<IPagoDetalle[]> {
    return this.findAll({ matricula_id: matriculaId });
  }
}

export const pagoRepository = new PagoRepository();
