import { Alergia } from '../entities/alergia.entity';
import { AntecedenteFamiliar } from '../entities/antecedente-familiar.entity';
import { Evolucion } from '../entities/evolucion.entity';
import { HistoriaClinica } from '../entities/historia-clinica.entity';

export interface IHistoriaClinicaRepository {
  findByPaciente(pacienteId: string): Promise<HistoriaClinica | null>;
  /** Si otra petición la creó al mismo tiempo, devuelve esa (la base no deja duplicar). */
  crear(pacienteId: string, grupoSanguineo: string | null): Promise<HistoriaClinica>;

  agregarAlergia(historiaId: string, sustancia: string, severidad: string): Promise<Alergia>;
  agregarAntecedente(historiaId: string, parentesco: string, descripcion: string): Promise<AntecedenteFamiliar>;
  agregarEvolucion(historiaId: string, medicoId: string, nota: string): Promise<Evolucion>;

  listarAlergias(historiaId: string): Promise<Alergia[]>;
  listarAntecedentes(historiaId: string): Promise<AntecedenteFamiliar[]>;
  /** Más recientes primero. */
  listarEvoluciones(historiaId: string, limite: number): Promise<Evolucion[]>;
}

export const HISTORIA_CLINICA_REPOSITORY = Symbol('HISTORIA_CLINICA_REPOSITORY');
