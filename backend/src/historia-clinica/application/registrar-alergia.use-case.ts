import { Inject, Injectable } from '@nestjs/common';
import { Alergia } from '../domain/entities/alergia.entity';
import {
  HISTORIA_CLINICA_REPOSITORY,
  type IHistoriaClinicaRepository,
} from '../domain/repositories/historia-clinica-repository.interface';
import { historiaRequerida } from './historia-requerida';

@Injectable()
export class RegistrarAlergiaUseCase {
  constructor(
    @Inject(HISTORIA_CLINICA_REPOSITORY) private readonly historias: IHistoriaClinicaRepository,
  ) {}

  async ejecutar(pacienteId: string, sustancia: string, severidad: string): Promise<Alergia> {
    const historia = await historiaRequerida(this.historias, pacienteId);
    return this.historias.agregarAlergia(historia.id, sustancia.trim(), severidad);
  }
}

