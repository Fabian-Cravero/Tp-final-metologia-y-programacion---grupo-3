<script setup lang="ts">
import { ref } from 'vue';
import type { Paciente } from '../../admisiones/api/admisiones.api';
import PacienteSelector from '../../../shared/components/PacienteSelector.vue';
import IndicacionesPanel from '../components/IndicacionesPanel.vue';
import ProtocolosPanel from '../components/ProtocolosPanel.vue';
import SignosVitalesPanel from '../components/SignosVitalesPanel.vue';

type Pestana = 'signos' | 'indicaciones' | 'protocolos';

const paciente = ref<Paciente | null>(null);
const pestana = ref<Pestana>('signos');
const pestanas: { id: Pestana; texto: string }[] = [
  { id: 'signos', texto: 'Signos vitales' },
  { id: 'indicaciones', texto: 'Indicaciones' },
  { id: 'protocolos', texto: 'Protocolos de cuidado' },
];
</script>

<template>
  <section>
    <div class="encabezado"><h1>Atención y enfermería</h1></div>
    <PacienteSelector v-model="paciente" />
    <template v-if="paciente">
      <div class="tabs" role="tablist">
        <button v-for="p in pestanas" :key="p.id" :class="{ activa: pestana === p.id }" @click="pestana = p.id">{{ p.texto }}</button>
      </div>
      <SignosVitalesPanel v-if="pestana === 'signos'" :paciente-id="paciente.id" />
      <IndicacionesPanel v-else-if="pestana === 'indicaciones'" :paciente-id="paciente.id" />
      <ProtocolosPanel v-else :paciente-id="paciente.id" />
    </template>
    <p v-else class="vacio">Elegí un paciente para ver sus signos vitales, indicaciones y protocolos.</p>
  </section>
</template>
