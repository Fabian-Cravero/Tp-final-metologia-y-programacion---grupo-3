import { Inject, Injectable } from '@nestjs/common';
import { esViolacionDeUnicidad } from '../../shared/database/errores-pg';
import { DomainException } from '../../shared/exceptions/domain.exception';
import { Medico } from '../domain/entities/medico.entity';
import { type IMedicoRepository, MEDICO_REPOSITORY } from '../domain/repositories/medico-repository.interface';

export interface RegistrarMedicoCommand {
  matricula: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  usuarioId?: string;
}

@Injectable()
export class RegistrarMedicoUseCase {
  constructor(@Inject(MEDICO_REPOSITORY) private readonly medicos: IMedicoRepository) {}

  async ejecutar(cmd: RegistrarMedicoCommand): Promise<Medico> {
    if (cmd.usuarioId && (await this.medicos.findByUsuarioId(cmd.usuarioId))) {
      throw new DomainException('Ese usuario ya está asociado a otro médico');
    }

    const medico = new Medico();
    medico.matricula = cmd.matricula.trim();
    medico.nombre = cmd.nombre.trim();
    medico.apellido = cmd.apellido.trim();
    medico.especialidad = cmd.especialidad.trim();
    medico.usuarioId = cmd.usuarioId ?? null;
    medico.activo = true;

    try {
      return await this.medicos.save(medico);
    } catch (error) {
      // La matrícula es única: si dos altas llegan juntas, la base rechaza la segunda.
      if (esViolacionDeUnicidad(error)) {
        throw new DomainException(`Ya existe un médico con matrícula ${medico.matricula}`);
      }
      throw error;
    }
  }
}
