import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '../../shared/exceptions/domain.exception';
import { Turno } from '../domain/entities/turno.entity';
import { type ITurnoRepository, TURNO_REPOSITORY } from '../domain/repositories/turno-repository.interface';

@Injectable()
export class ListarAgendaUseCase {
  constructor(@Inject(TURNO_REPOSITORY) private readonly turnos: ITurnoRepository) {}

  ejecutar(medicoId: string, dia: Date): Promise<Turno[]> {
    if (!(dia instanceof Date) || Number.isNaN(dia.getTime())) {
      throw new DomainException('El día es inválido: usar el formato AAAA-MM-DD');
    }
    return this.turnos.listarPorMedicoYDia(medicoId, dia);
  }
}
