import { Medico } from '../entities/medico.entity';

export interface IMedicoRepository {
  findById(id: string): Promise<Medico | null>;
  findByUsuarioId(usuarioId: string): Promise<Medico | null>;
  listarActivos(): Promise<Medico[]>;
  save(medico: Medico): Promise<Medico>;
}

export const MEDICO_REPOSITORY = Symbol('MEDICO_REPOSITORY');
