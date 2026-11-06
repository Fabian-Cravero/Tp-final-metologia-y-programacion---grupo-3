<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './modules/auth/stores/auth.store';
import { rutasDelMenu } from './router';
import { NOMBRE_ROL } from './shared/types/roles';

const auth = useAuthStore();
const router = useRouter();

// El menú muestra solo los módulos que el rol puede usar.
const menu = computed(() => rutasDelMenu(auth.rol));

/** Recarga completa: borra todo el estado en memoria (agenda, listas) del usuario que sale. */
function salir() {
  auth.cerrarSesion();
  window.location.assign(router.resolve({ name: 'login' }).href);
}
</script>

<template>
  <header v-if="auth.estaAutenticado" class="barra">
    <RouterLink to="/inicio" class="marca">HIS</RouterLink>
    <nav class="menu" aria-label="Módulos">
      <RouterLink v-for="r in menu" :key="r.path" :to="r.path">{{ r.meta?.titulo }}</RouterLink>
    </nav>
    <div class="sesion">
      <span>{{ auth.usuario?.nombre }} <span class="tenue">· {{ auth.rol ? NOMBRE_ROL[auth.rol] : '' }}</span></span>
      <button type="button" class="btn btn--chico" @click="salir">Salir</button>
    </div>
  </header>
  <main class="contenido">
    <RouterView />
  </main>
</template>
