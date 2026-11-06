import { Inject, Injectable } from '@nestjs/common';
import {
  type IMedicoRepository,
  MEDICO_REPOSITORY,
} from '../../admisiones/domain/repositories/medico-repository.interface';
import {
  type IPacienteRepository,
  PACIENTE_REPOSITORY,
} from '../../admisiones/domain/repositories/paciente-repository.interface';
import { RolUsuario } from '../../iam/domain/enums/rol.enum';
import { AccesoDenegadoException } from '../../shared/exceptions/domain.exception';
import { Alergia } from '../domain/entities/alergia.entity';
import { AntecedenteFamiliar } from '../domain/entities/antecedente-familiar.entity';
import { Evolucion } from '../domain/entities/evolucion.entity';
import { HistoriaClinica } from '../domain/entities/historia-clinica.entity';
import {
  HISTORIA_CLINICA_REPOSITORY,
  type IHistoriaClinicaRepository,
} from '../domain/repositories/historia-clinica-repository.interface';
import { historiaRequerida } from './historia-requerida';

/** Quién firmó la evolución, para mostrarlo sin otra consulta. */
export interface FirmaMedico {
  id: string;
  nombre: string;
  apellido: string;
  matricula: string;
  especialidad: string;
}

export type EvolucionFirmada = Evolucion & { medico: FirmaMedico | null };

export interface HistoriaCompleta {
  historia: HistoriaClinica;
  alergias: Alergia[];
  antecedentes: AntecedenteFamiliar[];
  evoluciones: EvolucionFirmada[];
}

/** Quién pide la historia: sale del token, nunca del cuerpo de la petición. */
export interface Solicitante {
  id: string;
  rol: string;
}

@Injectable()
export class ObtenerHistoriaCompletaUseCase {
  constructor(
    @Inject(HISTORIA_CLINICA_REPOSITORY) private readonly historias: IHistoriaClinicaRepository,
    @Inject(PACIENTE_REPOSITORY) private readonly pacientes: IPacienteRepository,
    @Inject(MEDICO_REPOSITORY) private readonly medicos: IMedicoRepository,
  ) {}

  async ejecutar(
    pacienteId: string,
    solicitante?: Solicitante,
    limiteEvoluciones = 50,
  ): Promise<HistoriaCompleta> {
    // Un paciente solo puede ver su propia historia (403 si pide la de otro).
    if (solicitante?.rol === RolUsuario.PACIENTE) {
      const propio = await this.pacientes.findByUsuarioId(solicitante.id);
      if (propio?.id !== pacienteId) {
        throw new AccesoDenegadoException('Solo podés ver tu propia historia clínica');
      }
    }

    const historia = await historiaRequerida(this.historias, pacienteId);

    const [alergias, antecedentes, evoluciones] = await Promise.all([
      this.historias.listarAlergias(historia.id),
      this.historias.listarAntecedentes(historia.id),
      this.historias.listarEvoluciones(historia.id, limiteEvoluciones),
    ]);

    return { historia, alergias, antecedentes, evoluciones: await this.conFirma(evoluciones) };
  }

  /** Agrega a cada evolución los datos del médico que la firmó (una consulta por médico distinto). */
  private async conFirma(evoluciones: Evolucion[]): Promise<EvolucionFirmada[]> {
    const ids = [...new Set(evoluciones.map((e) => e.medicoId))];
    const firmas = new Map<string, FirmaMedico | null>();
    for (const id of ids) {
      const m = await this.medicos.findById(id);
      firmas.set(id, m ? { id: m.id, nombre: m.nombre, apellido: m.apellido, matricula: m.matricula, especialidad: m.especialidad } : null);
    }
    return evoluciones.map((e) => Object.assign(e, { medico: firmas.get(e.medicoId) ?? null }));
  }
}
