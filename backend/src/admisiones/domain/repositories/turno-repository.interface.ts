import { Turno } from '../entities/turno.entity';
import { type EstadoTurno } from '../state/turno-estado';

export interface NuevoTurno {
  pacienteId: string;
  medicoId: string;
  fechaHora: Date;
  motivo?: string;
  prioridad?: string;
  /** Si no se indica, 30 minutos. */
  duracionMinutos?: number;
}

/** HU 1.2: datos para insertar un entreturno achicando el turno anterior. */
export interface NuevoEntreturno {
  pacienteId: string;
  medicoId: string;
  fechaHora: Date;
  duracionMinutos: number;
  motivo?: string;
  turnoAnteriorId: string;
  /** Versión del turno anterior al momento de leer la agenda (concurrencia optimista). */
  versionAnterior: number;
  nuevaDuracionAnterior: number;
}

export interface ITurnoRepository {
  findById(id: string): Promise<Turno | null>;
  /** Lanza ConflictoDeConcurrenciaException si el horario ya está tomado. */
  crear(datos: NuevoTurno): Promise<Turno>;
  /** UPDATE condicional por versión. false => otra petición modificó el turno antes. */
  actualizarEstado(id: string, versionLeida: number, nuevoEstado: EstadoTurno): Promise<boolean>;
  listarPorMedicoYDia(medicoId: string, dia: Date): Promise<Turno[]>;
  /**
   * HU 1.2: achica el turno anterior y crea el entreturno en UNA transacción (o las dos cosas o ninguna).
   * Lanza ConflictoDeConcurrenciaException si el turno anterior cambió mientras tanto
   * o si otro turno ya ocupó ese horario.
   */
  insertarEntreturno(datos: NuevoEntreturno): Promise<Turno>;
}

export const TURNO_REPOSITORY = Symbol('TURNO_REPOSITORY');
