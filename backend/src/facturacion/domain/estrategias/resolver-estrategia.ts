import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '../../../shared/exceptions/domain.exception';
import { ESTRATEGIAS_COBERTURA, type IEstrategiaCobertura } from './estrategia-cobertura.interface';

/**
 * Elige la estrategia según el tipo de cobertura. Agregar una cobertura nueva (por ejemplo ART)
 * es una clase nueva registrada en el módulo: no se toca ninguna estrategia ni caso de uso existente.
 */
@Injectable()
export class ResolverEstrategiaCobertura {
  constructor(@Inject(ESTRATEGIAS_COBERTURA) private readonly estrategias: IEstrategiaCobertura[]) {}

  para(tipo: string): IEstrategiaCobertura {
    const estrategia = this.estrategias.find((e) => e.tipo === tipo);
    if (!estrategia) throw new DomainException(`No hay estrategia de cálculo para la cobertura "${tipo}"`);
    return estrategia;
  }
}
