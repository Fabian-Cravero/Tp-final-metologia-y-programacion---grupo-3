import { Injectable } from '@nestjs/common';
import { type CalculoCargo, type IEstrategiaCobertura } from './estrategia-cobertura.interface';

/** Obra social pública: cubre el 100%. */
@Injectable()
export class CoberturaPublica implements IEstrategiaCobertura {
  readonly tipo = 'publica';

  calcular(base: number): CalculoCargo {
    return { montoCubiertoCentavos: base, montoPacienteCentavos: 0 };
  }
}
