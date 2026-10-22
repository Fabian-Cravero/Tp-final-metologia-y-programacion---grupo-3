import { AsignacionCama } from '../entities/asignacion-cama.entity';
import { Cama } from '../entities/cama.entity';
import { EstadoCama } from '../state/cama-estado';

export interface ICamaRepository {
  findById(id: string): Promise<Cama | null>;
  listar(sector?: string): Promise<Cama[]>;
  crear(codigo: string, sector: string): Promise<Cama>;
  findAsignacionVigentePorPaciente(pacienteId: string): Promise<AsignacionCama | null>;

  /** Cambio de estado simple. false => la versión cambió (otra petición ganó). */
  actualizarEstado(id: string, versionLeida: number, nuevoEstado: EstadoCama): Promise<boolean>;

  /** Cama libre -> ocupada + nueva asignación, en una transacción. null => perdió la carrera. */
  asignar(camaId: string, versionLeida: number, pacienteId: string): Promise<AsignacionCama | null>;

  /** Cama ocupada -> en limpieza + cierra la asignación vigente. false => perdió la carrera. */
  liberar(camaId: string, versionLeida: number): Promise<boolean>;
}

export const CAMA_REPOSITORY = Symbol('CAMA_REPOSITORY');
