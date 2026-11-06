<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../../auth/stores/auth.store';
import { ROLES, type Rol } from '../../../shared/types/roles';
import AgendaPanel from '../components/AgendaPanel.vue';
import ColaPanel from '../components/ColaPanel.vue';
import MedicosPanel from '../components/MedicosPanel.vue';
import PacientesPanel from '../components/PacientesPanel.vue';
import { useAgendaStore } from '../stores/agenda.store';

type Pestana = 'agenda' | 'cola' | 'pacientes' | 'medicos';

const auth = useAuthStore();
const agenda = useAgendaStore();

// Cada pestaña con los roles que el backend deja usar (sin roles: todo el personal).
const todas: { id: Pestana; texto: string; roles?: Rol[] }[] = [
  { id: 'agenda', texto: 'Agenda', roles: [ROLES.ADMIN, ROLES.RECEPCIONISTA, ROLES.MEDICO] },
  { id: 'cola', texto: 'Sala de espera' },
  { id: 'pacientes', texto: 'Pacientes' },
  { id: 'medicos', texto: 'Médicos' },
];
const pestanas = todas.filter((p) => !p.roles || auth.tieneRol(...p.roles));
const pestana = ref<Pestana>(pestanas[0].id);

void agenda.cargarMedicos(auth.usuario?.id);
</script>

<template>
  <section>
    <div class="encabezado"><h1>Admisión y turnos</h1></div>
    <p v-if="agenda.error" class="alerta alerta--error">{{ agenda.error }}</p>
    <div class="tabs" role="tablist">
      <button v-for="p in pestanas" :key="p.id" :class="{ activa: pestana === p.id }" @click="pestana = p.id">{{ p.texto }}</button>
    </div>
    <AgendaPanel v-if="pestana === 'agenda'" />
    <ColaPanel v-else-if="pestana === 'cola'" />
    <PacientesPanel v-else-if="pestana === 'pacientes'" />
    <MedicosPanel v-else />
  </section>
</template>
