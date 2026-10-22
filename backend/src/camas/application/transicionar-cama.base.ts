import {
  ConflictoDeConcurrenciaException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { type AccionCama, siguienteEstadoCama } from '../domain/cama-workflow';
import { Cama } from '../domain/entities/cama.entity';
import { type ICamaRepository } from '../domain/repositories/cama-repository.interface';

export abstract class TransicionarCamaBase {
  protected abstract readonly accion: AccionCama;

  constructor(protected readonly camas: ICamaRepository) {}

  async ejecutar(camaId: string): Promise<Cama> {
    const cama = await this.camas.findById(camaId);
    if (!cama) throw new RecursoNoEncontradoException('Cama');

    const nuevoEstado = siguienteEstadoCama(cama.estado, this.accion);
    if (!(await this.camas.actualizarEstado(cama.id, cama.version, nuevoEstado))) {
      throw new ConflictoDeConcurrenciaException('La cama');
    }
    return (await this.camas.findById(cama.id)) ?? cama;
  }
}
