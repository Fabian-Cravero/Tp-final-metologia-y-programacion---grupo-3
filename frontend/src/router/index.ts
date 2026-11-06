import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../modules/auth/stores/auth.store';
import { PERSONAL, ROLES, type Rol } from '../shared/types/roles';

declare module 'vue-router' {
  interface RouteMeta {
    /** Sin sesión se puede entrar (solo el login). */
    publica?: boolean;
    /** Roles que pueden entrar. Sin roles: cualquiera con sesión. */
    roles?: Rol[];
    /** Texto del menú. Sin título: no aparece en el menú. */
    titulo?: string;
  }
}

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/inicio' },
  { path: '/login', name: 'login', component: () => import('../modules/auth/views/LoginView.vue'), meta: { publica: true } },
  { path: '/inicio', name: 'inicio', component: () => import('../modules/inicio/views/InicioView.vue'), meta: { titulo: 'Inicio' } },
  {
    path: '/admisiones',
    name: 'admisiones',
    component: () => import('../modules/admisiones/views/AdmisionesView.vue'),
    meta: { titulo: 'Admisión y turnos', roles: PERSONAL },
  },
  {
    path: '/historia-clinica',
    name: 'historia-clinica',
    component: () => import('../modules/historia-clinica/views/HistoriaClinicaView.vue'),
    meta: { titulo: 'Historia clínica', roles: [ROLES.ADMIN, ROLES.MEDICO, ROLES.ENFERMERO] },
  },
  {
    path: '/atencion',
    name: 'atencion',
    component: () => import('../modules/atencion/views/AtencionView.vue'),
    meta: { titulo: 'Atención y enfermería', roles: [ROLES.ADMIN, ROLES.MEDICO, ROLES.ENFERMERO] },
  },
  {
    path: '/camas',
    name: 'camas',
    component: () => import('../modules/camas/views/CamasView.vue'),
    meta: { titulo: 'Camas e inventario', roles: PERSONAL },
  },
  {
    path: '/facturacion',
    name: 'facturacion',
    component: () => import('../modules/facturacion/views/FacturacionView.vue'),
    meta: { titulo: 'Facturación', roles: [ROLES.ADMIN, ROLES.RECEPCIONISTA] },
  },
  { path: '/:pathMatch(.*)*', redirect: '/inicio' },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

/** Entradas del menú que el rol puede ver. */
export function rutasDelMenu(rol: Rol | null) {
  return routes.filter((r) => r.meta?.titulo && (!r.meta.roles || (rol && r.meta.roles.includes(rol))));
}

// Control de acceso: sin sesión -> login; sin el rol -> inicio. El backend igual valida cada pedido.
router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.publica) {
    return auth.estaAutenticado ? { name: 'inicio' } : true;
  }
  if (!auth.estaAutenticado) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.meta.roles && !auth.tieneRol(...to.meta.roles)) {
    return { name: 'inicio', query: { sinPermiso: String(to.name ?? '') } };
  }
  return true;
});
