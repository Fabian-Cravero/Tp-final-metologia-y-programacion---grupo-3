import { Inject, Injectable } from '@nestjs/common';
import { EVENT_PUBLISHER, type IEventPublisher } from '../../shared/events/event-publisher.interface';
import { EVENTOS, type TurnoCanceladoPayload } from '../../shared/events/eventos';
import { Turno } from '../domain/entities/turno.entity';
import { type ITurnoRepository, TURNO_REPOSITORY } from '../domain/repositories/turno-repository.interface';
import { TransicionarTurnoBase } from './transicionar-turno.base';

@Injectable()
export class CancelarTurnoUseCase extends TransicionarTurnoBase {
  protected readonly accion = 'cancelar' as const;

  constructor(
    @Inject(TURNO_REPOSITORY) turnos: ITurnoRepository,
    @Inject(EVENT_PUBLISHER) private readonly eventos: IEventPublisher,
  ) {
    super(turnos);
  }

  async ejecutar(turnoId: string): Promise<Turno> {
    const turno = await super.ejecutar(turnoId);

    // HU 1.3 (Observer): avisamos que se liberó un horario. Quien escuche (la lista de espera)
    // decide qué hacer. Si eso falla, la cancelación igual queda hecha.
    const payload: TurnoCanceladoPayload = {
      turnoId: turno.id,
      medicoId: turno.medico.id,
      fechaHora: new Date(turno.fechaHora).toISOString(),
      duracionMinutos: turno.duracionMinutos ?? 30,
    };
    this.eventos.publicar(EVENTOS.TURNO_CANCELADO, payload);

    return turno;
  }
}
