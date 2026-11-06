<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useAuthStore } from '../../auth/stores/auth.store';
import EstadoChip from '../../../shared/components/EstadoChip.vue';
import PacienteSelector from '../../../shared/components/PacienteSelector.vue';
import { hora } from '../../../shared/formato';
import { ROLES } from '../../../shared/types/roles';
import type { AccionTurno, EstadoTurno, Paciente } from '../api/admisiones.api';
import { useAgendaStore } from '../stores/agenda.store';

const auth = useAuthStore();
const agenda = useAgendaStore();
const esRecepcion = auth.tieneRol(ROLES.ADMIN, ROLES.RECEPCIONISTA);
const esMedico = auth.tieneRol(ROLES.MEDICO);

const error = ref('');
const ok = ref('');

/** Qué botones ofrecer según el estado del turno y el rol (el backend igual valida). */
function acciones(estado: EstadoTurno): { accion: AccionTurno; texto: string; peligro?: boolean }[] {
  const lista: { accion: AccionTurno; texto: string; peligro?: boolean }[] = [];
  if (esRecepcion && estado === 'programado') lista.push({ accion: 'confirmar', texto: 'Confirmar' });
  if (esRecepcion && estado === 'confirmado') lista.push({ accion: 'llegada', texto: 'Registrar llegada' });
  if (esMedico && estado === 'en_sala_espera') lista.push({ accion: 'atender', texto: 'Atender' });
  if (esRecepcion && ['programado', 'confirmado', 'en_sala_espera'].includes(estado)) {
    lista.push({ accion: 'cancelar', texto: 'Cancelar', peligro: true });
  }
  return lista;
}

async function cambiar(id: string, accion: AccionTurno) {
  error.value = (await agenda.cambiarEstado(id, accion)) ?? '';
}

// Reserva
const paciente = ref<Paciente | null>(null);
const reserva = reactive({ hora: '09:00', motivo: '' });
async function reservar() {
  ok.value = '';
  if (!paciente.value) {
    error.value = 'Elegí un paciente para reservar.';
    return;
  }
  // La hora se arma en hora local; el navegador la manda con su zona horaria.
  const fechaHora = new Date(`${agenda.dia}T${reserva.hora}:00`).toISOString();
  const falla = await agenda.reservar({ pacienteId: paciente.value.id, medicoId: agenda.medicoId, fechaHora, motivo: reserva.motivo });
  error.value = falla ?? '';
  if (!falla) {
    ok.value = 'Turno reservado.';
    reserva.motivo = '';
  }
}

watch(() => [agenda.medicoId, agenda.dia], () => void agenda.cargarAgenda(), { immediate: true });
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
  <p v-if="ok" class="alerta alerta--ok">{{ ok }}</p>

  <div class="columnas">
    <section class="card">
      <h2>Agenda del día</h2>
      <p v-if="agenda.cargando" class="tenue">Cargando…</p>
      <div v-else-if="agenda.turnos.length" class="tabla-scroll">
        <table>
          <thead><tr><th>Hora</th><th>Paciente</th><th>Motivo</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            <tr v-for="t in agenda.turnos" :key="t.id">
              <td>{{ hora(t.fechaHora) }}</td>
              <td>{{ t.paciente ? `${t.paciente.apellido}, ${t.paciente.nombre}` : '—' }}</td>
              <td class="tenue">{{ t.motivo || '—' }}</td>
              <td><EstadoChip :valor="t.estado" /></td>
              <td>
                <div class="acciones">
                  <button
                    v-for="a in acciones(t.estado)"
                    :key="a.accion"
                    class="btn btn--chico"
                    :class="{ 'btn--peligro': a.peligro }"
                    @click="cambiar(t.id, a.accion)"
                  >{{ a.texto }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="vacio">No hay turnos para este día.</p>
    </section>

    <section v-if="esRecepcion" class="card">
      <h2>Reservar turno</h2>
      <PacienteSelector v-model="paciente" />
      <form class="formulario" @submit.prevent="reservar">
        <label>Hora <input v-model="reserva.hora" type="time" required /></label>
        <label>Motivo <input v-model="reserva.motivo" maxlength="200" /></label>
        <div class="ancho-total"><button class="btn btn--primario" :disabled="!agenda.medicoId">Reservar</button></div>
      </form>
    </section>
  </div>
</template>
