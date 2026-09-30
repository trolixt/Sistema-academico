import pool from '../config/database';
import { RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise';
import {
  IMatricula,
  IMatriculaDetalle,
  CreateMatriculaDTO,
  CambiarEstadoMatriculaDTO,
  EstadoMatricula,
  CreatePagoDTO,
  MetodoPago
} from '../types';

export class MatriculaRepository {

  /**
   * Lista todas las matrículas con información completa
   */
  async findAll(filtros?: { estudiante_id?: number; grupo_id?: number; ciclo_id?: number; estado?: EstadoMatricula }): Promise<IMatriculaDetalle[]> {
    let query = `
      SELECT
        m.id, m.codigo_matricula, m.estudiante_id, m.grupo_id, m.ciclo_id, m.estado, m.fecha_registro,
        e.nombres AS estudiante_nombres, e.apellidos AS estudiante_apellidos,
        e.dni AS estudiante_dni, e.codigo_estudiante, e.correo AS estudiante_correo,
        g.nombre AS grupo_nombre, g.curso_id, g.docente_id,
        c.nombre AS curso_nombre,
        ca.nombre AS ciclo_nombre,
        d.nombres AS docente_nombres, d.apellidos AS docente_apellidos
      FROM Matricula m
      INNER JOIN Estudiante e ON m.estudiante_id = e.id
      INNER JOIN Grupo g ON m.grupo_id = g.id
      INNER JOIN Curso c ON g.curso_id = c.id
      INNER JOIN CicloAcademico ca ON m.ciclo_id = ca.id
      INNER JOIN Docente d ON g.docente_id = d.id
      WHERE 1 = 1
    `;
    const params: any[] = [];

    if (filtros?.estudiante_id) { query += ' AND m.estudiante_id = ?'; params.push(filtros.estudiante_id); }
    if (filtros?.grupo_id) { query += ' AND m.grupo_id = ?'; params.push(filtros.grupo_id); }
    if (filtros?.ciclo_id) { query += ' AND m.ciclo_id = ?'; params.push(filtros.ciclo_id); }
    if (filtros?.estado) { query += ' AND m.estado = ?'; params.push(filtros.estado); }

    query += ' ORDER BY m.id DESC';

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return rows as IMatriculaDetalle[];
  }

  /**
   * Busca una matrícula por ID con información completa
   */
  async findById(id: number): Promise<IMatriculaDetalle | null> {
    const query = `
      SELECT
        m.id, m.codigo_matricula, m.estudiante_id, m.grupo_id, m.ciclo_id, m.estado, m.fecha_registro,
        e.nombres AS estudiante_nombres, e.apellidos AS estudiante_apellidos,
        e.dni AS estudiante_dni, e.codigo_estudiante, e.correo AS estudiante_correo,
        g.nombre AS grupo_nombre, g.curso_id, g.docente_id,
        c.nombre AS curso_nombre,
        ca.nombre AS ciclo_nombre,
        d.nombres AS docente_nombres, d.apellidos AS docente_apellidos
      FROM Matricula m
      INNER JOIN Estudiante e ON m.estudiante_id = e.id
      INNER JOIN Grupo g ON m.grupo_id = g.id
      INNER JOIN Curso c ON g.curso_id = c.id
      INNER JOIN CicloAcademico ca ON m.ciclo_id = ca.id
      INNER JOIN Docente d ON g.docente_id = d.id
      WHERE m.id = ?
      LIMIT 1
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
    if (rows.length === 0) return null;
    return rows[0] as IMatriculaDetalle;
  }

  /**
   * Verifica si ya existe una matrícula activa para ese estudiante en el mismo grupo y ciclo
   */
  async findDuplicada(estudianteId: number, grupoId: number, cicloId: number): Promise<IMatricula | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, codigo_matricula, estado FROM Matricula
       WHERE estudiante_id = ? AND grupo_id = ? AND ciclo_id = ?
       LIMIT 1`,
      [estudianteId, grupoId, cicloId]
    );
    return rows.length > 0 ? (rows[0] as IMatricula) : null;
  }

  /**
   * Cuenta las matrículas activas en un grupo para validar vacantes
   */
  async countMatriculasActivasByGrupo(grupoId: number): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM Matricula WHERE grupo_id = ? AND estado = 'ACTIVA'`,
      [grupoId]
    );
    return Number(rows[0]?.total || 0);
  }

  /**
   * Genera el siguiente código de matrícula: MAT-YYYY-NNNN
   */
  async getNextCodigoMatricula(): Promise<string> {
    const anio = new Date().getFullYear();
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT codigo_matricula FROM Matricula WHERE codigo_matricula LIKE ? ORDER BY id DESC LIMIT 1`,
      [`MAT-${anio}-%`]
    );
    if (rows.length === 0) return `MAT-${anio}-0001`;

    const ultimo = rows[0].codigo_matricula as string;
    const partes = ultimo.split('-');
    const siguiente = parseInt(partes[2] || '0', 10) + 1;
    return `MAT-${anio}-${String(siguiente).padStart(4, '0')}`;
  }

  /**
   * Crea la matrícula y opcionalmente el pago inicial en una transacción atómica
   */
  async createWithTransaction(
    data: {
      codigo_matricula: string;
      estudiante_id: number;
      grupo_id: number;
      ciclo_id: number;
    },
    pagoInicial?: {
      concepto: string;
      monto: number;
      metodo_pago: MetodoPago;
    }
  ): Promise<number> {
    const conn: PoolConnection = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.execute<ResultSetHeader>(
        `INSERT INTO Matricula (codigo_matricula, estudiante_id, grupo_id, ciclo_id, estado)
         VALUES (?, ?, ?, ?, 'ACTIVA')`,
        [data.codigo_matricula, data.estudiante_id, data.grupo_id, data.ciclo_id]
      );
      const matriculaId = result.insertId;

      if (pagoInicial) {
        await conn.execute(
          `INSERT INTO Pago (matricula_id, concepto, monto, metodo_pago, estado)
           VALUES (?, ?, ?, ?, 'PAGADO')`,
          [matriculaId, pagoInicial.concepto, pagoInicial.monto, pagoInicial.metodo_pago]
        );
      }

      await conn.commit();
      return matriculaId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Cambia el estado de una matrícula (ACTIVA → CANCELADA | RETIRADA)
   */
  async cambiarEstado(id: number, estado: EstadoMatricula): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE Matricula SET estado = ? WHERE id = ?`,
      [estado, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Obtiene las matrículas de un estudiante específico
   */
  async findByEstudiante(estudianteId: number): Promise<IMatriculaDetalle[]> {
    return this.findAll({ estudiante_id: estudianteId });
  }
}

export const matriculaRepository = new MatriculaRepository();
