import { Usuario } from '../entities/usuario.entity';

/**
 * Puerto (interfaz) del repositorio de usuarios. Los casos de uso dependen
 * de esta interfaz, nunca de TypeORM directamente (DIP) — ver sección 02/03
 * del informe. La implementación concreta vive en infrastructure/.
 */
export interface IUsuarioRepository {
  findByEmail(email: string): Promise<Usuario | null>;
  findById(id: string): Promise<Usuario | null>;
  save(usuario: Usuario): Promise<Usuario>;
}

export const USUARIO_REPOSITORY = Symbol('USUARIO_REPOSITORY');
