<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useAuthStore } from '../../auth/stores/auth.store';
import type { Paciente } from '../../admisiones/api/admisiones.api';
import EstadoChip from '../../../shared/components/EstadoChip.vue';
import PacienteSelector from '../../../shared/components/PacienteSelector.vue';
import { dinero, fechaHora } from '../../../shared/formato';
import { mensajeDeError } from '../../../shared/http/errores';
import { ROLES } from '../../../shared/types/roles';
import {
  facturacionApi,
  type AccionFactura,
  type Cobertura,
  type EstadoFactura,
  type Factura,
  type LineaFactura,
} from '../api/facturacion.api';

const props = defineProps<{ coberturas: Cobertura[] }>();
const auth = useAuthStore();
const esAdmin = auth.tieneRol(ROLES.ADMIN);

const paciente = ref<Paciente | null>(null);
const facturas = ref<Factura[]>([]);
const detalle = ref<{ factura: Factura; lineas: LineaFactura[] } | null>(null);
const error = ref('');
const ok = ref('');
const coberturaElegida = ref('');
const cargo = reactive({ concepto: '', cantidad: 1, precioUnitario: '' });

const coberturaActual = computed(() => props.coberturas.find((c) => c.id === paciente.value?.coberturaId) ?? null);
const base = computed(() => (detalle.value ? Number(detalle.value.factura.total) + Number(detalle.value.factura.montoCubierto) : 0));

function acciones(estado: EstadoFactura): { accion: AccionFactura; texto: string; peligro?: boolean }[] {
  const lista: { accion: AccionFactura; texto: string; peligro?: boolean }[] = [];
  if (estado === 'pendiente') lista.push({ accion: 'emitir', texto: 'Emitir' });
  if (estado === 'emitida') lista.push({ accion: 'pagar', texto: 'Registrar pago' });
  if (esAdmin && (estado === 'pendiente' || estado === 'emitida')) lista.push({ accion: 'anular', texto: 'Anular', peligro: true });
  return lista;
}

async function cargar() {
  facturas.value = [];
  detalle.value = null;
  error.value = '';
  if (!paciente.value) return;
  try {
    facturas.value = await facturacionApi.facturasDe(paciente.value.id);
    const abierta = facturas.value.find((f) => f.estado === 'pendiente') ?? facturas.value[0];
    if (abierta) await ver(abierta.id);
  } catch (e) {
    error.value = mensajeDeError(e);
  }
}

async function ver(id: string) {
  try {
    detalle.value = await facturacionApi.detalle(id);
  } catch (e) {
    error.value = mensajeDeError(e);
  }
}

async function ejecutar(accion: () => Promise<void>, mensaje: string, recargarTodo = true) {
  error.value = '';
  ok.value = '';
  try {
    await accion();
    ok.value = mensaje;
    if (recargarTodo) await cargar();
  } catch (e) {
    error.value = mensajeDeError(e);
  }
}

const cambiar = (f: Factura, accion: AccionFactura) =>
  ejecutar(async () => {
    await facturacionApi.cambiarEstado(f.id, accion);
    facturas.value = await facturacionApi.facturasDe(f.pacienteId);
    await ver(f.id);
  }, 'Factura actualizada.', false);

const asignar = () =>
  ejecutar(async () => {
    await facturacionApi.asignarCobertura(paciente.value!.id, coberturaElegida.value);
    paciente.value = { ...paciente.value!, coberturaId: coberturaElegida.value };
  }, 'Cobertura asignada. Vale para las facturas que se abran desde ahora.', false);

const cargarManual = () =>
  ejecutar(async () => {
    await facturacionApi.cargoManual(paciente.value!.id, cargo.concepto, Number(cargo.cantidad), cargo.precioUnitario);
    Object.assign(cargo, { concepto: '', cantidad: 1, precioUnitario: '' });
  }, 'Cargo agregado a la factura abierta.');

watch(() => paciente.value?.id, () => {
  coberturaElegida.value = paciente.value?.coberturaId ?? '';
  void cargar();
});
</script>

