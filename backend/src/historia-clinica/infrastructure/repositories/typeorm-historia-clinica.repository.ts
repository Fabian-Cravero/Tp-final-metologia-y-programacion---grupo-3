import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { esViolacionDeUnicidad } from '../../../shared/database/errores-pg';
import { DomainException } from '../../../shared/exceptions/domain.exception';
import { Alergia } from '../../domain/entities/alergia.entity';
import { AntecedenteFamiliar } from '../../domain/entities/antecedente-familiar.entity';
import { Evolucion } from '../../domain/entities/evolucion.entity';
import { HistoriaClinica } from '../../domain/entities/historia-clinica.entity';
import { type IHistoriaClinicaRepository } from '../../domain/repositories/historia-clinica-repository.interface';

@Injectable()
export class TypeOrmHistoriaClinicaRepository implements IHistoriaClinicaRepository {
  constructor(
    @InjectRepository(HistoriaClinica) private readonly historias: Repository<HistoriaClinica>,
    @InjectRepository(Alergia) private readonly alergias: Repository<Alergia>,
    @InjectRepository(AntecedenteFamiliar) private readonly antecedentes: Repository<AntecedenteFamiliar>,
    @InjectRepository(Evolucion) private readonly evoluciones: Repository<Evolucion>,
  ) {}

  findByPaciente(pacienteId: string) {
    return this.historias.findOneBy({ pacienteId });
  }

  async crear(pacienteId: string, grupoSanguineo: string | null) {
    try {
      return await this.historias.save(this.historias.create({ pacienteId, grupoSanguineo }));
    } catch (error) {
      // Dos aperturas simultáneas: la base (pacienteId unique) deja pasar solo una.
      if (esViolacionDeUnicidad(error)) throw new DomainException('El paciente ya tiene historia clínica');
      throw error;
    }
  }

  agregarAlergia(historiaId: string, sustancia: string, severidad: string) {
    return this.alergias.save(
      this.alergias.create({ historiaClinica: { id: historiaId }, sustancia, severidad }),
    );
  }

  agregarAntecedente(historiaId: string, parentesco: string, descripcion: string) {
    return this.antecedentes.save(
      this.antecedentes.create({ historiaClinica: { id: historiaId }, parentesco, descripcion }),
    );
  }

  agregarEvolucion(historiaId: string, medicoId: string, nota: string) {
    return this.evoluciones.save(
      this.evoluciones.create({ historiaClinica: { id: historiaId }, medicoId, nota }),
    );
  }

  listarAlergias(historiaId: string) {
    return this.alergias.find({ where: { historiaClinica: { id: historiaId } } });
  }

  listarAntecedentes(historiaId: string) {
    return this.antecedentes.find({ where: { historiaClinica: { id: historiaId } } });
  }

  listarEvoluciones(historiaId: string, limite: number) {
    return this.evoluciones.find({
      where: { historiaClinica: { id: historiaId } },
      order: { fecha: 'DESC' },
      take: limite,
    });
  }
}
