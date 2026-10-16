import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Exige un JWT válido. La estrategia 'jwt' la registra IamModule.
 *
 * El constructor vacío es a propósito: el AuthGuard base le pide a Nest un
 * AuthModuleOptions, que solo existe en los módulos que importan
 * PassportModule.register(). Con este constructor el guard se puede usar en
 * el controller de cualquier módulo sin tener que importar PassportModule.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }
}
