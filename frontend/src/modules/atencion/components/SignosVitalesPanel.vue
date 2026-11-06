<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useAuthStore } from '../../auth/stores/auth.store';
import EstadoChip from '../../../shared/components/EstadoChip.vue';
import { fechaHora } from '../../../shared/formato';
import { mensajeDeError } from '../../../shared/http/errores';
import { ROLES } from '../../../shared/types/roles';
import { signosApi, TIPOS_SIGNO, type Severidad, type SignoVital, type TipoSigno } from '../api/atencion.api';

const props = defineProps<{ pacienteId: string }>();
const auth = useAuthStore();
const puedeRegistrar = auth.tieneRol(ROLES.MEDICO, ROLES.ENFERMERO);

const historial = ref<SignoVital[]>([]);
const nuevo = reactive({ tipo: 'frecuencia_cardiaca' as TipoSigno, valor: '' });
const resultado = ref<Severidad | null>(null);
const error = ref('');

const nombreTipo = (t: TipoSigno) => TIPOS_SIGNO.find((x) => x.valor === t)?.texto ?? t;
const unidadDe = (t: TipoSigno) => TIPOS_SIGNO.find((x) => x.valor === t)?.unidad ?? '';

async function cargar() {
  error.value = '';
  try {
    historial.value = await signosApi.historial(props.pacienteId);
  } catch (e) {
    error.value = mensajeDeError(e);
  }
}

async function registrar() {
  error.value = '';
  resultado.value = null;
  try {
    const r = await signosApi.registrar(props.pacienteId, nuevo.tipo, Number(nuevo.valor));
    resultado.value = r.severidad;
    nuevo.valor = '';
    await cargar();
  } catch (e) {
    error.value = mensajeDeError(e);
  }
}

watch(() => props.pacienteId, () => void cargar(), { immediate: true });
</script>

<template>
  <section v-if="puedeRegistrar" class="card">
    <h2>Registrar signo vital</h2>
    <form class="fila" @submit.prevent="registrar">
      <select v-model="nuevo.tipo" aria-label="Tipo">
        <option v-for="t in TIPOS_SIGNO" :key="t.valor" :value="t.valor">{{ t.texto }} ({{ t.unidad }})</option>
      </select>
      <input v-model="nuevo.valor" type="number" step="0.1" :placeholder="`Valor en ${unidadDe(nuevo.tipo)}`" required />
      <button class="btn btn--primario">Registrar</button>
    </form>
    <p v-if="resultado" :class="['alerta', resultado === 'normal' ? 'alerta--ok' : resultado === 'critico' ? 'alerta--error' : '']">
      Registrado. Resultado: <strong>{{ resultado }}</strong>
    </p>
  </section>
  <p v-if="error" class="alerta alerta--error">{{ error }}</p>

  <section class="card">
    <h2>Historial</h2>
    <div v-if="historial.length" class="tabla-scroll">
      <table>
        <thead><tr><th>Fecha</th><th>Signo</th><th class="numero">Valor</th><th>Severidad</th></tr></thead>
        <tbody>
          <tr v-for="s in historial" :key="s.id">
            <td>{{ fechaHora(s.registradoEn) }}</td>
            <td>{{ nombreTipo(s.tipo) }}</td>
            <td class="numero">{{ Number(s.valor) }} {{ s.unidad }}</td>
            <td><EstadoChip :valor="s.severidad" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="vacio">Sin registros todavía.</p>
  </section>
</template>
