<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useAuthStore } from '../../auth/stores/auth.store';
import type { Paciente } from '../../admisiones/api/admisiones.api';
import EstadoChip from '../../../shared/components/EstadoChip.vue';
import PacienteSelector from '../../../shared/components/PacienteSelector.vue';
import { mensajeDeError } from '../../../shared/http/errores';
import { ROLES } from '../../../shared/types/roles';
import { camasApi, type AccionCama, type CamaEnMapa, type SectorDeCamas } from '../api/camas.api';

const auth = useAuthStore();
const esAdmin = auth.tieneRol(ROLES.ADMIN);
const puedeAsignar = auth.tieneRol(ROLES.ADMIN, ROLES.RECEPCIONISTA);

const mapa = ref<SectorDeCamas[]>([]);
const error = ref('');
const ok = ref('');

const libres = computed(() => mapa.value.flatMap((s) => s.camas.filter((c) => c.estado === 'libre').map((c) => ({ ...c, sector: s.sector }))));
const totalLibres = computed(() => mapa.value.reduce((acc, s) => acc + s.libres, 0));

/** Botones según el estado de la cama y el rol (mismas reglas que el backend). */
function acciones(cama: CamaEnMapa): { accion: AccionCama; texto: string }[] {
  const lista: { accion: AccionCama; texto: string }[] = [];
  if (cama.estado === 'ocupada' && auth.tieneRol(ROLES.ADMIN, ROLES.MEDICO, ROLES.ENFERMERO)) lista.push({ accion: 'liberar', texto: 'Dar de alta' });
  if (cama.estado === 'en_limpieza' && auth.tieneRol(ROLES.ADMIN, ROLES.ENFERMERO)) lista.push({ accion: 'limpieza-confirmada', texto: 'Limpieza lista' });
  if ((cama.estado === 'libre' || cama.estado === 'en_limpieza') && esAdmin) lista.push({ accion: 'bloquear', texto: 'Bloquear' });
  if (cama.estado === 'bloqueada' && esAdmin) lista.push({ accion: 'habilitar', texto: 'Habilitar' });
  return lista;
}

async function cargar() {
  try {
    mapa.value = await camasApi.mapa();
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
    error.value = mensajeDeError(e); // 409 = otra persona cambió la cama al mismo tiempo
  }
}

const accionar = (cama: CamaEnMapa, accion: AccionCama) => ejecutar(() => camasApi.accion(cama.id, accion), `Cama ${cama.codigo} actualizada.`);

// Asignar
const paciente = ref<Paciente | null>(null);
const camaId = ref('');
const asignar = () =>
  ejecutar(async () => {
    await camasApi.asignar(camaId.value, paciente.value!.id);
    paciente.value = null;
    camaId.value = '';
  }, 'Cama asignada.');

// Alta de cama
const nueva = reactive({ codigo: '', sector: '' });
const crear = () =>
  ejecutar(async () => {
    await camasApi.crear(nueva.codigo, nueva.sector);
    nueva.codigo = '';
  }, 'Cama creada.');

void cargar();
</script>

<template>
  <p v-if="error" class="alerta alerta--error">{{ error }}</p>
  <p v-if="ok" class="alerta alerta--ok">{{ ok }}</p>

  <section class="card">
    <div class="encabezado">
      <h2>Mapa de camas</h2>
      <span class="tenue">{{ totalLibres }} libres</span>
    </div>
    <div v-for="s in mapa" :key="s.sector" class="sector">
      <h3>{{ s.sector }} <span class="tenue">· {{ s.libres }} libres de {{ s.camas.length }}</span></h3>
      <div class="camas">
        <div v-for="c in s.camas" :key="c.id" :class="['cama', `cama--${c.estado}`]">
          <div class="fila" style="justify-content: space-between">
            <span class="cama__codigo">{{ c.codigo }}</span>
            <EstadoChip :valor="c.estado" />
          </div>
          <div class="acciones">
            <button v-for="a in acciones(c)" :key="a.accion" class="btn btn--chico" @click="accionar(c, a.accion)">{{ a.texto }}</button>
          </div>
        </div>
      </div>
    </div>
    <p v-if="!mapa.length" class="vacio">Todavía no hay camas cargadas.</p>
  </section>

  <div class="columnas">
    <section v-if="puedeAsignar" class="card">
      <h2>Asignar cama</h2>
      <PacienteSelector v-model="paciente" />
      <form class="fila" @submit.prevent="asignar">
        <select v-model="camaId" required aria-label="Cama libre">
          <option disabled value="">Cama libre…</option>
          <option v-for="c in libres" :key="c.id" :value="c.id">{{ c.codigo }} · {{ c.sector }}</option>
        </select>
        <button class="btn btn--primario" :disabled="!paciente || !camaId">Asignar</button>
      </form>
    </section>

    <section v-if="esAdmin" class="card">
      <h2>Nueva cama</h2>
      <form class="fila" @submit.prevent="crear">
        <input v-model="nueva.codigo" placeholder="Código, ej. A-101" required />
        <input v-model="nueva.sector" placeholder="Sector" required />
        <button class="btn btn--primario">Crear</button>
      </form>
    </section>
  </div>
</template>
