import { Inject, Injectable } from '@nestjs/common';
import { type ITurnoRepository, TURNO_REPOSITORY } from '../domain/repositories/turno-repository.interface';
import { TransicionarTurnoBase } from './transicionar-turno.base';

@Injectable()
export class AtenderTurnoUseCase extends TransicionarTurnoBase {
  protected readonly accion = 'atender' as const;

  constructor(@Inject(TURNO_REPOSITORY) turnos: ITurnoRepository) {
    super(turnos);
  }
}
