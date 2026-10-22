import { Turno } from '../entities/turno.entity';
import { type EstadoTurno } from '../state/turno-estado';

export interface NuevoTurno {
  pacienteId: string;
  medicoId: string;
  fechaHora: Date;
  motivo?: string;
  prioridad?: string;
}

export interface ITurnoRepository {
  findById(id: string): Promise<Turno | null>;
  /** Lanza ConflictoDeConcurrenciaException si el horario ya está tomado. */
  crear(datos: NuevoTurno): Promise<Turno>;
  /** UPDATE condicional por versión. false => otra petición modificó el turno antes. */
  actualizarEstado(id: string, versionLeida: number, nuevoEstado: EstadoTurno): Promise<boolean>;
  listarPorMedicoYDia(medicoId: string, dia: Date): Promise<Turno[]>;
}

export const TURNO_REPOSITORY = Symbol('TURNO_REPOSITORY');
