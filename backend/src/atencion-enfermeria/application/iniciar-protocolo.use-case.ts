import { Inject, Injectable } from '@nestjs/common';
import {
  type IPacienteRepository,
  PACIENTE_REPOSITORY,
} from '../../admisiones/domain/repositories/paciente-repository.interface';
import { RecursoNoEncontradoException } from '../../shared/exceptions/domain.exception';
import { ProtocoloCuidado } from '../domain/entities/protocolo-cuidado.entity';
import { TareaProtocolo } from '../domain/entities/tarea-protocolo.entity';
import { ProtocoloDirector } from '../domain/protocolos/protocolo.director';
import {
  type IProtocoloRepository,
  PROTOCOLO_REPOSITORY,
} from '../domain/repositories/protocolo-repository.interface';

export interface ProtocoloConTareas {
  protocolo: ProtocoloCuidado;
  tareas: TareaProtocolo[];
}

@Injectable()
export class IniciarProtocoloUseCase {
  private readonly director = new ProtocoloDirector();

  constructor(
    @Inject(PROTOCOLO_REPOSITORY) private readonly protocolos: IProtocoloRepository,
    @Inject(PACIENTE_REPOSITORY) private readonly pacientes: IPacienteRepository,
  ) {}

  async ejecutar(pacienteId: string, motivoIngreso: string): Promise<ProtocoloConTareas> {
    if (!(await this.pacientes.findById(pacienteId))) {
      throw new RecursoNoEncontradoException('Paciente');
    }

    const plan = this.director.construir(motivoIngreso); // el Builder valida que el plan esté completo
    const protocolo = await this.protocolos.crearConTareas(pacienteId, plan);
    return { protocolo, tareas: await this.protocolos.tareasDe(protocolo.id) };
  }
}
