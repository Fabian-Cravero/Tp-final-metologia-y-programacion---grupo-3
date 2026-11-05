import { Inject, Injectable } from '@nestjs/common';
import {
  type IPacienteRepository,
  PACIENTE_REPOSITORY,
} from '../../admisiones/domain/repositories/paciente-repository.interface';
import { EVENT_PUBLISHER, type IEventPublisher } from '../../shared/events/event-publisher.interface';
import { EVENTOS, type SignoVitalFueraDeRangoPayload } from '../../shared/events/eventos';
import {
  DomainException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { SignoVital } from '../domain/entities/signo-vital.entity';
import {
  type ISignoVitalRepository,
  SIGNO_VITAL_REPOSITORY,
} from '../domain/repositories/signo-vital-repository.interface';
import { type Severidad, evaluarSignoVital, unidadDe } from '../domain/umbrales-signos-vitales';

export interface RegistrarSignoVitalCommand {
  pacienteId: string;
  registradoPorId: string;
  tipo: string;
  valor: number;
}

export interface SignoVitalRegistrado {
  signoVital: SignoVital;
  severidad: Severidad;
}

@Injectable()
export class RegistrarSignoVitalUseCase {
  constructor(
    @Inject(SIGNO_VITAL_REPOSITORY) private readonly signos: ISignoVitalRepository,
    @Inject(PACIENTE_REPOSITORY) private readonly pacientes: IPacienteRepository,
    @Inject(EVENT_PUBLISHER) private readonly eventos: IEventPublisher,
  ) {}

  async ejecutar(cmd: RegistrarSignoVitalCommand): Promise<SignoVitalRegistrado> {
    if (!Number.isFinite(cmd.valor)) throw new DomainException('El valor debe ser un número');
    if (!(await this.pacientes.findById(cmd.pacienteId))) {
      throw new RecursoNoEncontradoException('Paciente');
    }

    const severidad = evaluarSignoVital(cmd.tipo, cmd.valor); // lanza si el tipo no existe
    const signoVital = await this.signos.registrar({
      pacienteId: cmd.pacienteId,
      registradoPorId: cmd.registradoPorId,
      tipo: cmd.tipo,
      valor: cmd.valor,
      unidad: unidadDe(cmd.tipo),
    });

    if (severidad !== 'normal') {
      const payload: SignoVitalFueraDeRangoPayload = {
        pacienteId: cmd.pacienteId,
        tipo: cmd.tipo,
        valor: cmd.valor,
        severidad,
      };
      this.eventos.publicar(EVENTOS.SIGNO_VITAL_FUERA_DE_RANGO, payload);
    }

    // La severidad va en la respuesta: el frontend pinta la alerta sin recalcular.
    return { signoVital, severidad };
  }
}
