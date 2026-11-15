<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useAuthStore } from '../../auth/stores/auth.store';
import EstadoChip from '../../../shared/components/EstadoChip.vue';
import PacienteSelector from '../../../shared/components/PacienteSelector.vue';
import { hora } from '../../../shared/formato';
import { mensajeDeError } from '../../../shared/http/errores';
import { ROLES } from '../../../shared/types/roles';
import { listaEsperaApi, type EnListaEspera, type Paciente } from '../api/admisiones.api';
import { useAgendaStore } from '../stores/agenda.store';

/**
 * HU 1.3: lista de espera (standby) del médico para el día elegido.
 * Cuando alguien cancela un turno de ese día, el backend se lo asigna solo al primero de la lista.
 * Acá la recepcionista ve a quién tiene que avisarle.
 */
const auth = useAuthStore();
const agenda = useAgendaStore();
const esRecepcion = auth.tieneRol(ROLES.ADMIN, ROLES.RECEPCIONISTA);

const registros = ref<EnListaEspera[]>([]);
const paciente = ref<Paciente | null>(null);
const error = ref('');

const esperando = computed(() => registros.value.filter((r) => r.estado === 'esperando'));
const porAvisar = computed(() => registros.value.filter((r) => r.estado === 'asignado' && !r.avisado));
const avisados = computed(() => registros.value.filter((r) => r.estado === 'asignado' && r.avisado));
const nombre = (r: EnListaEspera) => (r.paciente ? `${r.paciente.apellido}, ${r.paciente.nombre}` : '—');

async function cargar() {
  if (!agenda.medicoId) return;
  error.value = '';
  try {
    registros.value = await listaEsperaApi.listar(agenda.medicoId, agenda.dia);
  } catch (e) {
    error.value = mensajeDeError(e);
  }
}

async function agregar() {
  if (!paciente.value) return;
  error.value = '';
  try {
    await listaEsperaApi.agregar(paciente.value.id, agenda.medicoId, agenda.dia);
    paciente.value = null;
    await cargar();
  } catch (e) {
    error.value = mensajeDeError(e);
  }
}

async function marcarAvisado(id: string) {
  error.value = '';
  try {
    await listaEsperaApi.marcarAvisado(id);
    await cargar();
  } catch (e) {
    error.value = mensajeDeError(e);
  }
}

watch(() => [agenda.medicoId, agenda.dia], () => void cargar(), { immediate: true });
</script>

<template>
  <section class="card">
    <div class="formulario">
      <label>
        Médico
        <select v-model="agenda.medicoId">
          <option v-for="m in agenda.medicos" :key="m.id" :value="m.id">{{ m.apellido }}, {{ m.nombre }} · {{ m.especialidad }}</option>
        </select>
      </label>
      <label>Día <input v-model="agenda.dia" type="date" /></label>
    </div>
  </section>

  <p v-if="error" class="alerta alerta--error">{{ error }}</p>

  <!-- Alerta para recepción: pacientes a los que el sistema les asignó un turno y hay que avisarles -->
  <div v-for="r in porAvisar" :key="r.id" class="alerta alerta--aviso">
    <span>
      <strong>Avisarle a {{ nombre(r) }}:</strong>
      se liberó un turno y se le asignó a las <strong>{{ r.fechaHoraAsignada ? hora(r.fechaHoraAsignada) : '—' }}</strong>
    </span>
    <button v-if="esRecepcion" class="btn btn--chico" @click="marcarAvisado(r.id)">Ya le avisé</button>
  </div>

  <div class="columnas">
    <section class="card">
      <div class="encabezado">
        <h2>Lista de espera</h2>
        <button class="btn btn--chico" @click="cargar">Actualizar</button>
      </div>
      <p class="tenue">Si alguien cancela un turno de este día, el primero de la lista lo recibe automáticamente.</p>
      <table v-if="esperando.length">
        <thead><tr><th>#</th><th>Paciente</th><th>Anotado</th></tr></thead>
        <tbody>
          <tr v-for="(r, i) in esperando" :key="r.id">
            <td>{{ i + 1 }}</td>
            <td>{{ nombre(r) }}</td>
            <td>{{ hora(r.creadoEn) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="vacio">No hay pacientes esperando para este día.</p>

      <template v-if="avisados.length">
        <h3>Ya asignados y avisados</h3>
        <table>
          <thead><tr><th>Paciente</th><th>Turno</th><th>Estado</th></tr></thead>
          <tbody>
            <tr v-for="r in avisados" :key="r.id">
              <td>{{ nombre(r) }}</td>
              <td>{{ r.fechaHoraAsignada ? hora(r.fechaHoraAsignada) : '—' }}</td>
              <td><EstadoChip valor="asignado" /></td>
            </tr>
          </tbody>
        </table>
      </template>
    </section>

    <section v-if="esRecepcion" class="card">
      <h2>Anotar en la lista de espera</h2>
      <PacienteSelector v-model="paciente" />
      <div class="fila">
        <button class="btn btn--primario" :disabled="!paciente || !agenda.medicoId" @click="agregar">Anotar</button>
      </div>
    </section>
  </div>
</template>
