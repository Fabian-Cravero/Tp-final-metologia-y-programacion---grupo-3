<script setup lang="ts">
// Nav placeholder para navegar entre módulos durante el desarrollo.
// TODO (Fase 1): ocultar/filtrar links según el rol autenticado (RBAC en UI).
</script>

<template>
  <nav class="app-nav">
    <RouterLink to="/login">Login</RouterLink>
    <RouterLink to="/admisiones">Admisión y Turnos</RouterLink>
    <RouterLink to="/historia-clinica">Historia Clínica</RouterLink>
    <RouterLink to="/atencion">Atención y Enfermería</RouterLink>
    <RouterLink to="/camas">Camas</RouterLink>
    <RouterLink to="/facturacion">Facturación</RouterLink>
  </nav>
  <RouterView />
</template>
