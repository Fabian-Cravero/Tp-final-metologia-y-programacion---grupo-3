import { Inject, Injectable } from '@nestjs/common';
import { Medico } from '../domain/entities/medico.entity';
import { type IMedicoRepository, MEDICO_REPOSITORY } from '../domain/repositories/medico-repository.interface';

@Injectable()
export class ListarMedicosUseCase {
  constructor(@Inject(MEDICO_REPOSITORY) private readonly medicos: IMedicoRepository) {}

  ejecutar(): Promise<Medico[]> {
    return this.medicos.listarActivos();
  }
}
