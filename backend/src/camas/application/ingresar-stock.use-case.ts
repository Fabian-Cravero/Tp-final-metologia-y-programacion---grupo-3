import { Inject, Injectable } from '@nestjs/common';
import {
  DomainException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import {
  type IInventarioRepository,
  INVENTARIO_REPOSITORY,
} from '../domain/repositories/inventario-repository.interface';

@Injectable()
export class IngresarStockUseCase {
  constructor(
    @Inject(INVENTARIO_REPOSITORY) private readonly inventario: IInventarioRepository,
  ) {}

  async ejecutar(insumoId: string, cantidad: number, ubicacion?: string): Promise<void> {
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new DomainException('La cantidad debe ser un entero positivo');
    }

    const insumo = await this.inventario.findInsumo(insumoId);
    if (!insumo) throw new RecursoNoEncontradoException('Insumo');

    await this.inventario.ingresarStock(insumoId, cantidad, ubicacion);
  }
}