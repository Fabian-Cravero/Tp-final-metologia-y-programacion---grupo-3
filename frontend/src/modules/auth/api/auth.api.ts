import { httpClient } from '../../../shared/http/http-client';
import type { Rol } from '../../../shared/types/roles';

export interface UsuarioSesion {
  id: string;
  nombre: string;
  rol: Rol;
}

export interface RespuestaLogin {
  accessToken: string;
  usuario: UsuarioSesion;
}

export const authApi = {
  async login(email: string, password: string): Promise<RespuestaLogin> {
    const { data } = await httpClient.post<RespuestaLogin>('/iam/login', { email, password });
    return data;
  },
};
