import { Inject, Injectable } from '@nestjs/common';
import {
  RecursoNoEncontradoException,
  TransicionInvalidaException,
} from '../../shared/exceptions/domain.exception';
import { IndicacionMedica } from '../domain/entities/indicacion-medica.entity';
import {
  type IIndicacionRepository,
  INDICACION_REPOSITORY,
} from '../domain/repositories/indicacion-repository.interface';

@Injectable()
export class CancelarIndicacionUseCase {
  constructor(@Inject(INDICACION_REPOSITORY) private readonly indicaciones: IIndicacionRepository) {}

  async ejecutar(indicacionId: string): Promise<IndicacionMedica> {
    const indicacion = await this.indicaciones.findById(indicacionId);
    if (!indicacion) throw new RecursoNoEncontradoException('Indicación');

    // Solo se cancela si sigue pendiente: una medicación ya administrada no se "des-administra".
    if (!(await this.indicaciones.cancelar(indicacion.id))) {
      throw new TransicionInvalidaException(
        `No se puede cancelar una indicación en estado "${indicacion.estado}"`,
      );
    }
    return (await this.indicaciones.findById(indicacion.id)) ?? indicacion;
  }
}
