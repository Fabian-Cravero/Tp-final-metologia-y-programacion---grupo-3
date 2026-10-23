import { Inject, Injectable } from '@nestjs/common';
import {
  type IInventarioRepository,
  INVENTARIO_REPOSITORY,
  type InsumoConStock,
} from '../domain/repositories/inventario-repository.interface';

@Injectable()
export class ListarInsumosUseCase {
  constructor(
    @Inject(INVENTARIO_REPOSITORY) private readonly inventario: IInventarioRepository,
  ) {}

  ejecutar(): Promise<InsumoConStock[]> {
    return this.inventario.listarInsumos();
  }
}
