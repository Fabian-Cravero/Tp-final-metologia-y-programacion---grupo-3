import { SignoVital } from '../entities/signo-vital.entity';

export interface NuevoSignoVital {
  pacienteId: string;
  registradoPorId: string;
  tipo: string;
  valor: number;
  unidad: string;
}

export interface ISignoVitalRepository {
  registrar(datos: NuevoSignoVital): Promise<SignoVital>;
  /** Más recientes primero. */
  historialDePaciente(pacienteId: string, limite: number): Promise<SignoVital[]>;
}

export const SIGNO_VITAL_REPOSITORY = Symbol('SIGNO_VITAL_REPOSITORY');
