import { ColaEntreturno } from '../entities/cola-entreturno.entity';

export interface IColaRepository {
  agregar(pacienteId: string, medicoId: string, prioridad: string): Promise<ColaEntreturno>;
  pendientesPorMedico(medicoId: string): Promise<ColaEntreturno[]>;
  /** UPDATE ... WHERE atendido = false. false => otro médico ya lo llamó. */
  marcarAtendido(id: string): Promise<boolean>;
}

export const COLA_REPOSITORY = Symbol('COLA_REPOSITORY');
