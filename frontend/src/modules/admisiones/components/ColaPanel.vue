<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAuthStore } from '../../auth/stores/auth.store';
import EstadoChip from '../../../shared/components/EstadoChip.vue';
import PacienteSelector from '../../../shared/components/PacienteSelector.vue';
import { hora } from '../../../shared/formato';
import { mensajeDeError } from '../../../shared/http/errores';
import { ROLES } from '../../../shared/types/roles';
import { colaApi, type EnCola, type Paciente, type Prioridad } from '../api/admisiones.api';
import { useAgendaStore } from '../stores/agenda.store';

const auth = useAuthStore();
const agenda = useAgendaStore();
const esMedico = auth.tieneRol(ROLES.MEDICO);

const cola = ref<EnCola[]>([]);
const error = ref('');
const llamado = ref<EnCola | null>(null);
const paciente = ref<Paciente | null>(null);
const prioridad = ref<Prioridad>('normal');

async function cargar() {
  if (!agenda.medicoId) return;
  error.value = '';
  try {
    cola.value = await colaApi.listar(agenda.medicoId); // ya viene ordenada por prioridad y llegada
  } catch (e) {
    error.value = mensajeDeError(e);
  }
}

async function agregar() {
  if (!paciente.value) return;
  error.value = '';
  try {
    await colaApi.agregar(paciente.value.id, agenda.medicoId, prioridad.value);
    paciente.value = null;
    prioridad.value = 'normal';
    await cargar();
  } catch (e) {
    error.value = mensajeDeError(e);
  }
}

async function llamarSiguiente() {
  error.value = '';
  try {
    llamado.value = await colaApi.llamarSiguiente(agenda.medicoId);
    await cargar();
  } catch (e) {
    error.value = mensajeDeError(e);
  }
}

watch(() => agenda.medicoId, () => void cargar(), { immediate: true });
</script>

<template>
  <section class="card">
    <label>
      Médico
      <select v-model="agenda.medicoId">
        <option v-for="m in agenda.medicos" :key="m.id" :value="m.id">{{ m.apellido }}, {{ m.nombre }}</option>
      </select>
    </label>
  </section>

  <p v-if="error" class="alerta alerta--error">{{ error }}</p>
  <p v-if="llamado?.paciente" class="alerta alerta--ok">
    Llamado: <strong>{{ llamado.paciente.apellido }}, {{ llamado.paciente.nombre }}</strong>
  </p>

  <div class="columnas">
    <section class="card">
      <div class="encabezado">
        <h2>Sala de espera</h2>
        <button v-if="esMedico" class="btn btn--primario" :disabled="!cola.length" @click="llamarSiguiente">Llamar siguiente</button>
      </div>
      <table v-if="cola.length">
        <thead><tr><th>#</th><th>Paciente</th><th>Prioridad</th><th>Llegó</th></tr></thead>
        <tbody>
          <tr v-for="(c, i) in cola" :key="c.id">
            <td>{{ i + 1 }}</td>
            <td>{{ c.paciente ? `${c.paciente.apellido}, ${c.paciente.nombre}` : '—' }}</td>
            <td><EstadoChip :valor="c.prioridad" /></td>
            <td>{{ hora(c.creadoEn) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="vacio">No hay pacientes esperando.</p>
    </section>

    <section class="card">
      <h2>Agregar a la cola</h2>
      <PacienteSelector v-model="paciente" />
      <form class="fila" @submit.prevent="agregar">
        <select v-model="prioridad" aria-label="Prioridad">
          <option value="normal">Normal</option>
          <option value="urgente">Urgente</option>
          <option value="codigo_rojo">Código rojo</option>
        </select>
        <button class="btn btn--primario" :disabled="!paciente || !agenda.medicoId">Agregar</button>
      </form>
    </section>
  </div>
</template>
