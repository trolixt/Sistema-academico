import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import {
  ICurso,
  CreateCursoDTO,
  UpdateCursoDTO,
  ICicloAcademico,
  CreateCicloDTO,
  UpdateCicloDTO,
  IGrupo,
  CreateGrupoDTO,
  UpdateGrupoDTO,
  IGrupoDetalle,
  FiltrosGrupoDTO,
  IHorario,
  CreateHorarioDTO,
  UpdateHorarioDTO,
  IExcepcionHorario,
  DiaSemana
} from '../types';

export class AcademicoRepository {
  async findCanal(id: number) {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT id, estado FROM Canal WHERE id = ?', [id]);
    return rows[0] || null;
  }

  async isCursoInCanal(canalId: number, cursoId: number) {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT 1 FROM CanalCurso WHERE canal_id = ? AND curso_id = ? LIMIT 1', [canalId, cursoId]);
    return rows.length > 0;
  }

  // ==========================================
  // 1. CURSOS
  // ==========================================

  /**
   * Obtiene la lista de cursos (opcionalmente solo los activos)
   */
  async findCursos(soloActivos: boolean = false): Promise<ICurso[]> {
    let query = 'SELECT id, nombre, descripcion, estado FROM Curso';
    const params: any[] = [];

    if (soloActivos) {
      query += ' WHERE estado = ?';
      params.push('ACTIVO');
    }

    query += ' ORDER BY nombre ASC';
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return rows as ICurso[];
  }

  /**
   * Busca un curso por su ID
   */
  async findCursoById(id: number): Promise<ICurso | null> {
    const query = 'SELECT id, nombre, descripcion, estado FROM Curso WHERE id = ? LIMIT 1';
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
    if (rows.length === 0) return null;
    return rows[0] as ICurso;
  }

  async findCursoByName(name: string): Promise<ICurso | null> {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT id, nombre, descripcion, estado FROM Curso WHERE LOWER(nombre) = LOWER(?) LIMIT 1', [name.trim()]);
    return rows[0] ? rows[0] as ICurso : null;
  }

  /**
   * Inserta un nuevo curso
   */
  async createCurso(data: CreateCursoDTO): Promise<number> {
    const query = `
      INSERT INTO Curso (nombre, descripcion, estado)
      VALUES (?, ?, 'ACTIVO')
    `;
    const [result] = await pool.execute<ResultSetHeader>(query, [
      data.nombre.trim(),
      data.descripcion?.trim() || null
    ]);
    return result.insertId;
  }

  /**
   * Actualiza los datos de un curso
   */
  async updateCurso(id: number, data: UpdateCursoDTO): Promise<boolean> {
    const fields: string[] = [];
    const params: any[] = [];

    if (data.nombre !== undefined) {
      fields.push('nombre = ?');
      params.push(data.nombre.trim());
    }
    if (data.descripcion !== undefined) {
      fields.push('descripcion = ?');
      params.push(data.descripcion ? data.descripcion.trim() : null);
    }
    if (data.estado !== undefined) {
      fields.push('estado = ?');
      params.push(data.estado);
    }

    if (fields.length === 0) return true;

    params.push(id);
    const query = `UPDATE Curso SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute<ResultSetHeader>(query, params);
    return result.affectedRows > 0;
  }

  /**
   * Desactiva lógicamente un curso
   */
  async deleteCursoLogico(id: number): Promise<boolean> {
    const query = "UPDATE Curso SET estado = 'INACTIVO' WHERE id = ?";
    const [result] = await pool.execute<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  }

  // ==========================================
  // 2. CICLOS ACADÉMICOS
  // ==========================================

  /**
   * Obtiene la lista de ciclos académicos
   */
  async findCiclos(soloActivos: boolean = false): Promise<ICicloAcademico[]> {
    let query = 'SELECT id, nombre, fecha_inicio, fecha_fin, estado FROM CicloAcademico';
    const params: any[] = [];

    if (soloActivos) {
      query += ' WHERE estado = ?';
      params.push('ACTIVO');
    }

    query += ' ORDER BY fecha_inicio DESC';
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return rows as ICicloAcademico[];
  }

  /**
   * Busca un ciclo académico por su ID
   */
  async findCicloById(id: number): Promise<ICicloAcademico | null> {
    const query = 'SELECT id, nombre, fecha_inicio, fecha_fin, estado FROM CicloAcademico WHERE id = ? LIMIT 1';
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
    if (rows.length === 0) return null;
    return rows[0] as ICicloAcademico;
  }

  /**
   * Crea un nuevo ciclo académico
   */
  async createCiclo(data: CreateCicloDTO): Promise<number> {
    const query = `
      INSERT INTO CicloAcademico (nombre, fecha_inicio, fecha_fin, estado)
      VALUES (?, ?, ?, 'ACTIVO')
    `;
    const [result] = await pool.execute<ResultSetHeader>(query, [
      data.nombre.trim(),
      data.fecha_inicio,
      data.fecha_fin
    ]);
    return result.insertId;
  }

  /**
   * Actualiza un ciclo académico
   */
  async updateCiclo(id: number, data: UpdateCicloDTO): Promise<boolean> {
    const fields: string[] = [];
    const params: any[] = [];

    if (data.nombre !== undefined) {
      fields.push('nombre = ?');
      params.push(data.nombre.trim());
    }
    if (data.fecha_inicio !== undefined) {
      fields.push('fecha_inicio = ?');
      params.push(data.fecha_inicio);
    }
    if (data.fecha_fin !== undefined) {
      fields.push('fecha_fin = ?');
      params.push(data.fecha_fin);
    }
    if (data.estado !== undefined) {
      fields.push('estado = ?');
      params.push(data.estado);
    }

    if (fields.length === 0) return true;

    params.push(id);
    const query = `UPDATE CicloAcademico SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute<ResultSetHeader>(query, params);
    return result.affectedRows > 0;
  }

