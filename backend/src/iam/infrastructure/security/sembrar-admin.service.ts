import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RegistrarUsuarioUseCase } from '../../application/registrar-usuario.use-case';
import { RolUsuario } from '../../domain/enums/rol.enum';
import { USUARIO_REPOSITORY } from '../../domain/repositories/usuario-repository.interface';
import type { IUsuarioRepository } from '../../domain/repositories/usuario-repository.interface';

/**
 * Crea el primer administrador al arrancar, si ADMIN_EMAIL y ADMIN_PASSWORD
 * están en el .env y ese usuario todavía no existe. Sin esto nadie puede dar
 * de alta personal con rol.
 */
@Injectable()
export class SembrarAdminService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SembrarAdminService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly registrar: RegistrarUsuarioUseCase,
    @Inject(USUARIO_REPOSITORY) private readonly usuarios: IUsuarioRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const email = this.config.get<string>('ADMIN_EMAIL');
    const password = this.config.get<string>('ADMIN_PASSWORD');
    if (!email || !password) return;
    if (await this.usuarios.findByEmail(email.trim().toLowerCase())) return;

    await this.registrar.ejecutar({
      email,
      password,
      nombre: 'Administrador',
      rol: RolUsuario.ADMIN,
    });
    this.logger.log(`Usuario administrador creado: ${email}`);
  }
}
