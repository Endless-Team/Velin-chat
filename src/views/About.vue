<script setup lang="ts">
import AppLayout from "../components/AppLayout.vue";

const values = [
  {
    icon: "🔒",
    title: "Privacy First",
    description:
      "La privacy non è un extra, è il fondamento di tutto ciò che facciamo.",
  },
  {
    icon: "⚡",
    title: "Velocità Estrema",
    description:
      "Crediamo che la comunicazione debba essere istantanea, sempre.",
  },
  {
    icon: "🌍",
    title: "Accessibilità Globale",
    description: "Velin è per tutti, ovunque, su qualsiasi dispositivo.",
  },
  {
    icon: "💚",
    title: "Open Source",
    description:
      "Trasparenza totale: il nostro codice è aperto e verificabile.",
  },
];

const timeline = [
  { year: "2024", event: "Fondazione di Velin e primo prototipo" },
  { year: "2025", event: "Lancio pubblico della versione 1.0" },
  { year: "2025", event: "1 milione di utenti attivi" },
  { year: "2026", event: "Velin 2.0 con chiamate vocali e video" },
];
</script>

<template>
  <AppLayout>
    <main class="w-full">
      <div class="mx-auto max-w-7xl px-6 py-12">
        <div class="space-y-16">
          <!-- Hero -->
          <section class="text-center">
            <h1
              class="mb-6 text-6xl font-black uppercase tracking-tight sm:text-7xl"
            >
              Chi
              <span
                class="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
              >
                Siamo
              </span>
            </h1>

            <p class="mx-auto max-w-3xl text-xl leading-relaxed text-slate-300">
              Velin è nato dalla semplice idea che la comunicazione digitale
              dovrebbe essere privata, veloce e accessibile a tutti. Siamo un
              team di sviluppatori, designer e attivisti della privacy uniti
              dalla missione di creare uno spazio di comunicazione veramente
              libero.
            </p>
          </section>

          <!-- Values -->
          <section>
            <h2 class="mb-12 text-center text-4xl font-black uppercase">
              I nostri valori
            </h2>
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div
                v-for="value in values"
                :key="value.title"
                class="rounded-3xl border border-white/10 bg-slate-900/50 p-8 text-center backdrop-blur-sm transition-all hover:border-white/20"
              >
                <div class="mb-4 text-5xl">{{ value.icon }}</div>
                <h3 class="mb-3 text-xl font-bold">{{ value.title }}</h3>
                <p class="text-sm leading-relaxed text-slate-400">
                  {{ value.description }}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Mission - Full Width Background -->
      <div class="w-full bg-slate-950 py-16">
        <div class="mx-auto max-w-7xl px-6">
          <section
            class="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-12 backdrop-blur-sm"
          >
            <div class="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 class="mb-6 text-4xl font-black uppercase">
                  La nostra missione
                </h2>
                <p class="mb-4 text-lg leading-relaxed text-slate-300">
                  In un'epoca in cui i giganti tech monetizzano i tuoi dati e
                  violano la tua privacy, Velin rappresenta un'alternativa. Non
                  leggiamo i tuoi messaggi, non vendiamo i tuoi dati, non
                  tracciamo le tue attività.
                </p>
                <p class="text-lg leading-relaxed text-slate-300">
                  Crediamo che la privacy sia un diritto fondamentale, non un
                  privilegio. Per questo Velin sarà sempre gratuito, open source
                  e rispettoso della tua privacy.
                </p>
              </div>
              <div
                class="flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-16"
              >
                <div class="text-9xl">🚀</div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Timeline -->
      <div class="mx-auto max-w-7xl px-6 py-16">
        <section>
          <h2 class="mb-12 text-center text-4xl font-black uppercase">
            La nostra storia
          </h2>
          <div class="relative mx-auto max-w-3xl">
            <!-- Vertical Line -->
            <div
              class="absolute left-8 top-0 h-full w-0.5 bg-gradient-to-b from-indigo-500 to-purple-500 lg:left-1/2"
            ></div>

            <div class="space-y-12">
              <div
                v-for="(item, index) in timeline"
                :key="index"
                :class="[
                  'relative flex items-center gap-8',
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse',
                ]"
              >
                <!-- Dot -->
                <div
                  class="absolute left-8 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 ring-4 ring-slate-950 lg:left-1/2 lg:-translate-x-1/2"
                ></div>

                <!-- Content -->
                <div
                  :class="[
                    'ml-20 flex-1 rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm lg:ml-0',
                    index % 2 === 0
                      ? 'lg:mr-auto lg:pr-12'
                      : 'lg:ml-auto lg:pl-12',
                  ]"
                >
                  <div class="mb-2 text-2xl font-black text-indigo-400">
                    {{ item.year }}
                  </div>
                  <p class="text-slate-300">{{ item.event }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- CTA - Full Width Background -->
      <div class="w-full bg-slate-950 py-16">
        <div class="mx-auto max-w-7xl px-6">
          <section class="text-center">
            <h2 class="mb-4 text-3xl font-black uppercase">
              Vuoi far parte del team?
            </h2>
            <p class="mb-8 text-slate-300">
              Stiamo sempre cercando talenti appassionati di privacy e
              tecnologia.
            </p>
            <button
              class="rounded-full bg-indigo-600 px-8 py-3 font-bold text-white transition-all hover:scale-105 hover:bg-indigo-500"
            >
              Vedi le posizioni aperte
            </button>
          </section>
        </div>
      </div>
    </main>
  </AppLayout>
</template>