  /**
   * Desactiva lógicamente un ciclo académico
   */
  async deleteCicloLogico(id: number): Promise<boolean> {
    const query = "UPDATE CicloAcademico SET estado = 'INACTIVO' WHERE id = ?";
    const [result] = await pool.execute<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  }

  // ==========================================
  // 3. GRUPOS
  // ==========================================

  /**
   * Lista todos los grupos con detalle del curso, docente, ciclo,
   * total de matrículas activas y vacantes disponibles en tiempo real.
   */
  async findGrupos(filtros?: FiltrosGrupoDTO): Promise<IGrupoDetalle[]> {
    let query = `
      SELECT 
        g.id, g.nombre, g.curso_id, g.canal_id, g.docente_id, g.ciclo_id, g.capacidad, g.estado,
        c.nombre AS curso_nombre, c.descripcion AS curso_descripcion,
        canal.nombre AS canal_nombre,
        d.nombres AS docente_nombres, d.apellidos AS docente_apellidos, d.codigo_docente AS docente_codigo,
        ca.nombre AS ciclo_nombre, DATE_FORMAT(ca.fecha_inicio, '%Y-%m-%d') AS ciclo_fecha_inicio, DATE_FORMAT(ca.fecha_fin, '%Y-%m-%d') AS ciclo_fecha_fin,
        CAST(COALESCE(m.matriculados_count, 0) AS SIGNED) AS matriculados_count,
        CAST((g.capacidad - COALESCE(m.matriculados_count, 0)) AS SIGNED) AS vacantes_disponibles
      FROM Grupo g
      INNER JOIN Curso c ON g.curso_id = c.id
      INNER JOIN Canal canal ON g.canal_id = canal.id
      INNER JOIN Docente d ON g.docente_id = d.id
      INNER JOIN CicloAcademico ca ON g.ciclo_id = ca.id
      LEFT JOIN (
        SELECT canal_id, COUNT(DISTINCT estudiante_id) AS matriculados_count
        FROM Matricula
        WHERE estado = 'ACTIVA'
        GROUP BY canal_id
      ) m ON g.canal_id = m.canal_id
      WHERE 1 = 1
    `;

    const params: any[] = [];

    if (filtros?.ciclo_id) {
      query += ' AND g.ciclo_id = ?';
      params.push(filtros.ciclo_id);
    }
    if (filtros?.curso_id) {
      query += ' AND g.curso_id = ?';
      params.push(filtros.curso_id);
    }
    if (filtros?.canal_id) {
      query += ' AND g.canal_id = ?';
      params.push(filtros.canal_id);
    }
    if (filtros?.docente_id) {
      query += ' AND g.docente_id = ?';
      params.push(filtros.docente_id);
    }
    if (filtros?.estudiante_id) {
      query += ` AND EXISTS (SELECT 1 FROM Matricula m2 WHERE m2.canal_id = g.canal_id AND m2.estudiante_id = ? AND m2.estado = 'ACTIVA')`;
      params.push(filtros.estudiante_id);
    }
    if (filtros?.soloActivos) {
      query += " AND g.estado = 'ACTIVO'";
    }

    query += ' ORDER BY g.id DESC';

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return rows as IGrupoDetalle[];
  }

