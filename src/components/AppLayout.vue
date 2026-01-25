<script setup lang="ts">
import AppNavbar from "./AppNavbar.vue";
import AppFooter from "./AppFooter.vue";
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
    <AppNavbar />
    <slot />
    <AppFooter />
  </div>
</template>
