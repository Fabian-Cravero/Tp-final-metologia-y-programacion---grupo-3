<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAuthStore } from '../../auth/stores/auth.store';
import EstadoChip from '../../../shared/components/EstadoChip.vue';
import { fechaHora, legible } from '../../../shared/formato';
import { mensajeDeError } from '../../../shared/http/errores';
import { ROLES } from '../../../shared/types/roles';
import { protocolosApi, type MotivoIngreso, type Protocolo, type ProtocoloConTareas } from '../api/atencion.api';

const props = defineProps<{ pacienteId: string }>();
const auth = useAuthStore();
const esEnfermero = auth.tieneRol(ROLES.ENFERMERO);
const puedeIniciar = auth.tieneRol(ROLES.MEDICO, ROLES.ENFERMERO);

const protocolos = ref<Protocolo[]>([]);
const abierto = ref<ProtocoloConTareas | null>(null);
const motivo = ref<MotivoIngreso>('pre_operatorio');
const error = ref('');

async function cargar() {
  error.value = '';
  try {
    protocolos.value = await protocolosApi.delPaciente(props.pacienteId);
  } catch (e) {
    error.value = mensajeDeError(e);
  }
}

async function iniciar() {
  error.value = '';
  try {
    abierto.value = await protocolosApi.iniciar(props.pacienteId, motivo.value);
    await cargar();
  } catch (e) {
    error.value = mensajeDeError(e);
  }
}

async function ver(id: string) {
  error.value = '';
  try {
    abierto.value = await protocolosApi.conTareas(id);
  } catch (e) {
    error.value = mensajeDeError(e);
  }
}

async function completar(tareaId: string) {
  if (!abierto.value) return;
  error.value = '';
  try {
    await protocolosApi.completarTarea(tareaId);
    await ver(abierto.value.protocolo.id);
    await cargar();
  } catch (e) {
    error.value = mensajeDeError(e); // 409 = otro enfermero la completó antes
  }
}

watch(() => props.pacienteId, () => {
  abierto.value = null;
  void cargar();
}, { immediate: true });
</script>

<template>
  <p v-if="error" class="alerta alerta--error">{{ error }}</p>
  <div class="columnas">
    <section class="card">
      <h2>Protocolos del paciente</h2>
      <form v-if="puedeIniciar" class="fila" @submit.prevent="iniciar">
        <select v-model="motivo" aria-label="Motivo de ingreso">
          <option value="pre_operatorio">Pre-operatorio</option>
          <option value="respiratorio">Respiratorio</option>
        </select>
        <button class="btn btn--primario">Iniciar protocolo</button>
      </form>
      <table v-if="protocolos.length">
        <tbody>
          <tr v-for="p in protocolos" :key="p.id">
            <td>{{ legible(p.motivoIngreso) }}</td>
            <td class="tenue">{{ fechaHora(p.creadoEn) }}</td>
            <td><EstadoChip :valor="p.estado" /></td>
            <td><button class="btn btn--chico" @click="ver(p.id)">Ver tareas</button></td>
          </tr>
        </tbody>
      </table>
      <p v-else class="vacio">Sin protocolos.</p>
    </section>

    <section v-if="abierto" class="card">
      <div class="encabezado">
        <h2>{{ legible(abierto.protocolo.motivoIngreso) }}</h2>
        <EstadoChip :valor="abierto.protocolo.estado" />
      </div>
      <ol>
        <li v-for="t in abierto.tareas" :key="t.id" class="fila" style="justify-content: space-between; margin-bottom: 6px">
          <span :class="{ tenue: t.completada }">{{ t.descripcion }}</span>
          <span v-if="t.completada" class="chip chip--cumplida">hecha</span>
          <button v-else-if="esEnfermero" class="btn btn--chico" @click="completar(t.id)">Completar</button>
        </li>
      </ol>
    </section>
  </div>
</template>
