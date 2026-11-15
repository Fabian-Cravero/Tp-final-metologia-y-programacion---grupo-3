import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { esViolacionDeUnicidad } from '../../../shared/database/errores-pg';
import { DomainException } from '../../../shared/exceptions/domain.exception';
import { EstadoListaEspera, ListaEspera } from '../../domain/entities/lista-espera.entity';
import { type IListaEsperaRepository } from '../../domain/repositories/lista-espera-repository.interface';

const YA_ESTA_EN_LISTA = 'El paciente ya está en la lista de espera de ese médico para ese día';

@Injectable()
export class TypeOrmListaEsperaRepository implements IListaEsperaRepository {
  constructor(@InjectRepository(ListaEspera) private readonly repo: Repository<ListaEspera>) {}

  async agregar(pacienteId: string, medicoId: string, dia: string) {
    try {
      return await this.repo.save(
        this.repo.create({ paciente: { id: pacienteId }, medico: { id: medicoId }, dia }),
      );
    } catch (error) {
      // El índice único parcial evita que el mismo paciente quede dos veces esperando (422).
      if (esViolacionDeUnicidad(error)) throw new DomainException(YA_ESTA_EN_LISTA);
      throw error;
    }
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id }, relations: { paciente: true } });
  }

  listarPorMedicoYDia(medicoId: string, dia: string) {
    return this.repo.find({
      where: { medico: { id: medicoId }, dia },
      relations: { paciente: true },
      order: { creadoEn: 'ASC' },
    });
  }

  esperandoPorMedicoYDia(medicoId: string, dia: string) {
    return this.repo.find({
      where: { medico: { id: medicoId }, dia, estado: EstadoListaEspera.ESPERANDO },
      relations: { paciente: true },
      order: { creadoEn: 'ASC' },
    });
  }

  async tomar(id: string) {
    const r = await this.repo.update(
      { id, estado: EstadoListaEspera.ESPERANDO },
      { estado: EstadoListaEspera.ASIGNADO },
    );
    return r.affected === 1;
  }

  async registrarAsignacion(id: string, turnoId: string, fechaHora: Date) {
    await this.repo.update({ id }, { turnoAsignadoId: turnoId, fechaHoraAsignada: fechaHora });
  }

  async devolverALaEspera(id: string) {
    await this.repo.update(
      { id, estado: EstadoListaEspera.ASIGNADO },
      { estado: EstadoListaEspera.ESPERANDO, turnoAsignadoId: null, fechaHoraAsignada: null },
    );
  }

  async marcarAvisado(id: string) {
    const r = await this.repo.update({ id, avisado: false }, { avisado: true });
    return r.affected === 1;
  }
}
