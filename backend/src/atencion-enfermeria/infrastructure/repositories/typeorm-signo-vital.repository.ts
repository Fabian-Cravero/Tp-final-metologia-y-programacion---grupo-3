import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignoVital } from '../../domain/entities/signo-vital.entity';
import {
  type ISignoVitalRepository,
  type NuevoSignoVital,
} from '../../domain/repositories/signo-vital-repository.interface';

@Injectable()
export class TypeOrmSignoVitalRepository implements ISignoVitalRepository {
  constructor(@InjectRepository(SignoVital) private readonly repo: Repository<SignoVital>) {}

  registrar(datos: NuevoSignoVital) {
    // numeric de Postgres se guarda y se lee como texto.
    return this.repo.save(this.repo.create({ ...datos, valor: String(datos.valor) }));
  }

  historialDePaciente(pacienteId: string, limite: number) {
    return this.repo.find({ where: { pacienteId }, order: { registradoEn: 'DESC' }, take: limite });
  }
}
