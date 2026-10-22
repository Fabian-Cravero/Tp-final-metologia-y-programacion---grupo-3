import { Inject, Injectable } from '@nestjs/common';
import { EVENTOS, StockBajoUmbralPayload } from '../../shared/events/eventos';
import { EVENT_PUBLISHER, type IEventPublisher } from '../../shared/events/event-publisher.interface';
import {
  DomainException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import {
  type IInventarioRepository,
  INVENTARIO_REPOSITORY,
} from '../domain/repositories/inventario-repository.interface';

export interface InsumoDescontado {
  nombre: string;
  precioUnitario: string;
}

@Injectable()
export class DescontarInsumoUseCase {
  constructor(
    @Inject(INVENTARIO_REPOSITORY) private readonly inventario: IInventarioRepository,
    @Inject(EVENT_PUBLISHER) private readonly eventos: IEventPublisher,
  ) {}

  async ejecutar(insumoId: string, cantidad: number): Promise<InsumoDescontado> {
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new DomainException('La cantidad debe ser un entero positivo');
    }

    const insumo = await this.inventario.findInsumo(insumoId);
    if (!insumo) throw new RecursoNoEncontradoException('Insumo');

    if (!(await this.inventario.descontar(insumoId, cantidad))) {
      throw new DomainException(`Stock insuficiente de ${insumo.nombre}`);
    }

    const stockTotal = await this.inventario.stockTotal(insumoId);
    if (stockTotal < insumo.umbralMinimo) {
      const payload: StockBajoUmbralPayload = {
        insumoId,
        nombre: insumo.nombre,
        stockTotal,
        umbralMinimo: insumo.umbralMinimo,
      };
      this.eventos.publicar(EVENTOS.STOCK_BAJO_UMBRAL, payload);
    }

    return { nombre: insumo.nombre, precioUnitario: insumo.precioUnitario };
  }
}
