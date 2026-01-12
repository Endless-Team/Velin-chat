<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMsg = ref("");

async function onSubmit() {
  errorMsg.value = "";
  loading.value = true;

  try {
    // TODO: qui poi colleghi Firebase Auth (signInWithEmailAndPassword, ecc.)
    await new Promise((r) => setTimeout(r, 400));

    await router.push("/");
  } catch (e) {
    errorMsg.value = "Login fallito. Controlla email e password.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="mx-auto grid w-full max-w-md gap-6">
    <div class="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20">
      <div class="space-y-2">
        <h1 class="text-2xl font-semibold tracking-tight">Accedi</h1>
        <p class="text-sm text-slate-300">
          Inserisci le credenziali per continuare.
        </p>
      </div>

      <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-1">
          <label class="text-sm text-slate-200">Email</label>
          <input
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="nome@dominio.it"
              class="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
          />
        </div>

        <div class="space-y-1">
          <label class="text-sm text-slate-200">Password</label>
          <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
          />
        </div>

        <p v-if="errorMsg" class="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {{ errorMsg }}
        </p>

        <button
            type="submit"
            :disabled="loading"
            class="w-full rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ loading ? "Accesso..." : "Login" }}
        </button>

        <button
            type="button"
            class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-slate-100 hover:bg-white/10"
            @click="router.push('/')"
        >
          Torna alla Home
        </button>
      </form>
    </div>
  </div>
</template>
