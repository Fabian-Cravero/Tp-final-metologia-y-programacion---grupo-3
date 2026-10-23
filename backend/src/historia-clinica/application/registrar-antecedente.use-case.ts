import { Inject, Injectable } from '@nestjs/common';
import { AntecedenteFamiliar } from '../domain/entities/antecedente-familiar.entity';
import { HISTORIA_CLINICA_REPOSITORY, type IHistoriaClinicaRepository } from '../domain/repositories/historia-clinica-repository.interface';
import { historiaRequerida } from './historia-requerida';

@Injectable()
export class RegistrarAntecedenteUseCase {
  constructor(
    @Inject(HISTORIA_CLINICA_REPOSITORY) private readonly historias: IHistoriaClinicaRepository,
  ) {}

  async ejecutar(pacienteId: string, parentesco: string, descripcion: string): Promise<AntecedenteFamiliar> {
    const historia = await historiaRequerida(this.historias, pacienteId);
    return this.historias.agregarAntecedente(historia.id, parentesco.trim(), descripcion.trim());
  }
}