<template>
  <PacienteSelector v-model="paciente" />
  <p v-if="error" class="alerta alerta--error">{{ error }}</p>
  <p v-if="ok" class="alerta alerta--ok">{{ ok }}</p>

  <template v-if="paciente">
    <div class="columnas">
      <section class="card">
        <h2>Cobertura</h2>
        <p>Actual: <strong>{{ coberturaActual ? `${coberturaActual.nombre} (${Number(coberturaActual.porcentajeCobertura)}%)` : 'Particular (sin cobertura)' }}</strong></p>
        <form class="fila" @submit.prevent="asignar">
          <select v-model="coberturaElegida" required aria-label="Cobertura">
            <option disabled value="">Elegir cobertura…</option>
            <option v-for="c in coberturas" :key="c.id" :value="c.id">{{ c.nombre }} · {{ c.tipo }} {{ Number(c.porcentajeCobertura) }}%</option>
          </select>
          <button class="btn">Asignar</button>
        </form>
      </section>

      <section v-if="esAdmin" class="card">
        <h2>Cargo manual</h2>
        <p class="tenue">Las medicaciones se facturan solas cuando enfermería las cumple.</p>
        <form class="formulario" @submit.prevent="cargarManual">
          <label class="ancho-total">Concepto <input v-model="cargo.concepto" required placeholder="Consulta de guardia" /></label>
          <label>Cantidad <input v-model.number="cargo.cantidad" type="number" min="1" required /></label>
          <label>Precio unitario <input v-model="cargo.precioUnitario" inputmode="decimal" pattern="\d+(\.\d{1,2})?" placeholder="15000.00" required /></label>
          <div class="ancho-total"><button class="btn btn--primario">Agregar cargo</button></div>
        </form>
      </section>
    </div>

    <section class="card">
      <h2>Facturas</h2>
      <table v-if="facturas.length">
        <thead><tr><th>Fecha</th><th>Cobertura</th><th class="numero">Paga el paciente</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          <tr v-for="f in facturas" :key="f.id">
            <td>{{ fechaHora(f.emitidaEn) }}</td>
            <td>{{ f.cobertura?.nombre }}</td>
            <td class="numero">{{ dinero(f.total) }}</td>
            <td><EstadoChip :valor="f.estado" /></td>
            <td><button class="btn btn--chico" @click="ver(f.id)">Ver detalle</button></td>
          </tr>
        </tbody>
      </table>
      <p v-else class="vacio">El paciente no tiene facturas.</p>
    </section>

    <section v-if="detalle" class="card">
      <div class="encabezado">
        <h2>Detalle de factura</h2>
        <EstadoChip :valor="detalle.factura.estado" />
      </div>
      <div class="tabla-scroll">
        <table>
          <thead><tr><th>Concepto</th><th class="numero">Cantidad</th><th class="numero">Precio</th><th class="numero">Subtotal</th></tr></thead>
          <tbody>
            <tr v-for="l in detalle.lineas" :key="l.id">
              <td>{{ l.concepto }}</td>
              <td class="numero">{{ l.cantidad }}</td>
              <td class="numero">{{ dinero(l.precioUnitario) }}</td>
              <td class="numero">{{ dinero(l.cantidad * Number(l.precioUnitario)) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="totales">
        <div class="total"><span class="tenue">Total</span><strong>{{ dinero(base) }}</strong></div>
        <div class="total"><span class="tenue">Cubre {{ detalle.factura.cobertura?.nombre }}</span><strong>{{ dinero(detalle.factura.montoCubierto) }}</strong></div>
        <div class="total"><span class="tenue">Paga el paciente</span><strong>{{ dinero(detalle.factura.total) }}</strong></div>
      </div>
      <div class="acciones">
        <button
          v-for="a in acciones(detalle.factura.estado)"
          :key="a.accion"
          class="btn"
          :class="a.peligro ? 'btn--peligro' : 'btn--primario'"
          @click="cambiar(detalle.factura, a.accion)"
        >{{ a.texto }}</button>
      </div>
    </section>
  </template>
</template>
