<script setup lang="ts">
import { computed } from 'vue';
import { legible } from '../formato';

/** Etiqueta de color para estados y severidades. El color sale del valor (ver .chip--* en style.css). */
const props = defineProps<{ valor: string }>();
const clase = computed(() => `chip chip--${props.valor}`);
</script>

<template>
  <span :class="clase">{{ legible(valor) }}</span>
</template>
