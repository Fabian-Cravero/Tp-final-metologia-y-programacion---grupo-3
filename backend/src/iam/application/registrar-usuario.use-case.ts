import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '../../shared/exceptions/domain.exception';
import { Usuario } from '../domain/entities/usuario.entity';
import { RolUsuario } from '../domain/enums/rol.enum';
import { USUARIO_REPOSITORY } from '../domain/repositories/usuario-repository.interface';
import type { IUsuarioRepository } from '../domain/repositories/usuario-repository.interface';
import { PASSWORD_HASHER } from '../domain/services/password-hasher.interface';
import type { IPasswordHasher } from '../domain/services/password-hasher.interface';

export interface RegistrarUsuarioCommand {
  email: string;
  password: string;
  nombre: string;
  rol: RolUsuario;
}

@Injectable()
export class RegistrarUsuarioUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY) private readonly usuarios: IUsuarioRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
  ) {}

  async ejecutar(cmd: RegistrarUsuarioCommand): Promise<Usuario> {
    const email = cmd.email.trim().toLowerCase();
    if (await this.usuarios.findByEmail(email)) {
      throw new DomainException('Ya existe un usuario con ese email');
    }

    const usuario = new Usuario();
    usuario.email = email;
    usuario.passwordHash = await this.hasher.hashear(cmd.password);
    usuario.nombre = cmd.nombre.trim();
    usuario.rol = cmd.rol;
    usuario.activo = true;

    return this.usuarios.save(usuario);
  }
}
