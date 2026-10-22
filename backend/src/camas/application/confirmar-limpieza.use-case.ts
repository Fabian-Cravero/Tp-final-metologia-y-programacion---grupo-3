import { Inject, Injectable } from '@nestjs/common';
import { CAMA_REPOSITORY, type ICamaRepository } from '../domain/repositories/cama-repository.interface';
import { TransicionarCamaBase } from './transicionar-cama.base';

@Injectable()
export class ConfirmarLimpiezaUseCase extends TransicionarCamaBase {
  protected readonly accion = 'confirmarLimpieza' as const;

  constructor(@Inject(CAMA_REPOSITORY) camas: ICamaRepository) {
    super(camas);
  }
}