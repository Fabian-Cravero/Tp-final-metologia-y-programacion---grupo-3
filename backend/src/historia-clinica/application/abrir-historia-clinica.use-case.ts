import { Inject, Injectable } from '@nestjs/common';
import {
  type IPacienteRepository,
  PACIENTE_REPOSITORY,
} from '../../admisiones/domain/repositories/paciente-repository.interface';
import { RecursoNoEncontradoException } from '../../shared/exceptions/domain.exception';
import { HistoriaClinica } from '../domain/entities/historia-clinica.entity';
import {
  HISTORIA_CLINICA_REPOSITORY,
  type IHistoriaClinicaRepository,
} from '../domain/repositories/historia-clinica-repository.interface';

@Injectable()
export class AbrirHistoriaClinicaUseCase {
  constructor(
    @Inject(HISTORIA_CLINICA_REPOSITORY) private readonly historias: IHistoriaClinicaRepository,
    @Inject(PACIENTE_REPOSITORY) private readonly pacientes: IPacienteRepository,
  ) {}

  async ejecutar(pacienteId: string, grupoSanguineo?: string): Promise<HistoriaClinica> {
    if (!(await this.pacientes.findById(pacienteId))) {
      throw new RecursoNoEncontradoException('Paciente');
    }

    const existente = await this.historias.findByPaciente(pacienteId);
    if (existente) return existente;

    return this.historias.crear(pacienteId, grupoSanguineo ?? null);
  }
}
