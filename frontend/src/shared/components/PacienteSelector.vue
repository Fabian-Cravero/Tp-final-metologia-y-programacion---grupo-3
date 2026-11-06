<script setup lang="ts">
import { ref } from 'vue';
import { pacientesApi, type Paciente } from '../../modules/admisiones/api/admisiones.api';
import { mensajeDeError } from '../http/errores';

/** Buscador de pacientes por apellido o DNI. Lo usan todos los módulos que trabajan sobre un paciente. */
const paciente = defineModel<Paciente | null>({ default: null });

const texto = ref('');
const resultados = ref<Paciente[]>([]);
const buscando = ref(false);
const buscado = ref(false);
const error = ref('');

async function buscar() {
  error.value = '';
  buscando.value = true;
  try {
    resultados.value = await pacientesApi.buscar(texto.value.trim());
    buscado.value = true;
  } catch (e) {
    error.value = mensajeDeError(e);
  } finally {
    buscando.value = false;
  }
}

function elegir(p: Paciente) {
  paciente.value = p;
  resultados.value = [];
  buscado.value = false;
}
</script>

<template>
  <div class="selector-paciente">
    <div v-if="paciente" class="paciente-elegido">
      <div>
        <strong>{{ paciente.apellido }}, {{ paciente.nombre }}</strong>
        <span class="tenue"> · DNI {{ paciente.dni }}</span>
      </div>
      <button type="button" class="btn btn--chico" @click="paciente = null">Cambiar paciente</button>
    </div>

    <template v-else>
      <form class="fila" @submit.prevent="buscar">
        <input v-model="texto" placeholder="Apellido o DNI (vacío lista los primeros)" aria-label="Buscar paciente" />
        <button class="btn btn--primario" :disabled="buscando">{{ buscando ? 'Buscando…' : 'Buscar' }}</button>
      </form>
      <p v-if="error" class="alerta alerta--error">{{ error }}</p>
      <ul v-if="resultados.length" class="lista-elegible">
        <li v-for="p in resultados" :key="p.id">
          <button type="button" @click="elegir(p)">
            <strong>{{ p.apellido }}, {{ p.nombre }}</strong>
            <span class="tenue">DNI {{ p.dni }}</span>
          </button>
        </li>
      </ul>
      <p v-else-if="buscado" class="tenue">No hay pacientes que coincidan.</p>
    </template>
  </div>
</template>