  /**
   * Busca un grupo específico por ID con toda su información detallada
   */
  async findGrupoById(id: number): Promise<IGrupoDetalle | null> {
    const query = `
      SELECT 
        g.id, g.nombre, g.curso_id, g.canal_id, g.docente_id, g.ciclo_id, g.capacidad, g.estado,
        c.nombre AS curso_nombre, c.descripcion AS curso_descripcion,
        canal.nombre AS canal_nombre,
        d.nombres AS docente_nombres, d.apellidos AS docente_apellidos, d.codigo_docente AS docente_codigo,
        ca.nombre AS ciclo_nombre, DATE_FORMAT(ca.fecha_inicio, '%Y-%m-%d') AS ciclo_fecha_inicio, DATE_FORMAT(ca.fecha_fin, '%Y-%m-%d') AS ciclo_fecha_fin,
        CAST(COALESCE(m.matriculados_count, 0) AS SIGNED) AS matriculados_count,
        CAST((g.capacidad - COALESCE(m.matriculados_count, 0)) AS SIGNED) AS vacantes_disponibles
      FROM Grupo g
      INNER JOIN Curso c ON g.curso_id = c.id
      INNER JOIN Canal canal ON g.canal_id = canal.id
      INNER JOIN Docente d ON g.docente_id = d.id
      INNER JOIN CicloAcademico ca ON g.ciclo_id = ca.id
      LEFT JOIN (
        SELECT canal_id, COUNT(DISTINCT estudiante_id) AS matriculados_count
        FROM Matricula
        WHERE estado = 'ACTIVA'
        GROUP BY canal_id
      ) m ON g.canal_id = m.canal_id
      WHERE g.id = ?
      LIMIT 1
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
    if (rows.length === 0) return null;
    return rows[0] as IGrupoDetalle;
  }

  /**
   * Crea un nuevo grupo
   */
  async createGrupo(data: CreateGrupoDTO): Promise<number> {
    const query = `
      INSERT INTO Grupo (nombre, curso_id, canal_id, docente_id, ciclo_id, capacidad, estado)
      VALUES (?, ?, ?, ?, ?, ?, 'ACTIVO')
    `;
    const [result] = await pool.execute<ResultSetHeader>(query, [
      data.nombre.trim(),
      data.curso_id,
      data.canal_id,
      data.docente_id,
      data.ciclo_id,
      data.capacidad !== undefined ? data.capacidad : 30
    ]);
    return result.insertId;
  }

  /**
   * Actualiza datos de un grupo
   */
  async updateGrupo(id: number, data: UpdateGrupoDTO): Promise<boolean> {
    const fields: string[] = [];
    const params: any[] = [];

    if (data.nombre !== undefined) {
      fields.push('nombre = ?');
      params.push(data.nombre.trim());
    }
    if (data.curso_id !== undefined) {
      fields.push('curso_id = ?');
      params.push(data.curso_id);
    }
    if (data.canal_id !== undefined) {
      fields.push('canal_id = ?');
      params.push(data.canal_id);
    }
    if (data.docente_id !== undefined) {
      fields.push('docente_id = ?');
      params.push(data.docente_id);
    }
    if (data.ciclo_id !== undefined) {
      fields.push('ciclo_id = ?');
      params.push(data.ciclo_id);
    }
    if (data.capacidad !== undefined) {
      fields.push('capacidad = ?');
      params.push(data.capacidad);
    }
    if (data.estado !== undefined) {
      fields.push('estado = ?');
      params.push(data.estado);
    }

    if (fields.length === 0) return true;

    params.push(id);
    const query = `UPDATE Grupo SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute<ResultSetHeader>(query, params);
    return result.affectedRows > 0;
  }

  /**
   * Desactiva lógicamente un grupo
   */
  async deleteGrupoLogico(id: number): Promise<boolean> {
    const query = "UPDATE Grupo SET estado = 'INACTIVO' WHERE id = ?";
    const [result] = await pool.execute<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  }

  /**
   * Cuenta las matrículas activas en un grupo
   */
  async countMatriculasActivasByGrupo(grupoId: number): Promise<number> {
    const query = "SELECT COUNT(*) AS total FROM Matricula WHERE grupo_id = ? AND estado = 'ACTIVA'";
    const [rows] = await pool.execute<RowDataPacket[]>(query, [grupoId]);
    return rows[0]?.total ? Number(rows[0].total) : 0;
  }

