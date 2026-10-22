import { Inject, Injectable } from '@nestjs/common';
import { RecursoNoEncontradoException } from '../../shared/exceptions/domain.exception';
import { PrioridadTriaje } from '../domain/cola-prioridad';
import { ColaEntreturno } from '../domain/entities/cola-entreturno.entity';
import { COLA_REPOSITORY, type IColaRepository } from '../domain/repositories/cola-repository.interface';
import { type IMedicoRepository, MEDICO_REPOSITORY } from '../domain/repositories/medico-repository.interface';
import {
  type IPacienteRepository,
  PACIENTE_REPOSITORY,
} from '../domain/repositories/paciente-repository.interface';

export interface AgregarAColaCommand {
  pacienteId: string;
  medicoId: string;
  prioridad?: PrioridadTriaje;
}

@Injectable()
export class AgregarAColaUseCase {
  constructor(
    @Inject(COLA_REPOSITORY) private readonly cola: IColaRepository,
    @Inject(PACIENTE_REPOSITORY) private readonly pacientes: IPacienteRepository,
    @Inject(MEDICO_REPOSITORY) private readonly medicos: IMedicoRepository,
  ) {}

  async ejecutar(cmd: AgregarAColaCommand): Promise<ColaEntreturno> {
    if (!(await this.pacientes.findById(cmd.pacienteId))) {
      throw new RecursoNoEncontradoException('Paciente');
    }
    if (!(await this.medicos.findById(cmd.medicoId))) {
      throw new RecursoNoEncontradoException('Médico');
    }
    return this.cola.agregar(cmd.pacienteId, cmd.medicoId, cmd.prioridad ?? PrioridadTriaje.NORMAL);
  }
}
