<script setup lang="ts">
import { ref } from 'vue';
import { mensajeDeError } from '../../../shared/http/errores';
import { facturacionApi, type Cobertura } from '../api/facturacion.api';
import CoberturasPanel from '../components/CoberturasPanel.vue';
import FacturasPacientePanel from '../components/FacturasPacientePanel.vue';

const pestana = ref<'facturas' | 'coberturas'>('facturas');
const coberturas = ref<Cobertura[]>([]);
const error = ref('');

async function cargarCoberturas() {
  try {
    coberturas.value = await facturacionApi.coberturas();
  } catch (e) {
    error.value = mensajeDeError(e);
  }
}

void cargarCoberturas();
</script>

<template>
  <section>
    <div class="encabezado"><h1>Facturación</h1></div>
    <p v-if="error" class="alerta alerta--error">{{ error }}</p>
    <div class="tabs" role="tablist">
      <button :class="{ activa: pestana === 'facturas' }" @click="pestana = 'facturas'">Facturas por paciente</button>
      <button :class="{ activa: pestana === 'coberturas' }" @click="pestana = 'coberturas'">Coberturas</button>
    </div>
    <FacturasPacientePanel v-if="pestana === 'facturas'" :coberturas="coberturas" />
    <CoberturasPanel v-else :coberturas="coberturas" @cambio="cargarCoberturas" />
  </section>
</template>
