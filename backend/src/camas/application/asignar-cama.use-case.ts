import { Inject, Injectable } from '@nestjs/common';
import {
  type IPacienteRepository,
  PACIENTE_REPOSITORY,
} from '../../admisiones/domain/repositories/paciente-repository.interface';
import {
  ConflictoDeConcurrenciaException,
  DomainException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { siguienteEstadoCama } from '../domain/cama-workflow';
import { AsignacionCama } from '../domain/entities/asignacion-cama.entity';
import { CAMA_REPOSITORY, type ICamaRepository } from '../domain/repositories/cama-repository.interface';

@Injectable()
export class AsignarCamaUseCase {
  constructor(
    @Inject(CAMA_REPOSITORY) private readonly camas: ICamaRepository,
    @Inject(PACIENTE_REPOSITORY) private readonly pacientes: IPacienteRepository,
  ) {}

  async ejecutar(camaId: string, pacienteId: string): Promise<AsignacionCama> {
    const cama = await this.camas.findById(camaId);
    if (!cama) throw new RecursoNoEncontradoException('Cama');
    if (!(await this.pacientes.findById(pacienteId))) {
      throw new RecursoNoEncontradoException('Paciente');
    }
    if (await this.camas.findAsignacionVigentePorPaciente(pacienteId)) {
      throw new DomainException('El paciente ya tiene una cama asignada');
    }

    // El State rechaza (422) si la cama no está libre.
    siguienteEstadoCama(cama.estado, 'asignar');

    // Si otra persona ocupó la cama entre la lectura y este UPDATE, devuelve null (409).
    const asignacion = await this.camas.asignar(cama.id, cama.version, pacienteId);
    if (!asignacion) throw new ConflictoDeConcurrenciaException('La cama');
    return asignacion;
  }
}
