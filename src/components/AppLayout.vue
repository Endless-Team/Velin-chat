<script setup lang="ts"></script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <header class="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
      <div class="text-lg font-semibold tracking-tight">Velin</div>

      <nav class="flex items-center gap-3">
        <RouterLink
            to="/"
            class="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
        >
          Home
        </RouterLink>

        <RouterLink
            to="/login"
            class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Login
        </RouterLink>
      </nav>
    </header>

    <main class="mx-auto w-full max-w-5xl px-6 py-8">
      <slot/>
    </main>
  </div>
</template>
