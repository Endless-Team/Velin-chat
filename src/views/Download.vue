<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import AppLayout from "../components/AppLayout.vue";

// ========================================
// CONFIGURAZIONE GITHUB
// ========================================
const GITHUB_USER = "Endless-Team"; // ⚠️ CAMBIA CON IL TUO USERNAME
const GITHUB_REPO = "Velin-chat"; // ⚠️ CAMBIA CON IL NOME DEL TUO REPO
const VERSION = "0.1.0"; // Mantieni sincronizzato con tauri.conf.json

// ========================================
// STATE
// ========================================
const detectedOS = ref<string>("");

// ========================================
// PLATFORMS CONFIGURATION
// ========================================
const platforms = [
  {
    name: "Windows",
    icon: "mdi:microsoft-windows",
    description: "Windows 10 o superiore",
    downloadUrl: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/releases/download/v${VERSION}/Velin_${VERSION}_x64-setup.exe`,
    os: "windows",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "macOS",
    icon: "mdi:apple",
    description: "macOS 10.13 o superiore",
    downloadUrl: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/releases/download/v${VERSION}/Velin_${VERSION}_x64.dmg`,
    os: "macos",
    gradient: "from-gray-500 to-slate-600",
  },
  {
    name: "Linux",
    icon: "mdi:linux",
    description: "Ubuntu, Fedora, Debian",
    downloadUrl: `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/releases/download/v${VERSION}/velin_${VERSION}_amd64.AppImage`,
    os: "linux",
    gradient: "from-orange-500 to-red-500",
  },
  {
    name: "iOS",
    icon: "mdi:cellphone",
    description: "iOS 14 o superiore",
    downloadUrl: "https://apps.apple.com/app/velin/id123456789", // ⚠️ Sostituisci con il tuo App Store URL
    os: "ios",
    gradient: "from-purple-500 to-pink-500",
    external: true,
  },
  {
    name: "Android",
    icon: "mdi:android",
    description: "Android 8.0 o superiore",
    downloadUrl: "https://play.google.com/store/apps/details?id=com.velin.app", // ⚠️ Sostituisci con il tuo Play Store URL
    os: "android",
    gradient: "from-green-500 to-emerald-500",
    external: true,
  },
  {
    name: "Web",
    icon: "mdi:web",
    description: "Usa nel browser",
    downloadUrl: "/login",
    os: "web",
    gradient: "from-indigo-500 to-purple-500",
    isWebApp: true,
  },
];

// ========================================
// FUNCTIONS
// ========================================

/**
 * Rileva il sistema operativo dell'utente
 * @returns {string} Il sistema operativo rilevato
 */
const detectOS = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();

  if (userAgent.includes("win") || platform.includes("win")) {
    return "windows";
  } else if (userAgent.includes("mac") || platform.includes("mac")) {
    // Distingui tra macOS e iOS
    if (
      userAgent.includes("iphone") ||
      userAgent.includes("ipad") ||
      userAgent.includes("ipod")
    ) {
      return "ios";
    }
    return "macos";
  } else if (userAgent.includes("linux") || platform.includes("linux")) {
    // Distingui tra Linux e Android
    if (userAgent.includes("android")) {
      return "android";
    }
    return "linux";
  } else if (userAgent.includes("android")) {
    return "android";
  }

  return "web";
};

/**
 * Gestisce il download in base al tipo di piattaforma
 * @param {object} platform - L'oggetto piattaforma da scaricare
 */
const handleDownload = (platform: (typeof platforms)[0]) => {
  if (platform.isWebApp) {
    // Vai alla web app
    window.location.href = platform.downloadUrl;
  } else if (platform.external) {
    // Apri store esterno in nuova tab
    window.open(platform.downloadUrl, "_blank");
  } else {
    // Download diretto da GitHub
    window.location.href = platform.downloadUrl;
  }
};

/**
 * Trova la piattaforma principale basata sul sistema operativo rilevato
 * @returns {object} La piattaforma corrispondente
 */
const getPrimaryPlatform = () => {
  return platforms.find((p) => p.os === detectedOS.value) || platforms[5]; // Default: Web
};

// ========================================
// LIFECYCLE
// ========================================
onMounted(() => {
  detectedOS.value = detectOS();
});
</script>

