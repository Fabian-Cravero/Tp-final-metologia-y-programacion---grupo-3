import { Inject, Injectable } from '@nestjs/common';
import { CredencialesInvalidasException } from '../../shared/exceptions/domain.exception';
import { RolUsuario } from '../domain/enums/rol.enum';
import { USUARIO_REPOSITORY } from '../domain/repositories/usuario-repository.interface';
import type { IUsuarioRepository } from '../domain/repositories/usuario-repository.interface';
import { PASSWORD_HASHER } from '../domain/services/password-hasher.interface';
import type { IPasswordHasher } from '../domain/services/password-hasher.interface';
import { TOKEN_SERVICE } from '../domain/services/token-service.interface';
import type { ITokenService } from '../domain/services/token-service.interface';

export interface LoginCommand {
  email: string;
  password: string;
}

export interface LoginResultado {
  accessToken: string;
  usuario: { id: string; nombre: string; rol: RolUsuario };
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY) private readonly usuarios: IUsuarioRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokens: ITokenService,
  ) {}

  async ejecutar(cmd: LoginCommand): Promise<LoginResultado> {
    const usuario = await this.usuarios.findByEmail(cmd.email.trim().toLowerCase());

    // Mismo error para "no existe", "inactivo" y "clave mala": no revelar cuál fue.
    if (!usuario || !usuario.activo) throw new CredencialesInvalidasException();
    if (!(await this.hasher.comparar(cmd.password, usuario.passwordHash))) {
      throw new CredencialesInvalidasException();
    }

    const accessToken = await this.tokens.firmar({
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });

    return {
      accessToken,
      usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
    };
  }
}
