import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Paciente } from '../../domain/entities/paciente.entity';
import { type IPacienteRepository } from '../../domain/repositories/paciente-repository.interface';

@Injectable()
export class TypeOrmPacienteRepository implements IPacienteRepository {
  constructor(@InjectRepository(Paciente) private readonly repo: Repository<Paciente>) {}

  findById(id: string) {
    return this.repo.findOneBy({ id });
  }

  findByDni(dni: string) {
    return this.repo.findOneBy({ dni });
  }

  buscar(texto: string) {
    return this.repo.find({
      where: [{ apellido: ILike(`%${texto}%`) }, { dni: ILike(`${texto}%`) }],
      order: { apellido: 'ASC' },
      take: 20,
    });
  }

  save(paciente: Paciente) {
    return this.repo.save(paciente);
  }
}