  // ==========================================
  // 4. HORARIOS
  // ==========================================

  /**
   * Obtiene todos los horarios configurados para un grupo
   */
  async findHorariosByGrupo(grupoId: number): Promise<IHorario[]> {
    const query = `
      SELECT id, grupo_id, dia_semana, hora_inicio, hora_fin, aula, DATE_FORMAT(fecha_inicio, '%Y-%m-%d') AS fecha_inicio, DATE_FORMAT(fecha_fin, '%Y-%m-%d') AS fecha_fin
      FROM Horario
      WHERE grupo_id = ?
      ORDER BY FIELD(dia_semana, 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'), hora_inicio ASC
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query, [grupoId]);
    return rows as IHorario[];
  }

  /**
   * Busca un horario específico por ID
   */
  async findHorarioById(id: number): Promise<IHorario | null> {
    const query = "SELECT id, grupo_id, dia_semana, hora_inicio, hora_fin, aula, DATE_FORMAT(fecha_inicio, '%Y-%m-%d') AS fecha_inicio, DATE_FORMAT(fecha_fin, '%Y-%m-%d') AS fecha_fin FROM Horario WHERE id = ? LIMIT 1";
    const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
    if (rows.length === 0) return null;
    return rows[0] as IHorario;
  }

  /**
   * Registra un nuevo horario para un grupo
   */
  async createHorario(data: CreateHorarioDTO): Promise<number> {
    const query = `
      INSERT INTO Horario (grupo_id, dia_semana, hora_inicio, hora_fin, aula, fecha_inicio, fecha_fin)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute<ResultSetHeader>(query, [
      data.grupo_id,
      data.dia_semana,
      data.hora_inicio,
      data.hora_fin,
      data.aula.trim(),
      data.fecha_inicio ?? null,
      data.fecha_fin ?? null
    ]);
    return result.insertId;
  }

  async updateHorario(id: number, data: UpdateHorarioDTO): Promise<boolean> {
    const fields: string[] = [];
    const params: any[] = [];
    if (data.grupo_id !== undefined) { fields.push('grupo_id = ?'); params.push(data.grupo_id); }
    if (data.dia_semana !== undefined) { fields.push('dia_semana = ?'); params.push(data.dia_semana); }
    if (data.hora_inicio !== undefined) { fields.push('hora_inicio = ?'); params.push(data.hora_inicio); }
    if (data.hora_fin !== undefined) { fields.push('hora_fin = ?'); params.push(data.hora_fin); }
    if (data.aula !== undefined) { fields.push('aula = ?'); params.push(data.aula.trim()); }
    if (data.fecha_inicio !== undefined) { fields.push('fecha_inicio = ?'); params.push(data.fecha_inicio); }
    if (data.fecha_fin !== undefined) { fields.push('fecha_fin = ?'); params.push(data.fecha_fin); }
    if (fields.length === 0) return true;
    params.push(id);
    const [result] = await pool.execute<ResultSetHeader>(`UPDATE Horario SET ${fields.join(', ')} WHERE id = ?`, params);
    return result.affectedRows > 0;
  }

  /**
   * Elimina un horario
   */
  async deleteHorario(id: number): Promise<boolean> {
    const query = 'DELETE FROM Horario WHERE id = ?';
    const [result] = await pool.execute<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  }

