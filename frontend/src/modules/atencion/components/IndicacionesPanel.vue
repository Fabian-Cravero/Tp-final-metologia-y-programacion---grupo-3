<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useAuthStore } from '../../auth/stores/auth.store';
import { inventarioApi, type InsumoConStock } from '../../camas/api/camas.api';
import EstadoChip from '../../../shared/components/EstadoChip.vue';
import { fechaHora } from '../../../shared/formato';
import { mensajeDeError } from '../../../shared/http/errores';
import { ROLES } from '../../../shared/types/roles';
import { indicacionesApi, type Indicacion, type TipoIndicacion } from '../api/atencion.api';

const props = defineProps<{ pacienteId: string }>();
const auth = useAuthStore();
const esMedico = auth.tieneRol(ROLES.MEDICO);
const esEnfermero = auth.tieneRol(ROLES.ENFERMERO);

const pendientes = ref<Indicacion[]>([]);
const insumos = ref<InsumoConStock[]>([]);
const error = ref('');
const ok = ref('');
const nueva = reactive({ tipo: 'medicacion' as TipoIndicacion, descripcion: '', insumoId: '', cantidad: 1 });
const esMedicacion = computed(() => nueva.tipo === 'medicacion');

const nombreInsumo = (id: string | null) => insumos.value.find((i) => i.id === id)?.nombre ?? '';

async function cargar() {
  error.value = '';
  try {
    [pendientes.value, insumos.value] = await Promise.all([indicacionesApi.pendientes(props.pacienteId), inventarioApi.listar()]);
  } catch (e) {
    error.value = mensajeDeError(e);
  }
}

async function ejecutar(accion: () => Promise<void>, mensaje: string) {
  error.value = '';
  ok.value = '';
  try {
    await accion();
    ok.value = mensaje;
    await cargar();
  } catch (e) {
    error.value = mensajeDeError(e); // 409 = otro enfermero ya la cumplió; 422 = stock insuficiente
  }
}

const crear = () =>
  ejecutar(async () => {
    await indicacionesApi.crear(props.pacienteId, {
      tipo: nueva.tipo,
      descripcion: nueva.descripcion,
      ...(esMedicacion.value ? { insumoId: nueva.insumoId, cantidad: Number(nueva.cantidad) } : {}),
    });
    Object.assign(nueva, { descripcion: '', insumoId: '', cantidad: 1 });
  }, 'Indicación creada.');

const cumplir = (i: Indicacion) =>
  ejecutar(() => indicacionesApi.cumplir(i.id), i.tipo === 'medicacion' ? 'Cumplida: se descontó el stock y se facturó.' : 'Indicación cumplida.');
const cancelar = (i: Indicacion) => ejecutar(() => indicacionesApi.cancelar(i.id), 'Indicación cancelada.');

watch(() => props.pacienteId, () => void cargar(), { immediate: true });
</script>

<template>
  <p v-if="error" class="alerta alerta--error">{{ error }}</p>
  <p v-if="ok" class="alerta alerta--ok">{{ ok }}</p>

  <div class="columnas">
    <section class="card">
      <h2>Indicaciones pendientes</h2>
      <table v-if="pendientes.length">
        <tbody>
          <tr v-for="i in pendientes" :key="i.id">
            <td>
              <EstadoChip :valor="i.tipo" />
              <div>{{ i.descripcion }}</div>
              <div v-if="i.tipo === 'medicacion'" class="tenue">{{ i.cantidad }} × {{ nombreInsumo(i.insumoId) }}</div>
              <div class="tenue">{{ fechaHora(i.creadaEn) }}</div>
            </td>
            <td>
              <div class="acciones">
                <button v-if="esEnfermero" class="btn btn--chico btn--primario" @click="cumplir(i)">Cumplir</button>
                <button v-if="esMedico" class="btn btn--chico btn--peligro" @click="cancelar(i)">Cancelar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="vacio">No hay indicaciones pendientes.</p>
    </section>

    <section v-if="esMedico" class="card">
      <h2>Nueva indicación</h2>
      <form class="formulario" @submit.prevent="crear">
        <label>
          Tipo
          <select v-model="nueva.tipo">
            <option value="medicacion">Medicación</option>
            <option value="estudio">Estudio</option>
            <option value="dieta">Dieta</option>
            <option value="otro">Otro</option>
          </select>
        </label>
        <label class="ancho-total">Descripción <input v-model="nueva.descripcion" required /></label>
        <template v-if="esMedicacion">
          <label>
            Insumo
            <select v-model="nueva.insumoId" required>
              <option disabled value="">Elegir…</option>
              <option v-for="i in insumos" :key="i.id" :value="i.id">{{ i.nombre }} (stock {{ i.stockTotal }})</option>
            </select>
          </label>
          <label>Cantidad <input v-model.number="nueva.cantidad" type="number" min="1" required /></label>
        </template>
        <div class="ancho-total"><button class="btn btn--primario">Indicar</button></div>
      </form>
    </section>
  </div>
</template>
