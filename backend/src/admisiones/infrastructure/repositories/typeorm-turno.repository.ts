import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { esViolacionDeUnicidad } from '../../../shared/database/errores-pg';
import { ConflictoDeConcurrenciaException } from '../../../shared/exceptions/domain.exception';
import { Turno } from '../../domain/entities/turno.entity';
import {
  type ITurnoRepository,
  type NuevoEntreturno,
  type NuevoTurno,
} from '../../domain/repositories/turno-repository.interface';
import { type EstadoTurno } from '../../domain/state/turno-estado';

@Injectable()
export class TypeOrmTurnoRepository implements ITurnoRepository {
  constructor(@InjectRepository(Turno) private readonly repo: Repository<Turno>) {}

  findById(id: string) {
    return this.repo.findOne({ where: { id }, relations: { paciente: true, medico: true } });
  }

  async crear(datos: NuevoTurno): Promise<Turno> {
    const turno = this.repo.create({
      paciente: { id: datos.pacienteId },
      medico: { id: datos.medicoId },
      fechaHora: datos.fechaHora,
      motivo: datos.motivo ?? null,
      prioridad: datos.prioridad ?? 'normal',
      duracionMinutos: datos.duracionMinutos ?? 30,
    });

    try {
      return await this.repo.save(turno);
    } catch (error) {
      if (esViolacionDeUnicidad(error)) throw new ConflictoDeConcurrenciaException('El horario');
      throw error;
    }
  }

  async actualizarEstado(id: string, versionLeida: number, nuevoEstado: EstadoTurno) {
    const resultado = await this.repo
      .createQueryBuilder()
      .update(Turno)
      .set({ estado: nuevoEstado, version: () => 'version + 1' })
      .where('id = :id AND version = :versionLeida', { id, versionLeida })
      .execute();

    return resultado.affected === 1;
  }

  async insertarEntreturno(datos: NuevoEntreturno): Promise<Turno> {
    try {
      // Transacción: si cualquiera de los dos pasos falla, se deshace todo.
      return await this.repo.manager.transaction(async (manager) => {
        // 1. Achicar el turno anterior, solo si nadie lo modificó desde que leímos la agenda.
        const achicado = await manager
          .createQueryBuilder()
          .update(Turno)
          .set({
            duracionMinutos: datos.nuevaDuracionAnterior,
            duracionReducida: true,
            version: () => 'version + 1',
          })
          .where('id = :id AND version = :version', { id: datos.turnoAnteriorId, version: datos.versionAnterior })
          .execute();
        if (achicado.affected !== 1) throw new ConflictoDeConcurrenciaException('El turno anterior');

        // 2. Crear el entreturno. El índice único protege si otro turno tomó el horario.
        const entreturno = manager.create(Turno, {
          paciente: { id: datos.pacienteId },
          medico: { id: datos.medicoId },
          fechaHora: datos.fechaHora,
          motivo: datos.motivo ?? null,
          duracionMinutos: datos.duracionMinutos,
          esEntreturno: true,
        });
        return manager.save(entreturno);
      });
    } catch (error) {
      if (esViolacionDeUnicidad(error)) throw new ConflictoDeConcurrenciaException('El horario');
      throw error;
    }
  }

  listarPorMedicoYDia(medicoId: string, dia: Date) {
    const desde = new Date(dia);
    desde.setHours(0, 0, 0, 0);
    const hasta = new Date(desde);
    hasta.setDate(hasta.getDate() + 1);

    return this.repo.find({
      where: {
        medico: { id: medicoId },
        fechaHora: Between(desde, new Date(hasta.getTime() - 1)),
      },
      relations: { paciente: true },
      order: { fechaHora: 'ASC' },
    });
  }
}
