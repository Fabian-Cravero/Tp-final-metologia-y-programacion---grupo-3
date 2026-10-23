import { Inject, Injectable } from '@nestjs/common';
import {
  type IMedicoRepository,
  MEDICO_REPOSITORY,
} from '../../admisiones/domain/repositories/medico-repository.interface';
import {
  DomainException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { Evolucion } from '../domain/entities/evolucion.entity';
import {
  HISTORIA_CLINICA_REPOSITORY,
  type IHistoriaClinicaRepository,
} from '../domain/repositories/historia-clinica-repository.interface';
import { historiaRequerida } from './historia-requerida';

@Injectable()
export class AgregarEvolucionUseCase {
  constructor(
    @Inject(HISTORIA_CLINICA_REPOSITORY) private readonly historias: IHistoriaClinicaRepository,
    @Inject(MEDICO_REPOSITORY) private readonly medicos: IMedicoRepository,
  ) {}

  async ejecutar(pacienteId: string, usuarioId: string, nota: string): Promise<Evolucion> {
    if (nota.trim().length === 0) throw new DomainException('La evolución no puede estar vacía');

    const medico = await this.medicos.findByUsuarioId(usuarioId);
    if (!medico) throw new RecursoNoEncontradoException('Médico asociado al usuario');

    const historia = await historiaRequerida(this.historias, pacienteId);
    return this.historias.agregarEvolucion(historia.id, medico.id, nota.trim());
  }
}
