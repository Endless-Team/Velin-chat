<script setup lang="ts">
import AppLayout from "../components/AppLayout.vue";

const articles = [
  {
    title: "Presentazione di Velin 2.0: Il Futuro della Messaggistica",
    excerpt:
      "Scopri tutte le novità della versione 2.0 con interfaccia rinnovata, chiamate vocali HD e molto altro.",
    date: "15 Gennaio 2026",
    category: "Aggiornamenti",
    image: "📱",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    title: "Come Proteggiamo la Tua Privacy: Dietro le Quinte",
    excerpt:
      "Un approfondimento tecnico sulla crittografia end-to-end e le misure di sicurezza implementate in Velin.",
    date: "10 Gennaio 2026",
    category: "Sicurezza",
    image: "🔒",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "5 Trucchi per Usare Velin Come un Pro",
    excerpt:
      "Scopri funzionalità nascoste e scorciatoie che renderanno la tua esperienza ancora più fluida.",
    date: "5 Gennaio 2026",
    category: "Tutorial",
    image: "✨",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    title: "Velin for Business: Comunicazione Aziendale Sicura",
    excerpt:
      "La nuova versione business di Velin pensata per team e aziende che vogliono proteggere i propri dati.",
    date: "28 Dicembre 2025",
    category: "Business",
    image: "💼",
    gradient: "from-orange-500 to-red-500",
  },
  {
    title: "Storia di Velin: Come Siamo Nati e Velin Stiamo Andando",
    excerpt:
      "Il viaggio dalla prima riga di codice a milioni di utenti in tutto il mondo.",
    date: "20 Dicembre 2025",
    category: "Azienda",
    image: "🚀",
    gradient: "from-pink-500 to-purple-500",
  },
  {
    title: "Messaggistica Sostenibile: Il Nostro Impegno per l'Ambiente",
    excerpt:
      "Come stiamo riducendo l'impatto ambientale dei nostri data center e operazioni.",
    date: "15 Dicembre 2025",
    category: "Sostenibilità",
    image: "🌱",
    gradient: "from-lime-500 to-green-500",
  },
];
</script>

<template>
  <AppLayout>
    <main class="w-full">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-12">
        <div class="space-y-12 sm:space-y-16">
          <!-- Hero -->
          <section class="text-center">
            <div class="mb-5 inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-4 py-2 sm:px-5">
              <svg
                class="h-5 w-5 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              <span class="font-semibold text-purple-200 text-sm sm:text-base">
                Storie, aggiornamenti e novità
              </span>
            </div>

            <h1 class="mb-4 sm:mb-6 text-4xl font-black uppercase tracking-tight sm:text-6xl">
              Blog
              <span class="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Velin
              </span>
            </h1>

            <p class="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-slate-300">
              Scopri le ultime novità, guide approfondite e storie dalla community di Velin.
            </p>
          </section>

          <!-- Featured Article -->
          <section
            class="group relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-indigo-500/20 to-purple-500/20 p-6 sm:p-10 lg:p-12 backdrop-blur-sm transition-all hover:border-white/20"
          >
            <div class="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <div class="mb-4 inline-block rounded-full bg-indigo-500/20 px-4 py-1.5 text-xs sm:text-sm font-semibold text-indigo-300">
                  In evidenza
                </div>

                <h2 class="mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl font-black uppercase leading-tight">
                  {{ articles[0].title }}
                </h2>

                <p class="mb-5 sm:mb-6 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-300">
                  {{ articles[0].excerpt }}
                </p>

                <div class="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-400">
                  <span>{{ articles[0].date }}</span>
                  <span>•</span>
                  <span>{{ articles[0].category }}</span>
                </div>

                <button
                  class="mt-6 rounded-full bg-indigo-600 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-white transition-all hover:scale-105 hover:bg-indigo-500"
                >
                  Leggi l'articolo
                </button>
              </div>

              <div class="flex items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 p-8 sm:p-12 lg:p-16">
                <div class="text-6xl sm:text-7xl lg:text-8xl">
                  {{ articles[0].image }}
                </div>
              </div>
            </div>
          </section>

          <!-- Articles Grid -->
          <section class="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="(article, index) in articles.slice(1)"
              :key="index"
              class="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-white/20"
            >
              <div
                :class="`absolute inset-0 bg-linear-to-br ${article.gradient} opacity-0 transition-opacity group-hover:opacity-10`"
              ></div>

              <div class="relative p-5 sm:p-6 lg:p-8">
                <div class="mb-5 text-4xl sm:text-5xl">
                  {{ article.image }}
                </div>

                <div class="mb-3 inline-block rounded-full bg-white/5 px-3 py-1 text-[11px] sm:text-xs font-semibold text-slate-400">
                  {{ article.category }}
                </div>

                <h3 class="mb-3 text-base sm:text-lg font-bold leading-tight">
                  {{ article.title }}
                </h3>

                <p class="mb-4 text-xs sm:text-sm leading-relaxed text-slate-400">
                  {{ article.excerpt }}
                </p>

                <div class="text-[11px] sm:text-xs text-slate-500">
                  {{ article.date }}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Newsletter CTA - Full Width Background -->
      <div class="w-full bg-slate-950 py-12 sm:py-16">
        <div class="mx-auto max-w-7xl px-4 sm:px-6">
          <section class="rounded-3xl border border-purple-500/20 bg-linear-to-br from-purple-500/10 to-pink-500/10 p-6 sm:p-10 lg:p-12 text-center backdrop-blur-sm">
            <h2 class="mb-3 sm:mb-4 text-2xl sm:text-3xl font-black uppercase">
              Resta aggiornato con la newsletter
            </h2>
            <p class="mb-6 sm:mb-8 text-sm sm:text-base text-slate-300">
              Ricevi le ultime novità, tutorial e aggiornamenti direttamente nella tua inbox.
            </p>

            <div class="mx-auto flex max-w-md flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="La tua email"
                class="flex-1 rounded-full border border-white/10 bg-slate-900/50 px-5 sm:px-6 py-3 text-sm sm:text-base text-white placeholder-slate-400 backdrop-blur-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <button
                class="rounded-full bg-purple-600 px-7 sm:px-8 py-3 text-sm sm:text-base font-bold text-white transition-all hover:scale-105 hover:bg-purple-500"
              >
                Iscriviti
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  </AppLayout>
</template>
