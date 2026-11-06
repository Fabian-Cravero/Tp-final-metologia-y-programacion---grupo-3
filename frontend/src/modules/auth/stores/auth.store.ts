import { defineStore } from 'pinia';
import type { Rol } from '../../../shared/types/roles';
import { authApi, type UsuarioSesion } from '../api/auth.api';

const CLAVE = 'his.sesion';

interface SesionGuardada {
  token: string;
  usuario: UsuarioSesion;
}

/** La sesión sobrevive a recargar la página. Si el navegador no deja guardar, queda solo en memoria. */
function leerSesion(): SesionGuardada | null {
  try {
    const crudo = localStorage.getItem(CLAVE);
    return crudo ? (JSON.parse(crudo) as SesionGuardada) : null;
  } catch {
    return null;
  }
}

function guardarSesion(sesion: SesionGuardada | null) {
  try {
    if (sesion) localStorage.setItem(CLAVE, JSON.stringify(sesion));
    else localStorage.removeItem(CLAVE);
  } catch {
    /* sin almacenamiento: la sesión dura hasta recargar */
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    const guardada = leerSesion();
    return {
      token: guardada?.token ?? (null as string | null),
      usuario: guardada?.usuario ?? (null as UsuarioSesion | null),
    };
  },
  getters: {
    estaAutenticado: (state) => !!state.token,
    rol: (state): Rol | null => state.usuario?.rol ?? null,
  },
  actions: {
    async iniciarSesion(email: string, password: string) {
      const { accessToken, usuario } = await authApi.login(email, password);
      this.token = accessToken;
      this.usuario = usuario;
      guardarSesion({ token: accessToken, usuario });
    },
    cerrarSesion() {
      this.token = null;
      this.usuario = null;
      guardarSesion(null);
    },
    tieneRol(...roles: Rol[]): boolean {
      return !!this.usuario && roles.includes(this.usuario.rol);
    },
  },
});
