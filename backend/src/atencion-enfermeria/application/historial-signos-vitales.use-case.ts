import { Inject, Injectable } from '@nestjs/common';
import { SignoVital } from '../domain/entities/signo-vital.entity';
import {
  type ISignoVitalRepository,
  SIGNO_VITAL_REPOSITORY,
} from '../domain/repositories/signo-vital-repository.interface';

@Injectable()
export class HistorialSignosVitalesUseCase {
  constructor(@Inject(SIGNO_VITAL_REPOSITORY) private readonly signos: ISignoVitalRepository) {}

  ejecutar(pacienteId: string, limite = 100): Promise<SignoVital[]> {
    return this.signos.historialDePaciente(pacienteId, limite);
  }
}
