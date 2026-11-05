import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndicacionMedica } from '../../domain/entities/indicacion-medica.entity';
import {
  type IIndicacionRepository,
  type NuevaIndicacion,
} from '../../domain/repositories/indicacion-repository.interface';

@Injectable()
export class TypeOrmIndicacionRepository implements IIndicacionRepository {
  constructor(@InjectRepository(IndicacionMedica) private readonly repo: Repository<IndicacionMedica>) {}

  crear(d: NuevaIndicacion) {
    return this.repo.save(
      this.repo.create({
        pacienteId: d.pacienteId,
        medicoId: d.medicoId,
        tipo: d.tipo,
        descripcion: d.descripcion,
        insumoId: d.insumoId ?? null,
        cantidad: d.cantidad ?? null,
      }),
    );
  }

  findById(id: string) {
    return this.repo.findOneBy({ id });
  }

  listarPendientes(pacienteId: string) {
    return this.repo.find({ where: { pacienteId, estado: 'pendiente' }, order: { creadaEn: 'ASC' } });
  }

  async marcarCumplida(id: string) {
    const r = await this.repo.update({ id, estado: 'pendiente' }, { estado: 'cumplida' });
    return r.affected === 1;
  }

  async cancelar(id: string) {
    const r = await this.repo.update({ id, estado: 'pendiente' }, { estado: 'cancelada' });
    return r.affected === 1;
  }

  async reabrir(id: string) {
    await this.repo.update({ id }, { estado: 'pendiente' });
  }
}
