import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '../../shared/exceptions/domain.exception';
import { AntecedenteFamiliar } from '../domain/entities/antecedente-familiar.entity';
import {
  HISTORIA_CLINICA_REPOSITORY,
  type IHistoriaClinicaRepository,
} from '../domain/repositories/historia-clinica-repository.interface';
import { historiaRequerida } from './historia-requerida';

@Injectable()
export class RegistrarAntecedenteUseCase {
  constructor(
    @Inject(HISTORIA_CLINICA_REPOSITORY) private readonly historias: IHistoriaClinicaRepository,
  ) {}

  async ejecutar(pacienteId: string, parentesco: string, descripcion: string): Promise<AntecedenteFamiliar> {
    const parentescoLimpio = (parentesco ?? '').trim();
    const descripcionLimpia = (descripcion ?? '').trim();
    if (!parentescoLimpio || !descripcionLimpia) {
      throw new DomainException('El parentesco y la descripción son obligatorios');
    }

    const historia = await historiaRequerida(this.historias, pacienteId);
    return this.historias.agregarAntecedente(historia.id, parentescoLimpio, descripcionLimpia);
  }
}
