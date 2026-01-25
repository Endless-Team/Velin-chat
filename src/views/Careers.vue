<script setup lang="ts">
import { ref } from 'vue';
import AppLayout from "../components/AppLayout.vue";

const open = ref(false);

const openings = [
  {
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "Remote / Modena",
    type: "Full-time",
    icon: "💻",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Backend Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    icon: "⚙️",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "UI/UX Designer",
    department: "Design",
    location: "Remote / Modena",
    type: "Full-time",
    icon: "🎨",
    gradient: "from-orange-500 to-red-500",
  },
  {
    title: "Security Researcher",
    department: "Security",
    location: "Remote",
    type: "Full-time",
    icon: "🔒",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Community Manager",
    department: "Marketing",
    location: "Remote",
    type: "Part-time",
    icon: "💬",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    title: "DevOps Engineer",
    department: "Infrastructure",
    location: "Remote",
    type: "Full-time",
    icon: "🚀",
    gradient: "from-yellow-500 to-orange-500",
  },
];

const benefits = [
  {
    icon: "🏠",
    title: "Remote First",
    description: "Lavora da dove preferisci",
  },
  {
    icon: "💰",
    title: "Salary Competitivo",
    description: "RAL commisurata all'esperienza",
  },
  {
    icon: "📚",
    title: "Formazione",
    description: "Budget per corsi e conferenze",
  },
  {
    icon: "🏖️",
    title: "Flessibilità",
    description: "Orari flessibili e ferie illimitate",
  },
  {
    icon: "🩺",
    title: "Salute",
    description: "Assicurazione sanitaria integrativa",
  },
  { icon: "💻", title: "Setup", description: "MacBook Pro o PC a tua scelta" },
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
              class="mb-6 inline-flex items-center gap-2 rounded-full px-5 py-2"
              :class="open ? 'bg-green-500/10' : 'bg-red-500/10'"
            >
              <span class="relative flex h-2.5 w-2.5">
                <span
                  class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                  :class="open ? 'bg-green-400' : 'bg-red-400'"
                ></span>
                <span
                  class="relative inline-flex h-2.5 w-2.5 rounded-full"
                  :class="open ? 'bg-green-500' : 'bg-red-500'"
                ></span>
              </span>
              <span
                class="font-semibold"
                :class="open ? 'text-green-200' : 'text-red-200'"
              >
                {{ open ? "Stiamo assumendo!" : "Candidature chiuse" }}
              </span>
            </div>

            <h1
              class="mb-6 text-6xl font-black uppercase tracking-tight sm:text-7xl"
            >
              Lavora con
              <span
                class="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
              >
                Noi
              </span>
            </h1>

            <p class="mx-auto max-w-2xl text-xl leading-relaxed text-slate-300">
              Unisciti al team che sta costruendo il futuro della messaggistica
              privata. Lavoriamo su tecnologie all'avanguardia con un obiettivo:
              proteggere la privacy degli utenti.
            </p>
          </section>

          <!-- Benefits -->
          <section>
            <h2 class="mb-12 text-center text-4xl font-black uppercase">
              Perché Velin?
            </h2>
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div
                v-for="benefit in benefits"
                :key="benefit.title"
                class="rounded-3xl border border-white/10 bg-slate-900/50 p-6 text-center backdrop-blur-sm transition-all hover:border-white/20"
              >
                <div class="mb-3 text-4xl">{{ benefit.icon }}</div>
                <h3 class="mb-2 font-bold">{{ benefit.title }}</h3>
                <p class="text-sm text-slate-400">{{ benefit.description }}</p>
              </div>
            </div>
          </section>

          <!-- Open Positions -->
          <section>
            <h2 class="mb-12 text-center text-4xl font-black uppercase">
              Posizioni aperte
            </h2>
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div
                v-for="job in openings"
                :key="job.title"
                class="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-sm transition-all hover:scale-105 hover:border-white/20"
              >
                <div
                  :class="`absolute inset-0 bg-gradient-to-br ${job.gradient} opacity-0 transition-opacity group-hover:opacity-10`"
                ></div>

                <div class="relative space-y-4">
                  <div class="text-5xl">{{ job.icon }}</div>
                  <div>
                    <h3 class="mb-2 text-xl font-bold">{{ job.title }}</h3>
                    <div class="space-y-1 text-sm text-slate-400">
                      <div class="flex items-center gap-2">
                        <svg
                          class="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        {{ job.department }}
                      </div>
                      <div class="flex items-center gap-2">
                        <svg
                          class="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {{ job.location }}
                      </div>
                      <div class="flex items-center gap-2">
                        <svg
                          class="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {{ job.type }}
                      </div>
                    </div>
                  </div>
                  <button
                    class="w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:bg-indigo-500"
                  >
                    Candidati
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- CTA - Full Width Background -->
      <div class="w-full bg-slate-950 py-16">
        <div class="mx-auto max-w-7xl px-6">
          <section
            class="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-12 text-center backdrop-blur-sm"
          >
            <h2 class="mb-4 text-3xl font-black uppercase">
              Non trovi la posizione giusta?
            </h2>
            <p class="mb-8 text-slate-300">
              Inviaci comunque il tuo CV. Siamo sempre alla ricerca di talenti
              eccezionali.
            </p>
            <button
              class="rounded-full bg-indigo-600 px-8 py-3 font-bold text-white transition-all hover:scale-105 hover:bg-indigo-500"
            >
              Candidatura spontanea
            </button>
          </section>
        </div>
      </div>
    </main>
  </AppLayout>
</template>
