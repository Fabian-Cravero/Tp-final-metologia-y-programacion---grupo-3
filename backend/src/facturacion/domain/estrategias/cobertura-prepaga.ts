import { Injectable } from '@nestjs/common';
import { type CalculoCargo, type IEstrategiaCobertura } from './estrategia-cobertura.interface';

/** Prepaga: cubre el porcentaje configurado en la cobertura; el resto lo paga el paciente. */
@Injectable()
export class CoberturaPrepaga implements IEstrategiaCobertura {
  readonly tipo = 'prepaga';

  calcular(base: number, porcentajeCobertura: number): CalculoCargo {
    const cubierto = Math.round((base * porcentajeCobertura) / 100);
    // El paciente paga la diferencia: las dos partes siempre suman la base, incluso con redondeo.
    return { montoCubiertoCentavos: cubierto, montoPacienteCentavos: base - cubierto };
  }
}
