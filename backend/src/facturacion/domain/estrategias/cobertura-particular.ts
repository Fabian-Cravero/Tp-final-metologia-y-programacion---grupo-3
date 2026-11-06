import { Injectable } from '@nestjs/common';
import { type CalculoCargo, type IEstrategiaCobertura } from './estrategia-cobertura.interface';

/** Sin cobertura: el paciente paga todo. */
@Injectable()
export class CoberturaParticular implements IEstrategiaCobertura {
  readonly tipo = 'particular';

  calcular(base: number): CalculoCargo {
    return { montoCubiertoCentavos: 0, montoPacienteCentavos: base };
  }
}
