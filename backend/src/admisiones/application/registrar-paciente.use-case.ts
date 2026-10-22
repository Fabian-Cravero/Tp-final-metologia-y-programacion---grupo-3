import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '../../shared/exceptions/domain.exception';
import { Paciente } from '../domain/entities/paciente.entity';
import {
  type IPacienteRepository,
  PACIENTE_REPOSITORY,
} from '../domain/repositories/paciente-repository.interface';

export interface RegistrarPacienteCommand {
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  telefono?: string;
  email?: string;
  coberturaId?: string;
}

@Injectable()
export class RegistrarPacienteUseCase {
  constructor(@Inject(PACIENTE_REPOSITORY) private readonly pacientes: IPacienteRepository) {}

  async ejecutar(cmd: RegistrarPacienteCommand): Promise<Paciente> {
    if (await this.pacientes.findByDni(cmd.dni)) {
      throw new DomainException(`Ya existe un paciente con DNI ${cmd.dni}`);
    }

    const paciente = new Paciente();
    paciente.dni = cmd.dni;
    paciente.nombre = cmd.nombre.trim();
    paciente.apellido = cmd.apellido.trim();
    paciente.fechaNacimiento = cmd.fechaNacimiento;
    paciente.telefono = cmd.telefono ?? null;
    paciente.email = cmd.email ?? null;
    paciente.coberturaId = cmd.coberturaId ?? null;
    paciente.usuarioId = null;

    return this.pacientes.save(paciente);
  }
}
