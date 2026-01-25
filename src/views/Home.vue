<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import AppLayout from "../components/AppLayout.vue";

const router = useRouter();
const isTauri = ref(false);

onMounted(async () => {
  try {
    if (
      // @ts-ignore
      window.__TAURI_INTERNALS__ ||
      // @ts-ignore
      window.__TAURI__ ||
      // @ts-ignore
      window.__TAURI_IPC__
    ) {
      isTauri.value = true;
      router.push("/login");
      return;
    }
  } catch {
    isTauri.value = false;
  }
});
</script>

<template>
  <AppLayout>
    <div class="relative overflow-hidden">
      <!-- Hero Section - Discord Style -->
      <section class="relative min-h-[600px] pb-32 pt-16">
        <!-- Background Pattern -->
        <div
          class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]"
        ></div>

        <div class="mx-auto max-w-6xl px-6">
          <div class="text-center">
            <!-- Badge -->
            <div class="mb-8 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-5 py-2 backdrop-blur-sm">
              <span class="relative flex h-2.5 w-2.5">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
              </span>
              <span class="text-sm font-semibold uppercase tracking-wide text-indigo-200">
                Messaggistica sicura e veloce
              </span>
            </div>

            <!-- Main Heading - Discord Style (Very Large) -->
            <h1 class="mx-auto max-w-4xl text-6xl font-black leading-tight tracking-tight sm:text-7xl lg:text-8xl">
              COMUNICA SENZA
              <span class="block bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                LIMITI
              </span>
            </h1>

            <!-- Subtitle -->
            <p class="mx-auto mt-10 max-w-2xl text-xl leading-relaxed text-slate-300 sm:text-2xl">
              Discord per la messaggistica. Velin per conversazioni fluide, sicure e private. Invia messaggi, condividi file e resta connesso ovunque tu sia.
            </p>

            <!-- CTA Buttons - Discord Style (Larger) -->
            <div class="mt-10 flex flex-wrap items-center justify-center gap-6">
              <button
                @click="router.push('/login')"
                class="group relative overflow-hidden rounded-full bg-white px-10 py-5 text-lg font-bold text-slate-900 shadow-2xl transition-all hover:scale-105 hover:shadow-indigo-500/50"
              >
                <span class="relative z-10">Inizia ora gratis</span>
              </button>
              <button
                class="rounded-full border-2 border-white/20 bg-slate-800/50 px-10 py-5 text-lg font-bold text-white backdrop-blur-sm transition-all hover:scale-105 hover:border-white/40 hover:bg-slate-700/50"
              >
                Apri Velin nel browser
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Wavy Divider -->
      <div class="relative h-24 bg-slate-900/50">
        <svg
          class="absolute top-0 h-24 w-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            class="text-slate-950"
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
          ></path>
        </svg>
      </div>

      <!-- Feature Section 1 - Image Right -->
      <section class="bg-slate-950 py-24">
        <div class="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div class="space-y-6">
            <h2 class="text-4xl font-black uppercase leading-tight sm:text-5xl">
              Crea uno spazio dove ti senti a casa
            </h2>
            <p class="text-lg leading-relaxed text-slate-300">
              Velin ti permette di personalizzare le tue chat con emoji, adesivi e suoni. Imposta il tuo avatar, lo stato personalizzato e mostra la tua personalità in ogni conversazione.
            </p>
          </div>
          <div class="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-12 backdrop-blur-sm">
            <div class="flex items-center justify-center">
              <svg class="h-48 w-48 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <!-- Wavy Divider -->
      <div class="relative h-24 bg-slate-900">
        <svg class="absolute top-0 h-24 w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path fill="currentColor" class="text-slate-950" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path>
        </svg>
      </div>

      <!-- Feature Section 2 - Image Left (Reversed) -->
      <section class="bg-slate-900 py-24">
        <div class="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div class="order-2 rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-12 backdrop-blur-sm lg:order-1">
            <div class="flex items-center justify-center">
              <svg class="h-48 w-48 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div class="order-1 space-y-6 lg:order-2">
            <h2 class="text-4xl font-black uppercase leading-tight sm:text-5xl">
              Velocità che sorprende
            </h2>
            <p class="text-lg leading-relaxed text-slate-300">
              Messaggi istantanei senza ritardi. Streaming ad alta qualità e bassa latenza. Condividi foto, video e documenti in un lampo come se fossi nella stessa stanza.
            </p>
          </div>
        </div>
      </section>

      <!-- Wavy Divider -->
      <div class="relative h-24 bg-slate-950">
        <svg class="absolute top-0 h-24 w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path fill="currentColor" class="text-slate-900" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path>
        </svg>
      </div>

      <!-- Feature Section 3 - Image Right -->
      <section class="bg-slate-950 py-24">
        <div class="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div class="space-y-6">
            <h2 class="text-4xl font-black uppercase leading-tight sm:text-5xl">
              La tua privacy è sacra
            </h2>
            <p class="text-lg leading-relaxed text-slate-300">
              Crittografia end-to-end avanzata. Nessuna raccolta dati. Le tue conversazioni restano private e al sicuro. Solo tu e il destinatario potete leggerle.
            </p>
          </div>
          <div class="rounded-3xl border border-white/10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-12 backdrop-blur-sm">
            <div class="flex items-center justify-center">
              <svg class="h-48 w-48 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <!-- Final CTA Section - Discord Style -->
      <section class="relative overflow-hidden bg-slate-900 py-32">
        <!-- Stars Background Effect -->
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]"></div>
        
        <div class="relative mx-auto max-w-4xl px-6 text-center">
          <h2 class="mb-6 text-5xl font-black uppercase leading-tight sm:text-6xl">
            Pronto per l'avventura?
          </h2>
          <p class="mb-12 text-xl text-slate-300 sm:text-2xl">
            Unisciti a milioni di persone che comunicano su Velin ogni giorno. È gratuito, veloce e sicuro.
          </p>
          <button
            @click="router.push('/login')"
            class="rounded-full bg-indigo-600 px-12 py-6 text-xl font-bold text-white shadow-2xl shadow-indigo-600/50 transition-all hover:scale-105 hover:bg-indigo-500"
          >
            Inizia ora gratis
          </button>
        </div>
      </section>
    </div>
  </AppLayout>
</template>
