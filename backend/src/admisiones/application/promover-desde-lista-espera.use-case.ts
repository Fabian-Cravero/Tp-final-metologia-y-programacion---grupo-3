import { Inject, Injectable } from '@nestjs/common';
import { ConflictoDeConcurrenciaException } from '../../shared/exceptions/domain.exception';
import { diaLocal } from '../domain/dia-local';
import { EstadoListaEspera, ListaEspera } from '../domain/entities/lista-espera.entity';
import {
  type IListaEsperaRepository,
  LISTA_ESPERA_REPOSITORY,
} from '../domain/repositories/lista-espera-repository.interface';
import { type ITurnoRepository, TURNO_REPOSITORY } from '../domain/repositories/turno-repository.interface';

export interface HorarioLiberado {
  medicoId: string;
  fechaHora: Date;
  duracionMinutos: number;
}

/**
 * HU 1.3 - Promoción automática desde la lista de espera.
 * Cuando se libera un horario, se lo asigna al primero que espera a ese médico ese día.
 *
 * Concurrencia: dos cancelaciones simultáneas no pueden asignarle dos turnos al mismo paciente,
 * porque tomar() es un UPDATE condicional (WHERE estado = 'esperando'): solo una lo logra.
 * Y si alguien reservó el horario liberado un instante antes, el índice único de turnos
 * rechaza el nuevo turno y el paciente vuelve a la lista (compensación).
 */
@Injectable()
export class PromoverDesdeListaEsperaUseCase {
  constructor(
    @Inject(LISTA_ESPERA_REPOSITORY) private readonly lista: IListaEsperaRepository,
    @Inject(TURNO_REPOSITORY) private readonly turnos: ITurnoRepository,
  ) {}

  /** Devuelve el registro promovido, o null si no había nadie o el horario ya no está disponible. */
  async ejecutar(horario: HorarioLiberado): Promise<ListaEspera | null> {
    if (horario.fechaHora.getTime() <= Date.now()) return null; // el horario ya pasó

    const esperando = await this.lista.esperandoPorMedicoYDia(horario.medicoId, diaLocal(horario.fechaHora));

    for (const candidato of esperando) {
      // Si otra cancelación lo tomó primero, probamos con el siguiente de la lista.
      if (!(await this.lista.tomar(candidato.id))) continue;

      try {
        const turno = await this.turnos.crear({
          pacienteId: candidato.paciente.id,
          medicoId: horario.medicoId,
          fechaHora: horario.fechaHora,
          duracionMinutos: horario.duracionMinutos,
          motivo: 'Asignado desde la lista de espera',
        });
        await this.lista.registrarAsignacion(candidato.id, turno.id, horario.fechaHora);
        return {
          ...candidato,
          estado: EstadoListaEspera.ASIGNADO,
          turnoAsignadoId: turno.id,
          fechaHoraAsignada: horario.fechaHora,
        };
      } catch (error) {
        await this.lista.devolverALaEspera(candidato.id);
        // Alguien reservó ese horario antes: no hay nada para asignar.
        if (error instanceof ConflictoDeConcurrenciaException) return null;
        throw error;
      }
    }
    return null;
  }
}
