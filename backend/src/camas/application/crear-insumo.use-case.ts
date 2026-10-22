import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '../../shared/exceptions/domain.exception';
import { Insumo } from '../domain/entities/insumo.entity';
import {
  type IInventarioRepository,
  INVENTARIO_REPOSITORY,
} from '../domain/repositories/inventario-repository.interface';

export interface CrearInsumoCommand {
  nombre: string;
  unidad: string;
  umbralMinimo: number;
  precioUnitario: string;
}

@Injectable()
export class CrearInsumoUseCase {
  constructor(
    @Inject(INVENTARIO_REPOSITORY) private readonly inventario: IInventarioRepository,
  ) {}

  async ejecutar(cmd: CrearInsumoCommand): Promise<Insumo> {
    if (!cmd.nombre || !cmd.unidad) {
      throw new DomainException('El nombre y la unidad son obligatorios');
    }
    if (cmd.umbralMinimo < 0) {
      throw new DomainException('El umbral mínimo no puede ser negativo');
    }

    return this.inventario.crearInsumo({
      nombre: cmd.nombre.trim(),
      unidad: cmd.unidad.trim(),
      umbralMinimo: cmd.umbralMinimo,
      precioUnitario: cmd.precioUnitario,
    });
  }
}