import { Inject, Injectable } from '@nestjs/common';
import {
  DomainException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { EstadoListaEspera, ListaEspera } from '../domain/entities/lista-espera.entity';
import {
  type IListaEsperaRepository,
  LISTA_ESPERA_REPOSITORY,
} from '../domain/repositories/lista-espera-repository.interface';

/** HU 1.3: la recepcionista confirma que ya le avisó al paciente su nuevo horario. */
@Injectable()
export class MarcarAvisadoUseCase {
  constructor(@Inject(LISTA_ESPERA_REPOSITORY) private readonly lista: IListaEsperaRepository) {}

  async ejecutar(id: string): Promise<ListaEspera> {
    const registro = await this.lista.findById(id);
    if (!registro) throw new RecursoNoEncontradoException('Registro de la lista de espera');
    if (registro.estado !== EstadoListaEspera.ASIGNADO) {
      throw new DomainException('El paciente todavía no tiene un turno asignado');
    }
    await this.lista.marcarAvisado(id); // si ya estaba avisado, no pasa nada
    return { ...registro, avisado: true };
  }
}
