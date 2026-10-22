import { Inject, Injectable } from '@nestjs/common';
import {
  DomainException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { Turno } from '../domain/entities/turno.entity';
import {
  type IMedicoRepository,
  MEDICO_REPOSITORY,
} from '../domain/repositories/medico-repository.interface';
import {
  type IPacienteRepository,
  PACIENTE_REPOSITORY,
} from '../domain/repositories/paciente-repository.interface';
import { type ITurnoRepository, TURNO_REPOSITORY } from '../domain/repositories/turno-repository.interface';

export interface ReservarTurnoCommand {
  pacienteId: string;
  medicoId: string;
  fechaHora: Date;
  motivo?: string;
}

@Injectable()
export class ReservarTurnoUseCase {
  constructor(
    @Inject(TURNO_REPOSITORY) private readonly turnos: ITurnoRepository,
    @Inject(PACIENTE_REPOSITORY) private readonly pacientes: IPacienteRepository,
    @Inject(MEDICO_REPOSITORY) private readonly medicos: IMedicoRepository,
  ) {}

  async ejecutar(cmd: ReservarTurnoCommand): Promise<Turno> {
    if (cmd.fechaHora.getTime() <= Date.now()) {
      throw new DomainException('No se puede reservar un turno en el pasado');
    }

    if (!(await this.pacientes.findById(cmd.pacienteId))) {
      throw new RecursoNoEncontradoException('Paciente');
    }
    const medico = await this.medicos.findById(cmd.medicoId);
    if (!medico) throw new RecursoNoEncontradoException('Médico');
    if (!medico.activo) throw new DomainException('El médico no está disponible');

    // Si dos reservas llegan juntas, la base rechaza la segunda (409).
    return this.turnos.crear(cmd);
  }
}
