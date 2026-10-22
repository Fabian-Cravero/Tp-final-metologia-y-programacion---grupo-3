import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { esViolacionDeUnicidad } from '../../../shared/database/errores-pg';
import { ConflictoDeConcurrenciaException } from '../../../shared/exceptions/domain.exception';
import { Turno } from '../../domain/entities/turno.entity';
import { type ITurnoRepository, type NuevoTurno } from '../../domain/repositories/turno-repository.interface';
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
