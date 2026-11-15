import { Inject, Injectable } from '@nestjs/common';
import {
  DomainException,
  RecursoNoEncontradoException,
} from '../../shared/exceptions/domain.exception';
import { diaLocal } from '../domain/dia-local';
import { ListaEspera } from '../domain/entities/lista-espera.entity';
import {
  type IListaEsperaRepository,
  LISTA_ESPERA_REPOSITORY,
} from '../domain/repositories/lista-espera-repository.interface';
import {
  type IMedicoRepository,
  MEDICO_REPOSITORY,
} from '../domain/repositories/medico-repository.interface';
import {
  type IPacienteRepository,
  PACIENTE_REPOSITORY,
} from '../domain/repositories/paciente-repository.interface';

export interface AgregarAListaEsperaCommand {
  pacienteId: string;
  medicoId: string;
  /** 'AAAA-MM-DD' */
  dia: string;
}

/** HU 1.3: la recepcionista anota a un paciente para que reciba el primer horario que se libere. */
@Injectable()
export class AgregarAListaEsperaUseCase {
  constructor(
    @Inject(LISTA_ESPERA_REPOSITORY) private readonly lista: IListaEsperaRepository,
    @Inject(PACIENTE_REPOSITORY) private readonly pacientes: IPacienteRepository,
    @Inject(MEDICO_REPOSITORY) private readonly medicos: IMedicoRepository,
  ) {}

  async ejecutar(cmd: AgregarAListaEsperaCommand): Promise<ListaEspera> {
    if (cmd.dia < diaLocal(new Date())) {
      throw new DomainException('No se puede anotar en la lista de espera de un día que ya pasó');
    }
    if (!(await this.pacientes.findById(cmd.pacienteId))) {
      throw new RecursoNoEncontradoException('Paciente');
    }
    const medico = await this.medicos.findById(cmd.medicoId);
    if (!medico) throw new RecursoNoEncontradoException('Médico');
    if (!medico.activo) throw new DomainException('El médico no está disponible');

    return this.lista.agregar(cmd.pacienteId, cmd.medicoId, cmd.dia);
  }
}
