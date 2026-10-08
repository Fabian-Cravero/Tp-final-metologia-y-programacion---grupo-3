import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RolUsuario } from '../../iam/domain/enums/rol.enum';

export interface UsuarioAutenticado {
  id: string;
  email: string;
  rol: RolUsuario;
}

/** Uso: `@UsuarioActual() usuario: UsuarioAutenticado` en un handler protegido. */
export const UsuarioActual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UsuarioAutenticado =>
    ctx.switchToHttp().getRequest().user,
);
