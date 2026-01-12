<script setup lang="ts">
import {useRouter} from "vue-router";
import AppLayout from "../components/AppLayout.vue";

const router = useRouter();
</script>

<template>
  <AppLayout>
    <section class="space-y-12">
      <!-- Hero Section -->
      <div class="mx-auto max-w-3xl space-y-6 text-center">
        <div
            class="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
          </span>
          <span class="text-sm font-medium text-indigo-200">Messaggistica sicura e veloce</span>
        </div>

        <h1 class="text-5xl font-bold tracking-tight">
          Comunica senza limiti con
          <span class="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Dove
          </span>
        </h1>

        <p class="mx-auto max-w-2xl text-lg leading-relaxed text-slate-300">
          La piattaforma di messaggistica istantanea progettata per conversazioni fluide, sicure e private.
          Invia messaggi, condividi file e resta connesso con chi ami, ovunque tu sia.
        </p>

        <div class="flex items-center justify-center gap-4">
          <button
              @click="router.push('/login')"
              class="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500"
          >
            Inizia ora
          </button>
          <button
              class="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-slate-100 hover:bg-white/10"
          >
            Scopri di più
          </button>
        </div>
      </div>

      <!-- Features Grid -->
      <div class="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Feature 1 -->
        <div class="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20">
            <svg class="h-6 w-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold">Crittografia end-to-end</h3>
          <p class="text-sm leading-relaxed text-slate-400">
            I tuoi messaggi sono protetti con crittografia avanzata. Solo tu e il destinatario potete leggerli.
          </p>
        </div>

        <!-- Feature 2 -->
        <div class="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20">
            <svg class="h-6 w-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold">Velocità fulminea</h3>
          <p class="text-sm leading-relaxed text-slate-400">
            Messaggi istantanei senza ritardi. Invia foto, video e documenti in un lampo.
          </p>
        </div>

        <!-- Feature 3 -->
        <div class="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
            <svg class="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold">Chat di gruppo</h3>
          <p class="text-sm leading-relaxed text-slate-400">
            Crea gruppi con amici, famiglia o colleghi. Condividi momenti e collabora in tempo reale.
          </p>
        </div>

        <!-- Feature 4 -->
        <div class="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
            <svg class="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold">Privacy garantita</h3>
          <p class="text-sm leading-relaxed text-slate-400">
            Nessuna raccolta dati. Le tue informazioni restano private e al sicuro sui tuoi dispositivi.
          </p>
        </div>

        <!-- Feature 5 -->
        <div class="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20">
            <svg class="h-6 w-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold">Messaggi multimediali</h3>
          <p class="text-sm leading-relaxed text-slate-400">
            Condividi foto ad alta risoluzione, video, note vocali e documenti senza limiti di dimensione.
          </p>
        </div>

        <!-- Feature 6 -->
        <div class="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/20">
            <svg class="h-6 w-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold">Multi-piattaforma</h3>
          <p class="text-sm leading-relaxed text-slate-400">
            Usa Dove su desktop, mobile e tablet. Sincronizzazione automatica tra tutti i tuoi dispositivi.
          </p>
        </div>
      </div>

      <!-- CTA Section -->
      <div
          class="mx-auto max-w-3xl rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 p-8 text-center">
        <h2 class="text-2xl font-semibold">Pronto a iniziare?</h2>
        <p class="mt-3 text-slate-300">
          Crea il tuo account gratuitamente e scopri un nuovo modo di comunicare.
        </p>
        <button
            @click="router.push('/login')"
            class="mt-6 rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500"
        >
          Accedi ora
        </button>
      </div>
    </section>
  </AppLayout>
</template>
