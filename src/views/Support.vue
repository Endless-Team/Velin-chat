<script setup lang="ts">
import AppLayout from "../components/AppLayout.vue";

const categories = [
  {
    title: "Iniziare",
    icon: "🚀",
    articles: [
      "Come creare un account",
      "Impostare il tuo profilo",
      "Inviare il primo messaggio",
      "Aggiungere contatti",
    ],
  },
  {
    title: "Account e Privacy",
    icon: "🔒",
    articles: [
      "Gestire le impostazioni privacy",
      "Attivare l'autenticazione a due fattori",
      "Recuperare l'account",
      "Eliminare l'account",
    ],
  },
  {
    title: "Chat e Messaggi",
    icon: "💬",
    articles: [
      "Creare chat di gruppo",
      "Condividere file e media",
      "Usare emoji e stickers",
      "Messaggi vocali",
    ],
  },
  {
    title: "Problemi Tecnici",
    icon: "⚙️",
    articles: [
      "Problemi di connessione",
      "Notifiche non funzionanti",
      "Aggiornare l'app",
      "Ripristinare chat",
    ],
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
            <h1
              class="mb-6 text-6xl font-black uppercase tracking-tight sm:text-7xl"
            >
              Centro
              <span
                class="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"
              >
                Assistenza
              </span>
            </h1>

            <p class="mx-auto max-w-2xl text-xl leading-relaxed text-slate-300">
              Trova risposte alle tue domande e impara a usare Velin al massimo.
            </p>

            <!-- Search Bar -->
            <div class="mx-auto mt-8 max-w-2xl">
              <div class="relative">
                <input
                  type="text"
                  placeholder="Cerca articoli di supporto..."
                  class="w-full rounded-full border border-white/10 bg-slate-900/50 px-6 py-4 pr-12 text-white placeholder-slate-400 backdrop-blur-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <svg
                  class="absolute right-4 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </section>

          <!-- Categories -->
          <section class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div
              v-for="category in categories"
              :key="category.title"
              class="rounded-3xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm transition-all hover:border-white/20"
            >
              <div class="mb-4 text-4xl">{{ category.icon }}</div>
              <h3 class="mb-4 text-xl font-bold">{{ category.title }}</h3>
              <ul class="space-y-2">
                <li v-for="article in category.articles" :key="article">
                  <a
                    href="#"
                    class="text-sm text-slate-400 transition-colors hover:text-indigo-400 hover:underline"
                  >
                    {{ article }}
                  </a>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>

      <!-- Contact Support - Full Width Background -->
      <div class="w-full bg-slate-950 py-16">
        <div class="mx-auto max-w-7xl px-6">
          <section
            class="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-12 text-center backdrop-blur-sm"
          >
            <h2 class="mb-4 text-3xl font-black uppercase">
              Non trovi quello che cerchi?
            </h2>
            <p class="mb-8 text-slate-300">
              Il nostro team di supporto è qui per aiutarti.
            </p>
            <button
              class="rounded-full bg-indigo-600 px-8 py-3 font-bold text-white transition-all hover:scale-105 hover:bg-indigo-500"
            >
              Contatta il supporto
            </button>
          </section>
        </div>
      </div>
    </main>
  </AppLayout>
</template>
