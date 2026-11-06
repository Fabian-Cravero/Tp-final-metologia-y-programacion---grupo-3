import { Inject, Injectable } from '@nestjs/common';
import { SignoVital } from '../domain/entities/signo-vital.entity';
import {
  type ISignoVitalRepository,
  SIGNO_VITAL_REPOSITORY,
} from '../domain/repositories/signo-vital-repository.interface';
import { type Severidad, evaluarSignoVital } from '../domain/umbrales-signos-vitales';

export type SignoVitalConSeveridad = SignoVital & { severidad: Severidad };

@Injectable()
export class HistorialSignosVitalesUseCase {
  constructor(@Inject(SIGNO_VITAL_REPOSITORY) private readonly signos: ISignoVitalRepository) {}

  /** Cada registro con su severidad, así el frontend no repite los umbrales. */
  async ejecutar(pacienteId: string, limite = 100): Promise<SignoVitalConSeveridad[]> {
    const historial = await this.signos.historialDePaciente(pacienteId, limite);
    return historial.map((s) => Object.assign(s, { severidad: evaluarSignoVital(s.tipo, Number(s.valor)) }));
  }
}
