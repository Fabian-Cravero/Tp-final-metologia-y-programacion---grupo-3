<script setup lang="ts">
import { ref } from 'vue';
import InventarioPanel from '../components/InventarioPanel.vue';
import MapaCamasPanel from '../components/MapaCamasPanel.vue';

const pestana = ref<'mapa' | 'inventario'>('mapa');
</script>

<template>
  <section>
    <div class="encabezado"><h1>Camas e inventario</h1></div>
    <div class="tabs" role="tablist">
      <button :class="{ activa: pestana === 'mapa' }" @click="pestana = 'mapa'">Mapa de camas</button>
      <button :class="{ activa: pestana === 'inventario' }" @click="pestana = 'inventario'">Inventario</button>
    </div>
    <MapaCamasPanel v-if="pestana === 'mapa'" />
    <InventarioPanel v-else />
  </section>
</template>
