import { Inject, Injectable } from '@nestjs/common';
import {
  ConflictoDeConcurrenciaException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { siguienteEstadoCama } from '../domain/cama-workflow';
import { CAMA_REPOSITORY, type ICamaRepository } from '../domain/repositories/cama-repository.interface';

@Injectable()
export class LiberarCamaUseCase {
  constructor(@Inject(CAMA_REPOSITORY) private readonly camas: ICamaRepository) {}

  async ejecutar(camaId: string): Promise<void> {
    const cama = await this.camas.findById(camaId);
    if (!cama) throw new RecursoNoEncontradoException('Cama');

    siguienteEstadoCama(cama.estado, 'liberar');

    if (!(await this.camas.liberar(cama.id, cama.version))) {
      throw new ConflictoDeConcurrenciaException('La cama');
    }
  }
}
