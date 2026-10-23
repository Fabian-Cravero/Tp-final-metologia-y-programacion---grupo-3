import { Inject, Injectable } from '@nestjs/common';
import { Alergia } from '../domain/entities/alergia.entity';
import { AntecedenteFamiliar } from '../domain/entities/antecedente-familiar.entity';
import { Evolucion } from '../domain/entities/evolucion.entity';
import { HistoriaClinica } from '../domain/entities/historia-clinica.entity';
import {
  HISTORIA_CLINICA_REPOSITORY,
  type IHistoriaClinicaRepository,
} from '../domain/repositories/historia-clinica-repository.interface';
import { historiaRequerida } from './historia-requerida';

export interface HistoriaCompleta {
  historia: HistoriaClinica;
  alergias: Alergia[];
  antecedentes: AntecedenteFamiliar[];
  evoluciones: Evolucion[];
}

@Injectable()
export class ObtenerHistoriaCompletaUseCase {
  constructor(
    @Inject(HISTORIA_CLINICA_REPOSITORY) private readonly historias: IHistoriaClinicaRepository,
  ) {}

  async ejecutar(pacienteId: string, limiteEvoluciones = 50): Promise<HistoriaCompleta> {
    const historia = await historiaRequerida(this.historias, pacienteId);

    const [alergias, antecedentes, evoluciones] = await Promise.all([
      this.historias.listarAlergias(historia.id),
      this.historias.listarAntecedentes(historia.id),
      this.historias.listarEvoluciones(historia.id, limiteEvoluciones),
    ]);

    return { historia, alergias, antecedentes, evoluciones };
  }
}
