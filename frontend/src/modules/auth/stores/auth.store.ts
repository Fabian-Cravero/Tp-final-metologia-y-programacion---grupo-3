import { defineStore } from 'pinia';

interface Usuario {
  id: string;
  nombre: string;
  rol: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    usuario: null as Usuario | null,
  }),
  getters: {
    estaAutenticado: (state) => !!state.token,
  },
  actions: {
    // TODO (Fase 1): llamar a POST /iam/login y guardar el token real.
    setSesion(token: string, usuario: Usuario) {
      this.token = token;
      this.usuario = usuario;
    },
    cerrarSesion() {
      this.token = null;
      this.usuario = null;
    },
  },
});
