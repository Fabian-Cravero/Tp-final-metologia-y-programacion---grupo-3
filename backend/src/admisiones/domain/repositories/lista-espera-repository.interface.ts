import { ListaEspera } from '../entities/lista-espera.entity';

export interface IListaEsperaRepository {
  /** Lanza DomainException (422) si el paciente ya está esperando a ese médico ese día. */
  agregar(pacienteId: string, medicoId: string, dia: string): Promise<ListaEspera>;
  findById(id: string): Promise<ListaEspera | null>;
  /** Todos los de ese médico y día (esperando y asignados), en orden de llegada. */
  listarPorMedicoYDia(medicoId: string, dia: string): Promise<ListaEspera[]>;
  /** Solo los que siguen esperando, en orden de llegada (el primero es el que se promueve). */
  esperandoPorMedicoYDia(medicoId: string, dia: string): Promise<ListaEspera[]>;
  /**
   * UPDATE ... SET estado = 'asignado' WHERE id = :id AND estado = 'esperando'.
   * false => otra cancelación ya lo tomó (concurrencia).
   */
  tomar(id: string): Promise<boolean>;
  registrarAsignacion(id: string, turnoId: string, fechaHora: Date): Promise<void>;
  /** Deshace tomar() si no se pudo crear el turno (compensación). */
  devolverALaEspera(id: string): Promise<void>;
  /** false => ya estaba marcado como avisado. */
  marcarAvisado(id: string): Promise<boolean>;
}

export const LISTA_ESPERA_REPOSITORY = Symbol('LISTA_ESPERA_REPOSITORY');
