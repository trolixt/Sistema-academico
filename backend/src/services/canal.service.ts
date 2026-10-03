import { canalRepository, CanalRepository } from '../repositories/canal.repository';

export class CanalService {
  constructor(private repo: CanalRepository = canalRepository) {}

  async getCanales() { return this.repo.findAll(); }

  async getCanal(id: number) {
    if (!Number.isInteger(id) || id < 1 || id > 4) throw this.error('Los canales permitidos son del 1 al 4', 404);
    const canal = await this.repo.findById(id);
    if (!canal) throw this.error('Canal no encontrado. Ejecuta la actualización de la base de datos.', 404);
    return canal;
  }

  async getAreas(id: number) { await this.getCanal(id); return this.repo.findAreas(id); }
  async getEstudiantes(id: number) { await this.getCanal(id); return this.repo.findStudents(id); }

  async updateCanal(id: number, data: { nombre?: string; descripcion?: string; color?: string; estado?: 'ACTIVO' | 'INACTIVO' }) {
    await this.getCanal(id);
    if (data.nombre !== undefined && !data.nombre.trim()) throw this.error('El nombre del canal es obligatorio', 400);
    if (data.estado !== undefined && !['ACTIVO', 'INACTIVO'].includes(data.estado)) throw this.error('Estado de canal inválido', 400);
    await this.repo.update(id, { ...data, nombre: data.nombre?.trim(), descripcion: data.descripcion?.trim(), color: data.color?.trim() });
    return this.getCanal(id);
  }

  async replaceAreas(id: number, courseIds: unknown) {
    await this.getCanal(id);
    if (!Array.isArray(courseIds) || courseIds.some((value) => !Number.isInteger(Number(value)) || Number(value) <= 0)) {
      throw this.error('Envía una lista válida de IDs de cursos', 400);
    }
    const ids = courseIds.map(Number);
    if (new Set(ids).size !== ids.length) throw this.error('No repitas cursos dentro de un canal', 400);
    await this.repo.replaceAreas(id, ids);
    return this.repo.findAreas(id);
  }

  private error(message: string, statusCode: number) { return Object.assign(new Error(message), { statusCode }); }
}

export const canalService = new CanalService();
