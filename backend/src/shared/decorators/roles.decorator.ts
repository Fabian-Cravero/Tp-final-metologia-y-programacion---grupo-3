import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '../../iam/domain/enums/rol.enum';

export const ROLES_KEY = 'roles';

/**
 * Marca un endpoint con los roles autorizados a acceder.
 * Uso: @Roles(RolUsuario.RECEPCIONISTA, RolUsuario.ADMIN)
 */
export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);
