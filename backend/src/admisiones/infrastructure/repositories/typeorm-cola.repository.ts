import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColaEntreturno } from '../../domain/entities/cola-entreturno.entity';
import { type IColaRepository } from '../../domain/repositories/cola-repository.interface';

@Injectable()
export class TypeOrmColaRepository implements IColaRepository {
  constructor(@InjectRepository(ColaEntreturno) private readonly repo: Repository<ColaEntreturno>) {}

  agregar(pacienteId: string, medicoId: string, prioridad: string) {
    return this.repo.save(
      this.repo.create({ paciente: { id: pacienteId }, medico: { id: medicoId }, prioridad }),
    );
  }

  pendientesPorMedico(medicoId: string) {
    return this.repo.find({
      where: { medico: { id: medicoId }, atendido: false },
      relations: { paciente: true },
    });
  }

  async marcarAtendido(id: string) {
    const r = await this.repo.update({ id, atendido: false }, { atendido: true });
    return r.affected === 1;
  }
}
