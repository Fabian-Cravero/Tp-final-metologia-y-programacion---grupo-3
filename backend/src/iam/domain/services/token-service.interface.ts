import { RolUsuario } from '../enums/rol.enum';

export interface PayloadToken {
  sub: string; // id del usuario
  email: string;
  rol: RolUsuario;
}

export interface ITokenService {
  firmar(payload: PayloadToken): Promise<string>;
}

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');
