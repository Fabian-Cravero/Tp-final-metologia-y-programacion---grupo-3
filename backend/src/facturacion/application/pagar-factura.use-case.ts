import { Inject, Injectable } from '@nestjs/common';
import {
  FACTURA_REPOSITORY,
  type IFacturaRepository,
} from '../domain/repositories/factura-repository.interface';
import { CambiarEstadoFacturaBase } from './cambiar-estado-factura.base';

@Injectable()
export class PagarFacturaUseCase extends CambiarEstadoFacturaBase {
  protected readonly accion = 'pagar' as const;

  constructor(@Inject(FACTURA_REPOSITORY) facturas: IFacturaRepository) {
    super(facturas);
  }
}
