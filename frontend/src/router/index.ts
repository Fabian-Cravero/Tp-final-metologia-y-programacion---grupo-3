import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: () => import('../modules/auth/views/LoginView.vue') },
  { path: '/admisiones', name: 'admisiones', component: () => import('../modules/admisiones/views/AdmisionesView.vue') },
  { path: '/historia-clinica', name: 'historia-clinica', component: () => import('../modules/historia-clinica/views/HistoriaClinicaView.vue') },
  { path: '/atencion', name: 'atencion', component: () => import('../modules/atencion/views/AtencionView.vue') },
  { path: '/camas', name: 'camas', component: () => import('../modules/camas/views/CamasView.vue') },
  { path: '/facturacion', name: 'facturacion', component: () => import('../modules/facturacion/views/FacturacionView.vue') },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// TODO (Fase 1): router.beforeEach validando auth.estaAutenticado y rol,
// una vez que el store de auth tenga datos reales del login.
