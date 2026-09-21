import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolUsuario } from '../../iam/domain/enums/rol.enum';

/**
 * Guard de RBAC. Se apoya en @Roles(...) en el controller/handler y en
 * request.user (lo completa la estrategia JWT de IAM una vez implementada
 * en la Fase 1). No se registra todavía como guard global en app.module.ts
 * a propósito: activarlo antes de tener login funcionando dejaría todos
 * los endpoints inaccesibles.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<RolUsuario[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return !!user && rolesRequeridos.includes(user.rol);
  }
}
