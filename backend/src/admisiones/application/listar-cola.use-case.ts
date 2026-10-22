import { Inject, Injectable } from '@nestjs/common';
import { ordenarCola } from '../domain/cola-prioridad';
import { ColaEntreturno } from '../domain/entities/cola-entreturno.entity';
import { COLA_REPOSITORY, type IColaRepository } from '../domain/repositories/cola-repository.interface';

@Injectable()
export class ListarColaUseCase {
  constructor(@Inject(COLA_REPOSITORY) private readonly cola: IColaRepository) {}

  async ejecutar(medicoId: string): Promise<ColaEntreturno[]> {
    return ordenarCola(await this.cola.pendientesPorMedico(medicoId));
  }
}
