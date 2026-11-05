import { Inject, Injectable } from '@nestjs/common';
import {
  type IMedicoRepository,
  MEDICO_REPOSITORY,
} from '../../admisiones/domain/repositories/medico-repository.interface';
import {
  type IPacienteRepository,
  PACIENTE_REPOSITORY,
} from '../../admisiones/domain/repositories/paciente-repository.interface';
import {
  DomainException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { IndicacionMedica } from '../domain/entities/indicacion-medica.entity';
import {
  type IIndicacionRepository,
  INDICACION_REPOSITORY,
} from '../domain/repositories/indicacion-repository.interface';

export const TIPOS_INDICACION = ['medicacion', 'estudio', 'dieta', 'otro'];

export interface IndicarCommand {
  pacienteId: string;
  /** Id del usuario logueado (sale del token, nunca del cuerpo de la petición). */
  usuarioMedicoId: string;
  tipo: string;
  descripcion: string;
  insumoId?: string;
  cantidad?: number;
}

@Injectable()
export class IndicarUseCase {
  constructor(
    @Inject(INDICACION_REPOSITORY) private readonly indicaciones: IIndicacionRepository,
    @Inject(PACIENTE_REPOSITORY) private readonly pacientes: IPacienteRepository,
    @Inject(MEDICO_REPOSITORY) private readonly medicos: IMedicoRepository,
  ) {}

  async ejecutar(cmd: IndicarCommand): Promise<IndicacionMedica> {
    const descripcion = (cmd.descripcion ?? '').trim();
    if (!descripcion) throw new DomainException('La indicación necesita una descripción');
    if (!TIPOS_INDICACION.includes(cmd.tipo)) {
      throw new DomainException(`Tipo de indicación desconocido: "${cmd.tipo}"`);
    }

    if (!(await this.pacientes.findById(cmd.pacienteId))) {
      throw new RecursoNoEncontradoException('Paciente');
    }
    const medico = await this.medicos.findByUsuarioId(cmd.usuarioMedicoId);
    if (!medico) throw new RecursoNoEncontradoException('Médico asociado al usuario');

    const esMedicacion = cmd.tipo === 'medicacion';
    if (esMedicacion && (!cmd.insumoId || !cmd.cantidad)) {
      throw new DomainException('Una indicación de medicación necesita insumo y cantidad');
    }

    return this.indicaciones.crear({
      pacienteId: cmd.pacienteId,
      medicoId: medico.id,
      tipo: cmd.tipo,
      descripcion,
      // Insumo y cantidad solo tienen sentido para medicación.
      insumoId: esMedicacion ? cmd.insumoId : undefined,
      cantidad: esMedicacion ? cmd.cantidad : undefined,
    });
  }
}
