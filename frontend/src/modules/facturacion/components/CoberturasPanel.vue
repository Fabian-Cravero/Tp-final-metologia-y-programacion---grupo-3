<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useAuthStore } from '../../auth/stores/auth.store';
import { fechaHora } from '../../../shared/formato';
import { mensajeDeError } from '../../../shared/http/errores';
import { ROLES } from '../../../shared/types/roles';
import { facturacionApi, type Cobertura, type EventoPendiente } from '../api/facturacion.api';

defineProps<{ coberturas: Cobertura[] }>();
const emit = defineEmits<{ cambio: [] }>();

const auth = useAuthStore();
const esAdmin = auth.tieneRol(ROLES.ADMIN);

const nueva = reactive({ nombre: '', tipo: 'prepaga', porcentaje: 70 });
const error = ref('');
const ok = ref('');
const pendientes = ref<EventoPendiente[] | null>(null);

async function crear() {
  error.value = '';
  ok.value = '';
  try {
    await facturacionApi.crearCobertura(nueva.nombre, nueva.tipo, Number(nueva.porcentaje));
    ok.value = 'Cobertura creada.';
    nueva.nombre = '';
    emit('cambio');
  } catch (e) {
    error.value = mensajeDeError(e);
  }
}

async function verPendientes() {
  error.value = '';
  try {
    pendientes.value = await facturacionApi.eventosPendientes();
  } catch (e) {
    error.value = mensajeDeError(e);
  }
}
</script>

<template>
  <p v-if="error" class="alerta alerta--error">{{ error }}</p>
  <p v-if="ok" class="alerta alerta--ok">{{ ok }}</p>
  <div class="columnas">
    <section class="card">
      <h2>Coberturas</h2>
      <table v-if="coberturas.length">
        <thead><tr><th>Nombre</th><th>Tipo</th><th class="numero">Cubre</th></tr></thead>
        <tbody>
          <tr v-for="c in coberturas" :key="c.id">
            <td>{{ c.nombre }}</td>
            <td>{{ c.tipo }}</td>
            <td class="numero">{{ Number(c.porcentajeCobertura) }}%</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="vacio">No hay coberturas. Se crean solas al arrancar el backend.</p>
    </section>

    <section v-if="esAdmin" class="card">
      <h2>Nueva cobertura</h2>
      <form class="formulario" @submit.prevent="crear">
        <label class="ancho-total">Nombre <input v-model="nueva.nombre" required /></label>
        <label>
          Tipo
          <select v-model="nueva.tipo">
            <option value="publica">Pública (cubre todo)</option>
            <option value="prepaga">Prepaga (porcentaje)</option>
            <option value="particular">Particular (no cubre)</option>
          </select>
        </label>
        <label>Porcentaje <input v-model.number="nueva.porcentaje" type="number" min="0" max="100" required /></label>
        <div class="ancho-total"><button class="btn btn--primario">Crear</button></div>
      </form>
    </section>

    <section v-if="esAdmin" class="card">
      <h2>Medicaciones sin facturar</h2>
      <p class="tenue">Eventos que llegaron de Enfermería y no se pudieron facturar.</p>
      <button class="btn" @click="verPendientes">Consultar</button>
      <template v-if="pendientes">
        <p v-if="!pendientes.length" class="alerta alerta--ok" style="margin-top: 8px">No hay pendientes: todo se facturó.</p>
        <ul v-else>
          <li v-for="e in pendientes" :key="e.id">{{ fechaHora(e.creadoEn) }} · {{ e.payload.concepto }}</li>
        </ul>
      </template>
    </section>
  </div>
</template>
