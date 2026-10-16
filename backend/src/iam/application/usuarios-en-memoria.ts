import { Usuario } from '../domain/entities/usuario.entity';
import { RolUsuario } from '../domain/enums/rol.enum';
import { IUsuarioRepository } from '../domain/repositories/usuario-repository.interface';
import { IPasswordHasher } from '../domain/services/password-hasher.interface';
import { ITokenService } from '../domain/services/token-service.interface';

/** Dobles de prueba compartidos por los tests de IAM: sin Nest ni PostgreSQL. */
export class UsuariosEnMemoria implements IUsuarioRepository {
  readonly guardados: Usuario[] = [];

  constructor(private readonly lista: Usuario[] = []) {}

  async findByEmail(email: string) {
    return this.lista.find((u) => u.email === email) ?? null;
  }

  async findById(id: string) {
    return this.lista.find((u) => u.id === id) ?? null;
  }

  async save(u: Usuario) {
    this.guardados.push(u);
    this.lista.push(u);
    return u;
  }
}

export const hasherFalso: IPasswordHasher = {
  hashear: async (p) => `hash:${p}`,
  comparar: async (p, h) => h === `hash:${p}`,
};

export const tokensFalsos: ITokenService = {
  firmar: async (p) => `token-de-${p.email}`,
};

export function crearUsuario(overrides: Partial<Usuario> = {}): Usuario {
  return Object.assign(new Usuario(), {
    id: 'u1',
    email: 'dra@hospital.test',
    passwordHash: 'hash:clave-segura',
    nombre: 'Dra. López',
    rol: RolUsuario.MEDICO,
    activo: true,
    version: 1,
    ...overrides,
  });
}
