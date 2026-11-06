<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useAuthStore } from '../../auth/stores/auth.store';
import { fecha } from '../../../shared/formato';
import { mensajeDeError } from '../../../shared/http/errores';
import { ROLES } from '../../../shared/types/roles';
import { pacientesApi, type NuevoPaciente, type Paciente } from '../api/admisiones.api';

const auth = useAuthStore();
const puedeRegistrar = auth.tieneRol(ROLES.ADMIN, ROLES.RECEPCIONISTA);

const q = ref('');
const pacientes = ref<Paciente[]>([]);
const error = ref('');
const ok = ref('');

const vacio = (): NuevoPaciente => ({ dni: '', nombre: '', apellido: '', fechaNacimiento: '', telefono: '', email: '' });
const nuevo = reactive<NuevoPaciente>(vacio());
const guardando = ref(false);

async function buscar() {
  error.value = '';
  try {
    pacientes.value = await pacientesApi.buscar(q.value.trim());
  } catch (e) {
    error.value = mensajeDeError(e);
  }
}

async function registrar() {
  error.value = '';
  ok.value = '';
  guardando.value = true;
  try {
    const p = await pacientesApi.registrar({ ...nuevo });
    ok.value = `Paciente ${p.apellido}, ${p.nombre} registrado.`;
    Object.assign(nuevo, vacio());
    q.value = p.dni;
    await buscar();
  } catch (e) {
    error.value = mensajeDeError(e);
  } finally {
    guardando.value = false;
  }
}

void buscar();
</script>

<template>
  <div class="columnas">
    <section class="card">
      <h2>Pacientes</h2>
      <form class="fila" @submit.prevent="buscar">
        <input v-model="q" placeholder="Apellido o DNI" aria-label="Buscar paciente" />
        <button class="btn btn--primario">Buscar</button>
      </form>
      <div class="tabla-scroll">
        <table v-if="pacientes.length">
          <thead><tr><th>Paciente</th><th>DNI</th><th>Nacimiento</th><th>Contacto</th></tr></thead>
          <tbody>
            <tr v-for="p in pacientes" :key="p.id">
              <td>{{ p.apellido }}, {{ p.nombre }}</td>
              <td>{{ p.dni }}</td>
              <td>{{ fecha(p.fechaNacimiento) }}</td>
              <td class="tenue">{{ p.telefono || p.email || '—' }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="vacio">Sin resultados.</p>
      </div>
    </section>

    <section v-if="puedeRegistrar" class="card">
      <h2>Registrar paciente</h2>
      <form class="formulario" @submit.prevent="registrar">
        <label>DNI <input v-model="nuevo.dni" required pattern="\d{7,8}" title="7 u 8 dígitos" /></label>
        <label>Nombre <input v-model="nuevo.nombre" required /></label>
        <label>Apellido <input v-model="nuevo.apellido" required /></label>
        <label>Fecha de nacimiento <input v-model="nuevo.fechaNacimiento" type="date" required /></label>
        <label>Teléfono <input v-model="nuevo.telefono" /></label>
        <label>Email <input v-model="nuevo.email" type="email" /></label>
        <div class="ancho-total">
          <button class="btn btn--primario" :disabled="guardando">Registrar</button>
        </div>
      </form>
    </section>
  </div>
  <p v-if="error" class="alerta alerta--error">{{ error }}</p>
  <p v-if="ok" class="alerta alerta--ok">{{ ok }}</p>
</template>
