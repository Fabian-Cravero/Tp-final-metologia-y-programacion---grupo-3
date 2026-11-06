import { Inject, Injectable } from '@nestjs/common';
import {
  FACTURA_REPOSITORY,
  type IFacturaRepository,
} from '../domain/repositories/factura-repository.interface';
import { CambiarEstadoFacturaBase } from './cambiar-estado-factura.base';

@Injectable()
export class EmitirFacturaUseCase extends CambiarEstadoFacturaBase {
  protected readonly accion = 'emitir' as const;

  constructor(@Inject(FACTURA_REPOSITORY) facturas: IFacturaRepository) {
    super(facturas);
  }
}
