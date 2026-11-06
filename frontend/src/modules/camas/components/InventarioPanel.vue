<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useAuthStore } from '../../auth/stores/auth.store';
import { dinero } from '../../../shared/formato';
import { mensajeDeError } from '../../../shared/http/errores';
import { ROLES } from '../../../shared/types/roles';
import { inventarioApi, type InsumoConStock, type NuevoInsumo } from '../api/camas.api';

const auth = useAuthStore();
const esAdmin = auth.tieneRol(ROLES.ADMIN);
const puedeIngresar = auth.tieneRol(ROLES.ADMIN, ROLES.ENFERMERO);

const insumos = ref<InsumoConStock[]>([]);
const error = ref('');
const ok = ref('');

const vacio = (): NuevoInsumo => ({ nombre: '', unidad: 'unidad', umbralMinimo: 0, precioUnitario: '' });
const nuevo = reactive<NuevoInsumo>(vacio());
const ingreso = reactive({ insumoId: '', cantidad: 1, ubicacion: '' });

async function cargar() {
  try {
    insumos.value = await inventarioApi.listar();
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
    error.value = mensajeDeError(e);
  }
}

const crear = () =>
  ejecutar(async () => {
    await inventarioApi.crear({ ...nuevo, umbralMinimo: Number(nuevo.umbralMinimo) });
    Object.assign(nuevo, vacio());
  }, 'Insumo creado.');

const ingresar = () =>
  ejecutar(async () => {
    await inventarioApi.ingresarStock(ingreso.insumoId, Number(ingreso.cantidad), ingreso.ubicacion.trim() || undefined);
    Object.assign(ingreso, { cantidad: 1, ubicacion: '' });
  }, 'Stock ingresado.');

void cargar();
</script>

<template>
  <p v-if="error" class="alerta alerta--error">{{ error }}</p>
  <p v-if="ok" class="alerta alerta--ok">{{ ok }}</p>

  <section class="card">
    <h2>Inventario de insumos</h2>
    <div v-if="insumos.length" class="tabla-scroll">
      <table>
        <thead><tr><th>Insumo</th><th class="numero">Stock</th><th class="numero">Mínimo</th><th class="numero">Precio</th><th></th></tr></thead>
        <tbody>
          <tr v-for="i in insumos" :key="i.id">
            <td>{{ i.nombre }} <span class="tenue">({{ i.unidad }})</span></td>
            <td class="numero">{{ i.stockTotal }}</td>
            <td class="numero">{{ i.umbralMinimo }}</td>
            <td class="numero">{{ dinero(i.precioUnitario) }}</td>
            <td><span v-if="i.stockTotal < i.umbralMinimo" class="chip chip--critico">stock bajo</span></td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="vacio">Todavía no hay insumos.</p>
  </section>

  <div class="columnas">
    <section v-if="puedeIngresar" class="card">
      <h2>Ingresar stock</h2>
      <form class="formulario" @submit.prevent="ingresar">
        <label>
          Insumo
          <select v-model="ingreso.insumoId" required>
            <option disabled value="">Elegir…</option>
            <option v-for="i in insumos" :key="i.id" :value="i.id">{{ i.nombre }}</option>
          </select>
        </label>
        <label>Cantidad <input v-model.number="ingreso.cantidad" type="number" min="1" required /></label>
        <label>Ubicación <input v-model="ingreso.ubicacion" placeholder="Depósito" /></label>
        <div class="ancho-total"><button class="btn btn--primario">Ingresar</button></div>
      </form>
    </section>

    <section v-if="esAdmin" class="card">
      <h2>Nuevo insumo</h2>
      <form class="formulario" @submit.prevent="crear">
        <label>Nombre <input v-model="nuevo.nombre" required /></label>
        <label>Unidad <input v-model="nuevo.unidad" required /></label>
        <label>Stock mínimo <input v-model.number="nuevo.umbralMinimo" type="number" min="0" required /></label>
        <label>Precio unitario <input v-model="nuevo.precioUnitario" inputmode="decimal" pattern="\d+(\.\d{1,2})?" placeholder="120.50" required /></label>
        <div class="ancho-total"><button class="btn btn--primario">Crear</button></div>
      </form>
    </section>
  </div>
</template>
