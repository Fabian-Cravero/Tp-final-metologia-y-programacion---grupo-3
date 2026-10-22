import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medico } from '../../domain/entities/medico.entity';
import { type IMedicoRepository } from '../../domain/repositories/medico-repository.interface';

@Injectable()
export class TypeOrmMedicoRepository implements IMedicoRepository {
  constructor(@InjectRepository(Medico) private readonly repo: Repository<Medico>) {}

  findById(id: string) {
    return this.repo.findOneBy({ id });
  }

  findByUsuarioId(usuarioId: string) {
    return this.repo.findOneBy({ usuarioId });
  }

  listarActivos() {
    return this.repo.find({ where: { activo: true }, order: { apellido: 'ASC' } });
  }

  save(medico: Medico) {
    return this.repo.save(medico);
  }
}
