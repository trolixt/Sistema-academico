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
    // Validaciones
    if (!dto.matricula_id) {
      const error: any = new Error('El matricula_id es obligatorio');
      error.statusCode = 400;
      throw error;
    }
    if (!dto.concepto?.trim()) {
      const error: any = new Error('El concepto del pago es obligatorio');
      error.statusCode = 400;
      throw error;
    }
    if (!dto.monto || dto.monto <= 0) {
      const error: any = new Error('El monto debe ser un valor mayor a 0');
      error.statusCode = 400;
      throw error;
    }
    if (!['EFECTIVO', 'TRANSFERENCIA', 'TARJETA'].includes(dto.metodo_pago)) {
      const error: any = new Error('Método de pago inválido. Use: EFECTIVO, TRANSFERENCIA o TARJETA');
      error.statusCode = 400;
      throw error;
    }

    // Verificar que la matrícula exista y esté activa
    const matricula = await this.matriculaRepo.findById(dto.matricula_id);
    if (!matricula) {
      const error: any = new Error(`La matrícula con ID ${dto.matricula_id} no existe`);
      error.statusCode = 404;
      throw error;
    }
    if (matricula.estado !== 'ACTIVA') {
      const error: any = new Error('No se puede registrar un pago para una matrícula cancelada o retirada');
      error.statusCode = 400;
      throw error;
    }

    const nuevoPagoId = await this.repo.create(dto);
    return (await this.repo.findById(nuevoPagoId))!;
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
