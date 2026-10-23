import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '../../shared/exceptions/domain.exception';
import { Cama } from '../domain/entities/cama.entity';
import { CAMA_REPOSITORY, type ICamaRepository } from '../domain/repositories/cama-repository.interface';

@Injectable()
export class CrearCamaUseCase {
  constructor(@Inject(CAMA_REPOSITORY) private readonly camas: ICamaRepository) {}

  async ejecutar(codigo: string, sector: string): Promise<Cama> {
    const codigoLimpio = (codigo ?? '').trim();
    const sectorLimpio = (sector ?? '').trim();
    if (!codigoLimpio || !sectorLimpio) {
      throw new DomainException('El código y el sector de la cama son obligatorios');
    }
    // Un código repetido lo rechaza el índice único de la base (422).
    return this.camas.crear(codigoLimpio, sectorLimpio);
  }
}
