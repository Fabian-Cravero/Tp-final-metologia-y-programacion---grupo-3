import { ProtocoloCuidado } from '../entities/protocolo-cuidado.entity';
import { TareaProtocolo } from '../entities/tarea-protocolo.entity';
import { type PlanProtocolo } from '../protocolos/protocolo.builder';

export interface IProtocoloRepository {
  /** Guarda el protocolo y todas sus tareas en una transacción. */
  crearConTareas(pacienteId: string, plan: PlanProtocolo): Promise<ProtocoloCuidado>;
  findById(id: string): Promise<ProtocoloCuidado | null>;
  listarDePaciente(pacienteId: string): Promise<ProtocoloCuidado[]>;
  tareasDe(protocoloId: string): Promise<TareaProtocolo[]>;
  /** UPDATE ... WHERE completada = false. false => ya estaba completada (o no existe). */
  completarTarea(tareaId: string): Promise<boolean>;
  protocoloDeTarea(tareaId: string): Promise<string | null>;
  contarPendientes(protocoloId: string): Promise<number>;
  finalizar(protocoloId: string): Promise<void>;
}

export const PROTOCOLO_REPOSITORY = Symbol('PROTOCOLO_REPOSITORY');