  /**
   * Valida si el docente asignado tiene colisión de horarios con otro grupo en el mismo día y bloque horario
   */
  async checkCrucesHorarioDocente(
    docenteId: number,
    diaSemana: DiaSemana,
    horaInicio: string,
    horaFin: string,
    excludeGrupoId?: number,
    excludeHorarioId?: number,
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<any | null> {
    let query = `
      SELECT h.*, g.nombre AS grupo_nombre, c.nombre AS curso_nombre
      FROM Horario h
      INNER JOIN Grupo g ON h.grupo_id = g.id
      INNER JOIN Curso c ON g.curso_id = c.id
      INNER JOIN CicloAcademico ca ON g.ciclo_id = ca.id
      WHERE g.docente_id = ?
        AND g.estado = 'ACTIVO'
        AND h.dia_semana = ?
        AND (h.hora_inicio < ? AND h.hora_fin > ?)
        AND COALESCE(h.fecha_inicio, ca.fecha_inicio) <= ?
        AND COALESCE(h.fecha_fin, ca.fecha_fin) >= ?
    `;
    const params: any[] = [docenteId, diaSemana, horaFin, horaInicio, fechaFin ?? '9999-12-31', fechaInicio ?? '1000-01-01'];

    if (excludeGrupoId) {
      query += ' AND g.id != ?';
      params.push(excludeGrupoId);
    }
    if (excludeHorarioId) {
      query += ' AND h.id != ?';
      params.push(excludeHorarioId);
    }

    query += ' LIMIT 1';

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Valida si la misma aula está ocupada por otro grupo en el mismo día y bloque horario
   */
  async checkCrucesHorarioAula(
    aula: string,
    diaSemana: DiaSemana,
    horaInicio: string,
    horaFin: string,
    excludeGrupoId?: number,
    excludeHorarioId?: number,
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<any | null> {
    let query = `
      SELECT h.*, g.nombre AS grupo_nombre, c.nombre AS curso_nombre
      FROM Horario h
      INNER JOIN Grupo g ON h.grupo_id = g.id
      INNER JOIN Curso c ON g.curso_id = c.id
      INNER JOIN CicloAcademico ca ON g.ciclo_id = ca.id
      WHERE LOWER(h.aula) = LOWER(?)
        AND g.estado = 'ACTIVO'
        AND h.dia_semana = ?
        AND (h.hora_inicio < ? AND h.hora_fin > ?)
        AND COALESCE(h.fecha_inicio, ca.fecha_inicio) <= ?
        AND COALESCE(h.fecha_fin, ca.fecha_fin) >= ?
    `;
    const params: any[] = [aula.trim(), diaSemana, horaFin, horaInicio, fechaFin ?? '9999-12-31', fechaInicio ?? '1000-01-01'];

    if (excludeGrupoId) {
      query += ' AND g.id != ?';
      params.push(excludeGrupoId);
    }
    if (excludeHorarioId) {
      query += ' AND h.id != ?';
      params.push(excludeHorarioId);
    }

    query += ' LIMIT 1';

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return rows.length > 0 ? rows[0] : null;
  }

  async checkCrucesHorarioCanal(canalId: number, diaSemana: DiaSemana, horaInicio: string, horaFin: string, fechaInicio: string, fechaFin: string, excludeHorarioId?: number): Promise<any | null> {
    let query = `
      SELECT h.*, g.nombre AS grupo_nombre, c.nombre AS curso_nombre
      FROM Horario h
      INNER JOIN Grupo g ON h.grupo_id = g.id
      INNER JOIN Curso c ON g.curso_id = c.id
      INNER JOIN CicloAcademico ca ON g.ciclo_id = ca.id
      WHERE g.canal_id = ? AND g.estado = 'ACTIVO' AND h.dia_semana = ?
        AND (h.hora_inicio < ? AND h.hora_fin > ?)
        AND COALESCE(h.fecha_inicio, ca.fecha_inicio) <= ?
        AND COALESCE(h.fecha_fin, ca.fecha_fin) >= ?
    `;
    const params: any[] = [canalId, diaSemana, horaFin, horaInicio, fechaFin, fechaInicio];
    if (excludeHorarioId) { query += ' AND h.id != ?'; params.push(excludeHorarioId); }
    query += ' LIMIT 1';
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return rows.length ? rows[0] : null;
  }

  async findExcepcionesHorario(canalId?: number): Promise<IExcepcionHorario[]> {
    let query = "SELECT id, canal_id, DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha, motivo FROM ExcepcionHorario";
    const params: number[] = [];
    if (canalId) { query += ' WHERE canal_id = ?'; params.push(canalId); }
    query += ' ORDER BY fecha ASC';
    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    return rows as IExcepcionHorario[];
  }

  async createExcepcionHorario(canalId: number, fecha: string, motivo: string): Promise<IExcepcionHorario> {
    const [result] = await pool.execute<ResultSetHeader>('INSERT INTO ExcepcionHorario (canal_id, fecha, motivo) VALUES (?, ?, ?)', [canalId, fecha, motivo.trim()]);
    const [rows] = await pool.execute<RowDataPacket[]>("SELECT id, canal_id, DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha, motivo FROM ExcepcionHorario WHERE id = ?", [result.insertId]);
    return rows[0] as IExcepcionHorario;
  }

  async deleteExcepcionHorario(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>('DELETE FROM ExcepcionHorario WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export const academicoRepository = new AcademicoRepository();
