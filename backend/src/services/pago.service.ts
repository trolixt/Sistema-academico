import { pagoRepository, PagoRepository } from '../repositories/pago.repository';
import { matriculaRepository, MatriculaRepository } from '../repositories/matricula.repository';
import { IPagoDetalle, CreatePagoDTO, EstadoPago } from '../types';

export class PagoService {
  private repo: PagoRepository;
  private matriculaRepo: MatriculaRepository;

  constructor(
    repo: PagoRepository = pagoRepository,
    matriculaRepo: MatriculaRepository = matriculaRepository
  ) {
    this.repo = repo;
    this.matriculaRepo = matriculaRepo;
  }

  async getAllPagos(filtros?: { matricula_id?: number; estudiante_id?: number; estado?: EstadoPago }): Promise<IPagoDetalle[]> {
    return await this.repo.findAll(filtros);
  }

  async getPagoById(id: number): Promise<IPagoDetalle> {
    const pago = await this.repo.findById(id);
    if (!pago) {
      const error: any = new Error(`Pago con ID ${id} no encontrado`);
      error.statusCode = 404;
      throw error;
    }
    return pago;
  }

  async getPagoByCodigo(codigo: string): Promise<IPagoDetalle> {
    const pago = await this.repo.findByCode(codigo.trim().toUpperCase());
    if (!pago) {
      const error: any = new Error('No encontramos una cuota con ese código');
      error.statusCode = 404;
      throw error;
    }
    if (pago.estado !== 'PENDIENTE' && pago.estado !== 'VENCIDO') {
      const error: any = new Error('Ese código ya no corresponde a una cuota pendiente');
      error.statusCode = 409;
      throw error;
    }
    return pago;
  }

  async getPagosByMatricula(matriculaId: number): Promise<IPagoDetalle[]> {
    // Verificar que la matrícula exista
    const matricula = await this.matriculaRepo.findById(matriculaId);
    if (!matricula) {
      const error: any = new Error(`Matrícula con ID ${matriculaId} no encontrada`);
      error.statusCode = 404;
      throw error;
    }
    return await this.repo.findByMatricula(matriculaId);
  }

  async createPago(dto: CreatePagoDTO): Promise<IPagoDetalle> {
    if (!dto.codigo_pago?.trim()) {
      const error: any = new Error('Ingresa el código de pago');
      error.statusCode = 400;
      throw error;
    }
    if (!Number.isFinite(dto.monto_recibido) || dto.monto_recibido <= 0) {
      const error: any = new Error('El importe recibido debe ser mayor que cero');
      error.statusCode = 400;
      throw error;
    }
    if (!['EFECTIVO', 'YAPE', 'TRANSFERENCIA'].includes(dto.metodo_pago)) {
      const error: any = new Error('Selecciona efectivo, Yape o transferencia bancaria');
      error.statusCode = 400;
      throw error;
    }
    if (dto.metodo_pago !== 'EFECTIVO' && !dto.referencia_operacion?.trim()) {
      const error: any = new Error('Ingresa el número de operación de Yape o del banco, después de comprobar el abono recibido');
      error.statusCode = 400;
      throw error;
    }
    const charge = await this.getPagoByCodigo(dto.codigo_pago);
    if (Number(charge.monto) !== Number(dto.monto_recibido)) {
      const error: any = new Error(`El importe recibido debe ser exactamente ${Number(charge.monto).toFixed(2)}`);
      error.statusCode = 400;
      throw error;
    }
    if (!await this.repo.registrar(dto)) {
      const error: any = new Error('No se registró el cobro. Revisa que la cuota siga pendiente, el importe coincida y la matrícula esté vigente.');
      error.statusCode = 409;
      throw error;
    }
    return (await this.repo.findByCode(dto.codigo_pago.trim().toUpperCase()))!;
  }

  async anularPago(id: number): Promise<IPagoDetalle> {
    const pago = await this.getPagoById(id);

    if (pago.estado === 'ANULADO') {
      const error: any = new Error('El pago ya se encuentra anulado');
      error.statusCode = 400;
      throw error;
    }

    await this.repo.cambiarEstado(id, 'ANULADO');
    return (await this.repo.findById(id))!;
  }
}

export const pagoService = new PagoService();
