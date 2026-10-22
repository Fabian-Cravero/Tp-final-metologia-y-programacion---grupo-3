import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { esViolacionDeUnicidad } from '../../../shared/database/errores-pg';
import { DomainException } from '../../../shared/exceptions/domain.exception';
import { AsignacionCama } from '../../domain/entities/asignacion-cama.entity';
import { Cama } from '../../domain/entities/cama.entity';
import { type ICamaRepository } from '../../domain/repositories/cama-repository.interface';
import { EstadoCama } from '../../domain/state/cama-estado';

@Injectable()
export class TypeOrmCamaRepository implements ICamaRepository {
  constructor(
    @InjectRepository(Cama) private readonly camas: Repository<Cama>,
    @InjectRepository(AsignacionCama) private readonly asignaciones: Repository<AsignacionCama>,
    private readonly dataSource: DataSource,
  ) {}

  findById(id: string) {
    return this.camas.findOneBy({ id });
  }

  listar(sector?: string) {
    return this.camas.find({
      where: sector ? { sector } : {},
      order: { sector: 'ASC', codigo: 'ASC' },
    });
  }

  async crear(codigo: string, sector: string) {
    try {
      return await this.camas.save(this.camas.create({ codigo, sector }));
    } catch (error) {
      if (esViolacionDeUnicidad(error)) throw new DomainException(`Ya existe la cama ${codigo}`);
      throw error;
    }
  }

  findAsignacionVigentePorPaciente(pacienteId: string) {
    return this.asignaciones.findOne({
      where: { pacienteId, hasta: IsNull() },
      relations: { cama: true },
    });
  }

  async actualizarEstado(id: string, versionLeida: number, nuevoEstado: EstadoCama) {
    const r = await this.camas
      .createQueryBuilder()
      .update(Cama)
      .set({ estado: nuevoEstado, version: () => 'version + 1' })
      .where('id = :id AND version = :versionLeida', { id, versionLeida })
      .execute();
    return r.affected === 1;
  }

  asignar(camaId: string, versionLeida: number, pacienteId: string) {
    return this.dataSource.transaction(async (manager) => {
      const r = await manager
        .createQueryBuilder()
        .update(Cama)
        .set({ estado: EstadoCama.OCUPADA, version: () => 'version + 1' })
        .where('id = :camaId AND version = :versionLeida AND estado = :libre', {
          camaId,
          versionLeida,
          libre: EstadoCama.LIBRE,
        })
        .execute();
      if (r.affected !== 1) return null;

      return manager.save(manager.create(AsignacionCama, { cama: { id: camaId }, pacienteId }));
    });
  }

  liberar(camaId: string, versionLeida: number) {
    return this.dataSource.transaction(async (manager) => {
      const r = await manager
        .createQueryBuilder()
        .update(Cama)
        .set({ estado: EstadoCama.EN_LIMPIEZA, version: () => 'version + 1' })
        .where('id = :camaId AND version = :versionLeida AND estado = :ocupada', {
          camaId,
          versionLeida,
          ocupada: EstadoCama.OCUPADA,
        })
        .execute();
      if (r.affected !== 1) return false;

      await manager
        .createQueryBuilder()
        .update(AsignacionCama)
        .set({ hasta: () => 'now()' })
        .where('"camaId" = :camaId AND "hasta" IS NULL', { camaId })
        .execute();
      return true;
    });
  }
}
