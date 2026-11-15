import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '../../shared/exceptions/domain.exception';
import { ListaEspera } from '../domain/entities/lista-espera.entity';
import {
  type IListaEsperaRepository,
  LISTA_ESPERA_REPOSITORY,
} from '../domain/repositories/lista-espera-repository.interface';

@Injectable()
export class ListarListaEsperaUseCase {
  constructor(@Inject(LISTA_ESPERA_REPOSITORY) private readonly lista: IListaEsperaRepository) {}

  ejecutar(medicoId: string, dia: string): Promise<ListaEspera[]> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dia ?? '')) {
      throw new DomainException('El día es inválido: usar el formato AAAA-MM-DD');
    }
    return this.lista.listarPorMedicoYDia(medicoId, dia);
  }
}
