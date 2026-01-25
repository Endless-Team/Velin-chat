<script setup lang="ts">
import AppLayout from "../components/AppLayout.vue";

const safetyFeatures = [
  {
    title: "Crittografia End-to-End",
    description:
      "Tutti i tuoi messaggi sono protetti con crittografia end-to-end. Solo tu e il destinatario potete leggerli.",
    icon: "🔒",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Controllo Privacy",
    description:
      "Decidi chi può contattarti, vedere il tuo stato online e accedere alle tue informazioni personali.",
    icon: "🛡️",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Blocco e Segnalazione",
    description:
      "Blocca utenti indesiderati e segnala contenuti inappropriati con un semplice click.",
    icon: "⚠️",
    gradient: "from-red-500 to-orange-500",
  },
  {
    title: "Autenticazione a Due Fattori",
    description:
      "Proteggi il tuo account con l'autenticazione a due fattori (2FA) per una sicurezza extra.",
    icon: "🔐",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Messaggi Effimeri",
    description:
      "Imposta messaggi che si autodistruggono dopo essere stati letti per conversazioni ultra-private.",
    icon: "⏱️",
    gradient: "from-yellow-500 to-amber-500",
  },
  {
    title: "Nessuna Raccolta Dati",
    description:
      "Non vendiamo i tuoi dati. Non tracciamo le tue conversazioni. La tua privacy è garantita.",
    icon: "🚫",
    gradient: "from-indigo-500 to-purple-500",
  },
];
</script>

<template>
  <AppLayout>
    <main class="w-full">
      <div class="mx-auto max-w-7xl px-6 py-12">
        <div class="space-y-16">
          <!-- Hero -->
          <section class="text-center">
            <div
              class="mb-6 inline-flex items-center gap-2 rounded-full bg-green-500/10 px-5 py-2"
            >
              <svg
                class="h-5 w-5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span class="font-semibold text-green-200"
                >La tua sicurezza è la nostra priorità</span
              >
            </div>

            <h1
              class="mb-6 text-6xl font-black uppercase tracking-tight sm:text-7xl"
            >
              Centro
              <span
                class="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
              >
                Sicurezza
              </span>
            </h1>

            <p class="mx-auto max-w-2xl text-xl leading-relaxed text-slate-300">
              Scopri come Velin protegge le tue conversazioni e i tuoi dati
              personali con tecnologie di sicurezza all'avanguardia.
            </p>
          </section>

          <!-- Features Grid -->
          <section class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="feature in safetyFeatures"
              :key="feature.title"
              class="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-sm transition-all hover:border-white/20"
            >
              <div
                :class="`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity group-hover:opacity-10`"
              ></div>

              <div class="relative space-y-4">
                <div class="text-5xl">{{ feature.icon }}</div>
                <h3 class="text-xl font-bold">{{ feature.title }}</h3>
                <p class="text-sm leading-relaxed text-slate-400">
                  {{ feature.description }}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Privacy Statement - Full Width Background -->
      <div class="w-full bg-slate-950 py-16">
        <div class="mx-auto max-w-7xl px-6">
          <section
            class="rounded-3xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-12 backdrop-blur-sm"
          >
            <div class="mx-auto max-w-3xl text-center">
              <h2 class="mb-6 text-3xl font-black uppercase">
                Il nostro impegno per la privacy
              </h2>
              <p class="mb-8 text-lg leading-relaxed text-slate-300">
                Velin è costruito con la privacy come principio fondamentale. Non
                leggiamo i tuoi messaggi, non vendiamo i tuoi dati e non
                tracciamo le tue attività. La tua comunicazione è veramente
                privata e appartiene solo a te.
              </p>
              <div class="grid gap-6 md:grid-cols-2">
                <div
                  class="rounded-2xl border border-white/10 bg-slate-900/50 p-6"
                >
                  <h3 class="mb-2 font-bold text-green-400">Zero Accesso</h3>
                  <p class="text-sm text-slate-400">
                    Nemmeno noi possiamo leggere i tuoi messaggi grazie alla
                    crittografia end-to-end
                  </p>
                </div>
                <div
                  class="rounded-2xl border border-white/10 bg-slate-900/50 p-6"
                >
                  <h3 class="mb-2 font-bold text-green-400">Zero Pubblicità</h3>
                  <p class="text-sm text-slate-400">
                    Non mostriamo annunci e non usiamo i tuoi dati per
                    targetizzazione pubblicitaria
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- CTA -->
      <div class="mx-auto max-w-7xl px-6 py-16">
        <section class="text-center">
          <h2 class="mb-4 text-3xl font-black uppercase">
            Hai domande sulla sicurezza?
          </h2>
          <p class="mb-8 text-slate-300">
            Visita il nostro centro assistenza per saperne di più su come
            proteggiamo i tuoi dati.
          </p>
          <button
            class="rounded-full bg-green-600 px-8 py-3 font-bold text-white transition-all hover:scale-105 hover:bg-green-500"
          >
            Vai al supporto
          </button>
        </section>
      </div>
    </main>
  </AppLayout>
</template>
