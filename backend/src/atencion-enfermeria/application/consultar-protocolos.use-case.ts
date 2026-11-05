import { Inject, Injectable } from '@nestjs/common';
import { RecursoNoEncontradoException } from '../../shared/exceptions/domain.exception';
import { ProtocoloCuidado } from '../domain/entities/protocolo-cuidado.entity';
import {
  type IProtocoloRepository,
  PROTOCOLO_REPOSITORY,
} from '../domain/repositories/protocolo-repository.interface';
import { type ProtocoloConTareas } from './iniciar-protocolo.use-case';

@Injectable()
export class ConsultarProtocolosUseCase {
  constructor(@Inject(PROTOCOLO_REPOSITORY) private readonly protocolos: IProtocoloRepository) {}

  delPaciente(pacienteId: string): Promise<ProtocoloCuidado[]> {
    return this.protocolos.listarDePaciente(pacienteId);
  }

  async conTareas(protocoloId: string): Promise<ProtocoloConTareas> {
    const protocolo = await this.protocolos.findById(protocoloId);
    if (!protocolo) throw new RecursoNoEncontradoException('Protocolo');
    return { protocolo, tareas: await this.protocolos.tareasDe(protocolo.id) };
  }
}
