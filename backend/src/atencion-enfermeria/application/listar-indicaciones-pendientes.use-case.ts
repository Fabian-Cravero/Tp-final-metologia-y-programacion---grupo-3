import { Inject, Injectable } from '@nestjs/common';
import { IndicacionMedica } from '../domain/entities/indicacion-medica.entity';
import {
  type IIndicacionRepository,
  INDICACION_REPOSITORY,
} from '../domain/repositories/indicacion-repository.interface';

@Injectable()
export class ListarIndicacionesPendientesUseCase {
  constructor(@Inject(INDICACION_REPOSITORY) private readonly indicaciones: IIndicacionRepository) {}

  ejecutar(pacienteId: string): Promise<IndicacionMedica[]> {
    return this.indicaciones.listarPendientes(pacienteId);
  }
}
