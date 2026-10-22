import { Inject, Injectable } from '@nestjs/common';
import { CAMA_REPOSITORY, type ICamaRepository } from '../domain/repositories/cama-repository.interface';
import { TransicionarCamaBase } from './transicionar-cama.base';

@Injectable()
export class HabilitarCamaUseCase extends TransicionarCamaBase {
  protected readonly accion = 'habilitar' as const;

  constructor(@Inject(CAMA_REPOSITORY) camas: ICamaRepository) {
    super(camas);
  }
}