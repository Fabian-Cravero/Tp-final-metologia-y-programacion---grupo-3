import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventoDominio } from '../../domain/entities/evento-dominio.entity';
import { type IEventoDominioRepository } from '../../domain/repositories/evento-dominio-repository.interface';

@Injectable()
export class TypeOrmEventoDominioRepository implements IEventoDominioRepository {
  constructor(@InjectRepository(EventoDominio) private readonly repo: Repository<EventoDominio>) {}

  registrar(tipo: string, payload: Record<string, unknown>) {
    return this.repo.save(this.repo.create({ tipo, payload }));
  }

  async marcarProcesado(id: string) {
    await this.repo.update({ id }, { procesado: true });
  }

  async existeProcesado(tipo: string, indicacionId: string) {
    const cantidad = await this.repo
      .createQueryBuilder('e')
      .where('e.tipo = :tipo', { tipo })
      .andWhere('e.procesado = true')
      .andWhere(`e.payload ->> 'indicacionId' = :indicacionId`, { indicacionId })
      .getCount();
    return cantidad > 0;
  }

  listarPendientes() {
    return this.repo.find({ where: { procesado: false }, order: { creadoEn: 'ASC' } });
  }
}
