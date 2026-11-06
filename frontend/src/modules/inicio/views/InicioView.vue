<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../../auth/stores/auth.store';
import { rutasDelMenu } from '../../../router';
import { NOMBRE_ROL } from '../../../shared/types/roles';

const auth = useAuthStore();
const route = useRoute();

const accesos = computed(() => rutasDelMenu(auth.rol).filter((r) => r.name !== 'inicio'));
const sinPermiso = computed(() => typeof route.query.sinPermiso === 'string' && route.query.sinPermiso !== '');
</script>

<template>
  <section>
    <h1>Hola, {{ auth.usuario?.nombre }}</h1>
    <p class="tenue">Ingresaste como {{ auth.rol ? NOMBRE_ROL[auth.rol] : '' }}.</p>

    <p v-if="sinPermiso" class="alerta alerta--error">Tu rol no tiene acceso a esa sección.</p>

    <div v-if="accesos.length" class="grilla-accesos">
      <RouterLink v-for="r in accesos" :key="r.path" :to="r.path" class="card acceso">
        {{ r.meta?.titulo }}
      </RouterLink>
    </div>
    <p v-else class="vacio">Tu rol todavía no tiene secciones disponibles en el sistema.</p>
  </section>
</template>
