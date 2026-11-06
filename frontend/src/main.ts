import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import App from './App.vue';
import { router } from './router';
import { useAuthStore } from './modules/auth/stores/auth.store';
import { conectarSesion } from './shared/http/http-client';

const app = createApp(App);
app.use(createPinia());
app.use(router);

// El cliente HTTP lee el token del store, y ante un 401 se cierra la sesión y se vuelve al login.
const auth = useAuthStore();
conectarSesion({
  obtenerToken: () => auth.token,
  alExpirarSesion: () => {
    auth.cerrarSesion();
    // Recarga completa para no dejar en memoria datos del usuario cuya sesión venció.
    window.location.assign(router.resolve({ name: 'login', query: { expirada: '1' } }).href);
  },
});

app.mount('#app');
