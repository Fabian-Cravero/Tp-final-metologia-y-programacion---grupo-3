import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolUsuario } from '../../iam/domain/enums/rol.enum';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from './roles.guard';

// Controllers de prueba: cada uno representa un escenario de @Roles(...).
class SinRestriccion {
  handler() {}
}

class SoloAdmin {
  @Roles(RolUsuario.ADMIN)
  handler() {}
}

@Roles(RolUsuario.MEDICO)
class RestringidaAMedicos {
  handler() {}

  @Roles(RolUsuario.ADMIN, RolUsuario.ENFERMERO)
  handlerConOverride() {}
}

type ClaseConHandlers = { prototype: object };

function contextoPara(
  clase: ClaseConHandlers,
  metodo: string,
  user?: { rol: RolUsuario },
): ExecutionContext {
  return {
    getHandler: () => (clase.prototype as Record<string, () => void>)[metodo],
    getClass: () => clase,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());

  it('deja pasar a cualquiera si el endpoint no declara @Roles', () => {
    expect(guard.canActivate(contextoPara(SinRestriccion, 'handler'))).toBe(true);
  });

  it('permite el acceso si el rol del usuario está entre los requeridos', () => {
    const contexto = contextoPara(SoloAdmin, 'handler', { rol: RolUsuario.ADMIN });

    expect(guard.canActivate(contexto)).toBe(true);
  });

  it('bloquea al usuario cuyo rol no está autorizado', () => {
    const contexto = contextoPara(SoloAdmin, 'handler', { rol: RolUsuario.PACIENTE });

    expect(guard.canActivate(contexto)).toBe(false);
  });

  it('bloquea si el endpoint requiere roles y no hay usuario autenticado', () => {
    expect(guard.canActivate(contextoPara(SoloAdmin, 'handler'))).toBe(false);
  });

  it('aplica los roles declarados a nivel de clase cuando el handler no define los suyos', () => {
    const medico = contextoPara(RestringidaAMedicos, 'handler', { rol: RolUsuario.MEDICO });
    const admin = contextoPara(RestringidaAMedicos, 'handler', { rol: RolUsuario.ADMIN });

    expect(guard.canActivate(medico)).toBe(true);
    expect(guard.canActivate(admin)).toBe(false);
  });

  it('los roles del handler tienen prioridad sobre los de la clase', () => {
    const medico = contextoPara(RestringidaAMedicos, 'handlerConOverride', {
      rol: RolUsuario.MEDICO,
    });
    const enfermero = contextoPara(RestringidaAMedicos, 'handlerConOverride', {
      rol: RolUsuario.ENFERMERO,
    });

    expect(guard.canActivate(medico)).toBe(false);
    expect(guard.canActivate(enfermero)).toBe(true);
  });
});
