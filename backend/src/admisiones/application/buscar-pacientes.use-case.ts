import { Inject, Injectable } from '@nestjs/common';
import { Paciente } from '../domain/entities/paciente.entity';
import {
  type IPacienteRepository,
  PACIENTE_REPOSITORY,
} from '../domain/repositories/paciente-repository.interface';

@Injectable()
export class BuscarPacientesUseCase {
  constructor(@Inject(PACIENTE_REPOSITORY) private readonly pacientes: IPacienteRepository) {}

  ejecutar(texto: string): Promise<Paciente[]> {
    return this.pacientes.buscar(texto.trim());
  }
}