<template>
  <AppLayout>
    <main class="w-full">
      <!-- Hero Section -->
      <div class="mx-auto max-w-7xl px-6 py-12">
        <div class="space-y-16">
          <!-- Hero Header -->
          <section class="text-center">
            <!-- Badge -->
            <div
              class="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-5 py-2"
            >
              <svg
                class="h-5 w-5 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span class="font-semibold text-indigo-200"
                >Disponibile su tutte le piattaforme</span
              >
            </div>

            <!-- Main Title -->
            <h1
              class="mb-6 text-6xl font-black uppercase tracking-tight sm:text-7xl"
            >
              Scarica
              <span
                class="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent"
              >
                Velin
              </span>
            </h1>

            <!-- Subtitle -->
            <p class="mx-auto max-w-2xl text-xl leading-relaxed text-slate-300">
              Resta connesso ovunque tu sia. Scarica Velin per desktop, mobile o
              usalo direttamente nel browser.
            </p>

            <!-- Primary Download Button -->
            <div v-if="detectedOS" class="mt-10">
              <p class="mb-4 text-sm text-slate-400">
                Sistema rilevato:
                <span class="font-semibold text-white">{{
                  getPrimaryPlatform().name
                }}</span>
              </p>
              <button
                @click="handleDownload(getPrimaryPlatform())"
                class="inline-flex items-center gap-3 rounded-full bg-indigo-600 px-10 py-4 text-lg font-bold text-white shadow-2xl shadow-indigo-600/50 transition-all hover:scale-105 hover:bg-indigo-500"
              >
                <span class="text-2xl"
                  ><Icon :icon="getPrimaryPlatform().icon" class="h-8 w-8"
                /></span>
                {{
                  getPrimaryPlatform().isWebApp
                    ? "Apri Velin Web"
                    : `Scarica per ${getPrimaryPlatform().name}`
                }}
              </button>
            </div>
          </section>

          <!-- All Platforms Grid -->
          <section>
            <h2 class="mb-8 text-center text-2xl font-bold text-slate-300">
              Oppure scegli la tua piattaforma
            </h2>

            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div
                v-for="platform in platforms"
                :key="platform.name"
                class="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-sm transition-all hover:scale-105 hover:border-white/20"
                :class="{
                  'ring-2 ring-indigo-500': platform.os === detectedOS,
                }"
              >
                <!-- Recommended Badge -->
                <div
                  v-if="platform.os === detectedOS"
                  class="absolute right-4 top-4 rounded-full bg-indigo-500 px-3 py-1 text-xs font-bold text-white"
                >
                  Consigliato
                </div>

                <!-- Gradient Background Hover Effect -->
                <div
                  :class="`absolute inset-0 bg-gradient-to-br ${platform.gradient} opacity-0 transition-opacity group-hover:opacity-10`"
                ></div>

                <!-- Platform Content -->
                <div class="relative space-y-4">
                  <!-- Icon -->
                  <div class="text-6xl">
                    <Icon :icon="platform.icon" class="h-16 w-16" />
                  </div>

                  <!-- Name -->
                  <h3 class="text-2xl font-bold">{{ platform.name }}</h3>

                  <!-- Description -->
                  <p class="text-sm text-slate-400">
                    {{ platform.description }}
                  </p>

                  <!-- Download Button -->
                  <button
                    @click="handleDownload(platform)"
                    class="w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:bg-indigo-500"
                  >
                    {{
                      platform.external
                        ? "Vai allo Store"
                        : platform.isWebApp
                          ? "Apri Web App"
                          : "Scarica"
                    }}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Features Section - Full Width Background -->
      <div class="w-full bg-slate-950 py-16">
        <div class="mx-auto max-w-7xl px-6">
          <section
            class="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-12 backdrop-blur-sm"
          >
            <h2 class="mb-8 text-center text-3xl font-black uppercase">
              Sincronizzazione automatica
            </h2>

            <div class="grid gap-8 md:grid-cols-3">
              <!-- Feature 1: Cloud Sync -->
              <div class="text-center">
                <div class="mb-4 flex justify-center">
                  <div
                    class="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/20"
                  >
                    <svg
                      class="h-8 w-8 text-indigo-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                </div>
                <h3 class="mb-2 font-bold">Cloud Sync</h3>
                <p class="text-sm text-slate-400">
                  I tuoi messaggi sincronizzati su tutti i dispositivi in tempo
                  reale
                </p>
              </div>

              <!-- Feature 2: Security -->
              <div class="text-center">
                <div class="mb-4 flex justify-center">
                  <div
                    class="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/20"
                  >
                    <svg
                      class="h-8 w-8 text-cyan-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 class="mb-2 font-bold">Sicurezza totale</h3>
                <p class="text-sm text-slate-400">
                  Crittografia end-to-end su tutte le piattaforme
                </p>
              </div>

              <!-- Feature 3: Speed -->
              <div class="text-center">
                <div class="mb-4 flex justify-center">
                  <div
                    class="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/20"
                  >
                    <svg
                      class="h-8 w-8 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 class="mb-2 font-bold">Super veloce</h3>
                <p class="text-sm text-slate-400">
                  Ottimizzato per prestazioni eccellenti
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- System Requirements Section -->
      <div class="mx-auto max-w-7xl px-6 py-16">
        <section class="text-center">
          <h2 class="mb-8 text-3xl font-black uppercase">
            Requisiti di sistema
          </h2>

          <div class="grid gap-6 md:grid-cols-3">
            <!-- Windows -->
            <div
              class="rounded-2xl border border-white/10 bg-slate-900/50 p-6 text-left backdrop-blur-sm"
            >
              <div class="mb-4 text-4xl">💻</div>
              <h3 class="mb-3 text-xl font-bold">Windows</h3>
              <ul class="space-y-2 text-sm text-slate-400">
                <li>• Windows 10 (64-bit) o superiore</li>
                <li>• 4 GB RAM (8 GB raccomandati)</li>
                <li>• 200 MB spazio su disco</li>
                <li>• WebView2 Runtime</li>
              </ul>
            </div>

            <!-- macOS -->
            <div
              class="rounded-2xl border border-white/10 bg-slate-900/50 p-6 text-left backdrop-blur-sm"
            >
              <div class="mb-4 text-4xl">🍎</div>
              <h3 class="mb-3 text-xl font-bold">macOS</h3>
              <ul class="space-y-2 text-sm text-slate-400">
                <li>• macOS 10.13 (High Sierra) o superiore</li>
                <li>• 4 GB RAM (8 GB raccomandati)</li>
                <li>• 200 MB spazio su disco</li>
                <li>• Processore Intel o Apple Silicon</li>
              </ul>
            </div>

            <!-- Linux -->
            <div
              class="rounded-2xl border border-white/10 bg-slate-900/50 p-6 text-left backdrop-blur-sm"
            >
              <div class="mb-4 text-4xl">🐧</div>
              <h3 class="mb-3 text-xl font-bold">Linux</h3>
              <ul class="space-y-2 text-sm text-slate-400">
                <li>• Ubuntu 18.04+ / Debian 10+</li>
                <li>• 4 GB RAM (8 GB raccomandati)</li>
                <li>• 200 MB spazio su disco</li>
                <li>• GTK 3.22+ / WebKitGTK 2.22+</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      <!-- FAQ Section -->
      <div class="w-full bg-slate-950 py-16">
        <div class="mx-auto max-w-7xl px-6">
          <section>
            <h2 class="mb-12 text-center text-3xl font-black uppercase">
              Domande frequenti
            </h2>

            <div class="mx-auto max-w-3xl space-y-4">
              <!-- FAQ 1 -->
              <details
                class="group rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm"
              >
                <summary
                  class="flex cursor-pointer items-center justify-between font-semibold"
                >
                  <span>Velin è gratuito?</span>
                  <svg
                    class="h-5 w-5 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <p class="mt-4 text-sm text-slate-400">
                  Sì, Velin è completamente gratuito per uso personale. Non ci
                  sono costi nascosti, pubblicità o limiti di messaggi.
                </p>
              </details>

              <!-- FAQ 2 -->
              <details
                class="group rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm"
              >
                <summary
                  class="flex cursor-pointer items-center justify-between font-semibold"
                >
                  <span>I miei messaggi sono crittografati?</span>
                  <svg
                    class="h-5 w-5 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <p class="mt-4 text-sm text-slate-400">
                  Assolutamente sì. Tutti i messaggi sono protetti con
                  crittografia end-to-end. Solo tu e il destinatario potete
                  leggerli.
                </p>
              </details>

              <!-- FAQ 3 -->
              <details
                class="group rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm"
              >
                <summary
                  class="flex cursor-pointer items-center justify-between font-semibold"
                >
                  <span>Posso usare Velin su più dispositivi?</span>
                  <svg
                    class="h-5 w-5 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <p class="mt-4 text-sm text-slate-400">
                  Sì, puoi usare Velin contemporaneamente su desktop, mobile e
                  web. I tuoi messaggi si sincronizzano automaticamente su tutti
                  i dispositivi.
                </p>
              </details>

              <!-- FAQ 4 -->
              <details
                class="group rounded-2xl border border-white/10 bg-slate-900/50 p-6 backdrop-blur-sm"
              >
                <summary
                  class="flex cursor-pointer items-center justify-between font-semibold"
                >
                  <span>Come aggiorno Velin?</span>
                  <svg
                    class="h-5 w-5 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <p class="mt-4 text-sm text-slate-400">
                  Velin si aggiorna automaticamente. Quando è disponibile una
                  nuova versione, riceverai una notifica e l'app si aggiornerà
                  al prossimo riavvio.
                </p>
              </details>
            </div>
          </section>
        </div>
      </div>
    </main>
  </AppLayout>
</template>
