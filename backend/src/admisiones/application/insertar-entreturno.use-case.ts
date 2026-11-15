import { Inject, Injectable } from '@nestjs/common';
import {
  DomainException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { planificarEntreturno } from '../domain/entreturno';
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

export interface InsertarEntreturnoCommand {
  pacienteId: string;
  medicoId: string;
  fechaHora: Date;
  motivo?: string;
}

/**
 * HU 1.2 - Inserción de entreturno dinámico.
 * Pasos: validar, calcular cómo queda la agenda (lógica pura del dominio)
 * y guardar los dos cambios juntos en una transacción.
 */
@Injectable()
export class InsertarEntreturnoUseCase {
  constructor(
    @Inject(TURNO_REPOSITORY) private readonly turnos: ITurnoRepository,
    @Inject(PACIENTE_REPOSITORY) private readonly pacientes: IPacienteRepository,
    @Inject(MEDICO_REPOSITORY) private readonly medicos: IMedicoRepository,
  ) {}

  async ejecutar(cmd: InsertarEntreturnoCommand): Promise<Turno> {
    if (cmd.fechaHora.getTime() <= Date.now()) {
      throw new DomainException('No se puede insertar un entreturno en el pasado');
    }
    if (!(await this.pacientes.findById(cmd.pacienteId))) {
      throw new RecursoNoEncontradoException('Paciente');
    }
    const medico = await this.medicos.findById(cmd.medicoId);
    if (!medico) throw new RecursoNoEncontradoException('Médico');
    if (!medico.activo) throw new DomainException('El médico no está disponible');

    const agenda = await this.turnos.listarPorMedicoYDia(cmd.medicoId, cmd.fechaHora);
    const plan = planificarEntreturno(agenda, cmd.fechaHora);

    // Si otra persona modificó el turno anterior o tomó el horario mientras tanto: 409.
    return this.turnos.insertarEntreturno({
      pacienteId: cmd.pacienteId,
      medicoId: cmd.medicoId,
      fechaHora: cmd.fechaHora,
      motivo: cmd.motivo,
      duracionMinutos: plan.duracionEntreturno,
      turnoAnteriorId: plan.turnoAnteriorId,
      versionAnterior: plan.versionAnterior,
      nuevaDuracionAnterior: plan.nuevaDuracionAnterior,
    });
  }
}
