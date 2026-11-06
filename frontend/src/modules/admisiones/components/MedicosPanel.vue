<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useAuthStore } from '../../auth/stores/auth.store';
import { mensajeDeError } from '../../../shared/http/errores';
import { ROLES } from '../../../shared/types/roles';
import { medicosApi, type NuevoMedico } from '../api/admisiones.api';
import { useAgendaStore } from '../stores/agenda.store';

const auth = useAuthStore();
const agenda = useAgendaStore();
const esAdmin = auth.tieneRol(ROLES.ADMIN);

const vacio = (): NuevoMedico => ({ matricula: '', nombre: '', apellido: '', especialidad: '', usuarioId: '' });
const nuevo = reactive<NuevoMedico>(vacio());
const error = ref('');
const ok = ref('');

async function registrar() {
  error.value = '';
  ok.value = '';
  try {
    const m = await medicosApi.registrar({ ...nuevo });
    ok.value = `Médico ${m.apellido} registrado.`;
    Object.assign(nuevo, vacio());
    await agenda.cargarMedicos();
  } catch (e) {
    error.value = mensajeDeError(e);
  }
}
</script>

<template>
  <div class="columnas">
    <section class="card">
      <h2>Médicos activos</h2>
      <div class="tabla-scroll">
        <table v-if="agenda.medicos.length">
          <thead><tr><th>Médico</th><th>Matrícula</th><th>Especialidad</th><th>Usuario</th></tr></thead>
          <tbody>
            <tr v-for="m in agenda.medicos" :key="m.id">
              <td>{{ m.apellido }}, {{ m.nombre }}</td>
              <td>{{ m.matricula }}</td>
              <td>{{ m.especialidad }}</td>
              <td class="tenue">{{ m.usuarioId ? 'vinculado' : 'sin usuario' }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="vacio">Todavía no hay médicos.</p>
      </div>
    </section>

    <section v-if="esAdmin" class="card">
      <h2>Registrar médico</h2>
      <form class="formulario" @submit.prevent="registrar">
        <label>Matrícula <input v-model="nuevo.matricula" required /></label>
        <label>Especialidad <input v-model="nuevo.especialidad" required /></label>
        <label>Nombre <input v-model="nuevo.nombre" required /></label>
        <label>Apellido <input v-model="nuevo.apellido" required /></label>
        <label class="ancho-total">
          Id del usuario del médico (opcional, para que firme evoluciones e indicaciones)
          <input v-model="nuevo.usuarioId" placeholder="UUID de /iam/usuarios" />
        </label>
        <div class="ancho-total"><button class="btn btn--primario">Registrar</button></div>
      </form>
      <p v-if="error" class="alerta alerta--error">{{ error }}</p>
      <p v-if="ok" class="alerta alerta--ok">{{ ok }}</p>
    </section>
  </div>
</template>
