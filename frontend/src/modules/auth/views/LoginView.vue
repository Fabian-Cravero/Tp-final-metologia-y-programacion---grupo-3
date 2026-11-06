<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { mensajeDeError } from '../../../shared/http/errores';
import { useAuthStore } from '../stores/auth.store';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const email = ref('');
const password = ref('');
const enviando = ref(false);
const error = ref('');
const expirada = route.query.expirada === '1';

async function entrar() {
  error.value = '';
  enviando.value = true;
  try {
    await auth.iniciarSesion(email.value.trim(), password.value);
    const destino = typeof route.query.redirect === 'string' ? route.query.redirect : '/inicio';
    await router.replace(destino);
  } catch (e) {
    error.value = mensajeDeError(e);
  } finally {
    enviando.value = false;
  }
}
</script>

<template>
  <div class="login">
    <form class="card login__card" @submit.prevent="entrar">
      <h1>HIS</h1>
      <p class="tenue">Sistema de Información Hospitalario · Grupo 3</p>

      <p v-if="expirada" class="alerta">La sesión venció. Volvé a ingresar.</p>

      <label>
        Email
        <input v-model="email" type="email" autocomplete="username" required />
      </label>
      <label>
        Contraseña
        <input v-model="password" type="password" autocomplete="current-password" minlength="8" required />
      </label>

      <p v-if="error" class="alerta alerta--error">{{ error }}</p>
      <button class="btn btn--primario btn--ancho" :disabled="enviando">{{ enviando ? 'Ingresando…' : 'Ingresar' }}</button>
    </form>
  </div>
</template>
