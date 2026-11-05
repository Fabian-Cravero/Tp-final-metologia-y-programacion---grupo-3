import { Inject, Injectable } from '@nestjs/common';
import {
  ConflictoDeConcurrenciaException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import {
  type IProtocoloRepository,
  PROTOCOLO_REPOSITORY,
} from '../domain/repositories/protocolo-repository.interface';

export interface TareaCompletada {
  tareaId: string;
  pendientes: number;
  protocoloFinalizado: boolean;
}

@Injectable()
export class CompletarTareaUseCase {
  constructor(@Inject(PROTOCOLO_REPOSITORY) private readonly protocolos: IProtocoloRepository) {}

  async ejecutar(tareaId: string): Promise<TareaCompletada> {
    const protocoloId = await this.protocolos.protocoloDeTarea(tareaId);
    if (!protocoloId) throw new RecursoNoEncontradoException('Tarea');

    // Si dos enfermeros marcan la misma tarea a la vez, solo uno gana (409 al otro).
    if (!(await this.protocolos.completarTarea(tareaId))) {
      throw new ConflictoDeConcurrenciaException('La tarea');
    }

    // Cuando no quedan tareas pendientes, el protocolo se finaliza solo.
    const pendientes = await this.protocolos.contarPendientes(protocoloId);
    if (pendientes === 0) await this.protocolos.finalizar(protocoloId);

    return { tareaId, pendientes, protocoloFinalizado: pendientes === 0 };
  }
}
