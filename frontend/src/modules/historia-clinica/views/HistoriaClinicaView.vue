<script setup lang="ts">
import { isAxiosError } from 'axios';
import { reactive, ref, watch } from 'vue';
import { useAuthStore } from '../../auth/stores/auth.store';
import type { Paciente } from '../../admisiones/api/admisiones.api';
import PacienteSelector from '../../../shared/components/PacienteSelector.vue';
import { fechaHora } from '../../../shared/formato';
import { mensajeDeError } from '../../../shared/http/errores';
import { ROLES } from '../../../shared/types/roles';
import { historiaApi, type HistoriaCompleta, type Severidad } from '../api/historia.api';

const auth = useAuthStore();
const puedeAbrir = auth.tieneRol(ROLES.ADMIN, ROLES.MEDICO);
const puedeCargarDatos = auth.tieneRol(ROLES.MEDICO, ROLES.ENFERMERO);
const esMedico = auth.tieneRol(ROLES.MEDICO);

const paciente = ref<Paciente | null>(null);
const historia = ref<HistoriaCompleta | null>(null);
const sinHistoria = ref(false);
const cargando = ref(false);
const error = ref('');

const grupoSanguineo = ref('');
const alergia = reactive({ sustancia: '', severidad: 'leve' as Severidad });
const antecedente = reactive({ parentesco: '', descripcion: '' });
const nota = ref('');

/** Color de la etiqueta: grave en rojo, moderada en ámbar, leve en verde. */
const COLOR_SEVERIDAD: Record<Severidad, string> = { grave: 'critico', moderada: 'alerta', leve: 'normal' };

async function cargar() {
  historia.value = null;
  sinHistoria.value = false;
  error.value = '';
  if (!paciente.value) return;
  cargando.value = true;
  try {
    historia.value = await historiaApi.ver(paciente.value.id);
  } catch (e) {
    // 404 = el paciente todavía no tiene historia abierta.
    if (isAxiosError(e) && e.response?.status === 404) sinHistoria.value = true;
    else error.value = mensajeDeError(e);
  } finally {
    cargando.value = false;
  }
}

/** Ejecuta una carga y vuelve a leer la historia. */
async function guardar(accion: () => Promise<unknown>, limpiar: () => void) {
  error.value = '';
  try {
    await accion();
    limpiar();
    await cargar();
  } catch (e) {
    error.value = mensajeDeError(e);
  }
}

const id = () => paciente.value!.id;
const abrir = () => guardar(() => historiaApi.abrir(id(), grupoSanguineo.value.trim() || undefined), () => (grupoSanguineo.value = ''));
const agregarAlergia = () =>
  guardar(() => historiaApi.agregarAlergia(id(), alergia.sustancia, alergia.severidad), () => Object.assign(alergia, { sustancia: '', severidad: 'leve' }));
const agregarAntecedente = () =>
  guardar(() => historiaApi.agregarAntecedente(id(), antecedente.parentesco, antecedente.descripcion), () => Object.assign(antecedente, { parentesco: '', descripcion: '' }));
const agregarEvolucion = () => guardar(() => historiaApi.agregarEvolucion(id(), nota.value), () => (nota.value = ''));

watch(paciente, () => void cargar());
</script>

<template>
  <section>
    <div class="encabezado"><h1>Historia clínica</h1></div>
    <PacienteSelector v-model="paciente" />
    <p v-if="error" class="alerta alerta--error">{{ error }}</p>
    <p v-if="cargando" class="tenue">Cargando…</p>

    <section v-if="sinHistoria" class="card">
      <h2>Este paciente no tiene historia clínica</h2>
      <form v-if="puedeAbrir" class="fila" @submit.prevent="abrir">
        <input v-model="grupoSanguineo" maxlength="5" placeholder="Grupo sanguíneo (opcional), ej. A+" />
        <button class="btn btn--primario">Abrir historia</button>
      </form>
      <p v-else class="tenue">La abre un médico o la administración.</p>
    </section>

    <template v-if="historia">
      <p class="tenue">
        Historia abierta el {{ fechaHora(historia.historia.creadaEn) }} · Grupo sanguíneo:
        <strong>{{ historia.historia.grupoSanguineo || 'sin dato' }}</strong>
      </p>

      <div class="columnas">
        <section class="card">
          <h2>Alergias</h2>
          <table v-if="historia.alergias.length">
            <tbody>
              <tr v-for="a in historia.alergias" :key="a.id">
                <td>{{ a.sustancia }}</td>
                <td><span :class="['chip', `chip--${COLOR_SEVERIDAD[a.severidad]}`]">{{ a.severidad }}</span></td>
              </tr>
            </tbody>
          </table>
          <p v-else class="vacio">Sin alergias registradas.</p>
          <form v-if="puedeCargarDatos" class="fila" @submit.prevent="agregarAlergia">
            <input v-model="alergia.sustancia" placeholder="Sustancia" required />
            <select v-model="alergia.severidad" aria-label="Severidad">
              <option value="leve">Leve</option>
              <option value="moderada">Moderada</option>
              <option value="grave">Grave</option>
            </select>
            <button class="btn">Agregar</button>
          </form>
        </section>

        <section class="card">
          <h2>Antecedentes familiares</h2>
          <table v-if="historia.antecedentes.length">
            <tbody>
              <tr v-for="a in historia.antecedentes" :key="a.id">
                <td><strong>{{ a.parentesco }}</strong></td>
                <td>{{ a.descripcion }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="vacio">Sin antecedentes registrados.</p>
          <form v-if="puedeCargarDatos" class="fila" @submit.prevent="agregarAntecedente">
            <input v-model="antecedente.parentesco" placeholder="Parentesco" required />
            <input v-model="antecedente.descripcion" placeholder="Descripción" required />
            <button class="btn">Agregar</button>
          </form>
        </section>
      </div>

      <section class="card">
        <h2>Evoluciones</h2>
        <form v-if="esMedico" @submit.prevent="agregarEvolucion">
          <label>Nueva evolución (se firma con tu usuario y no se puede editar)<textarea v-model="nota" required /></label>
          <p><button class="btn btn--primario">Guardar evolución</button></p>
        </form>
        <article v-for="e in historia.evoluciones" :key="e.id" class="card">
          <p class="tenue">
            {{ fechaHora(e.fecha) }} ·
            <strong v-if="e.medico">{{ e.medico.nombre }} {{ e.medico.apellido }}</strong>
            <span v-if="e.medico"> · {{ e.medico.matricula }} · {{ e.medico.especialidad }}</span>
            <span v-else>médico no encontrado</span>
          </p>
          <p>{{ e.nota }}</p>
        </article>
        <p v-if="!historia.evoluciones.length" class="vacio">Sin evoluciones todavía.</p>
      </section>
    </template>
  </section>
</template>
