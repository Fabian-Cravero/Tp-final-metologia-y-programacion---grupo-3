import { Paciente } from '../entities/paciente.entity';

export interface IPacienteRepository {
  findById(id: string): Promise<Paciente | null>;
  findByDni(dni: string): Promise<Paciente | null>;
  /** El paciente vinculado a un usuario de IAM (para que vea sus propios datos). */
  findByUsuarioId(usuarioId: string): Promise<Paciente | null>;
  buscar(texto: string): Promise<Paciente[]>;
  save(paciente: Paciente): Promise<Paciente>;
}

export const PACIENTE_REPOSITORY = Symbol('PACIENTE_REPOSITORY');
