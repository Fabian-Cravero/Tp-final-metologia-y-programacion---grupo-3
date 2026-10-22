import { Inject, Injectable } from '@nestjs/common';
import {
  ConflictoDeConcurrenciaException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { ordenarCola } from '../domain/cola-prioridad';
import { ColaEntreturno } from '../domain/entities/cola-entreturno.entity';
import { COLA_REPOSITORY, type IColaRepository } from '../domain/repositories/cola-repository.interface';

@Injectable()
export class LlamarSiguienteUseCase {
  constructor(@Inject(COLA_REPOSITORY) private readonly cola: IColaRepository) {}

  async ejecutar(medicoId: string): Promise<ColaEntreturno> {
    const siguiente = ordenarCola(await this.cola.pendientesPorMedico(medicoId))[0];
    if (!siguiente) throw new RecursoNoEncontradoException('Paciente en cola');

    if (!(await this.cola.marcarAtendido(siguiente.id))) {
      throw new ConflictoDeConcurrenciaException('El paciente de la cola');
    }
    return siguiente;
  }
}
