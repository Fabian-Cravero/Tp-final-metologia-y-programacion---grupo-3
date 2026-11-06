import { EventoDominio } from '../entities/evento-dominio.entity';

/** Outbox: cada evento se guarda antes de procesarlo, así se sabe cuál no llegó a facturarse. */
export interface IEventoDominioRepository {
  registrar(tipo: string, payload: Record<string, unknown>): Promise<EventoDominio>;
  marcarProcesado(id: string): Promise<void>;
  /** ¿Ya se procesó un evento de este tipo para esta indicación? Evita cobrar dos veces. */
  existeProcesado(tipo: string, indicacionId: string): Promise<boolean>;
  listarPendientes(): Promise<EventoDominio[]>;
}

export const EVENTO_DOMINIO_REPOSITORY = Symbol('EVENTO_DOMINIO_REPOSITORY');
