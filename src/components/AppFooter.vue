<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const currentYear = new Date().getFullYear();
const selectedLanguage = ref("Italiano");
</script>

<template>
  <footer class="relative bg-gradient-to-b from-indigo-950 to-slate-950 pt-16">
    <!-- Wave Divider -->
    <div class="absolute left-0 right-0 top-0 h-12 -translate-y-full">
      <svg
        class="h-12 w-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          class="text-indigo-950"
          d="M0,32L80,37.3C160,43,320,53,480,58.7C640,64,800,64,960,58.7C1120,53,1280,43,1360,37.3L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
        ></path>
      </svg>
    </div>

    <div class="mx-auto max-w-7xl px-6 pb-8">
      <!-- Main Footer Grid -->
      <div class="grid gap-12 pb-12 md:grid-cols-2 lg:grid-cols-5">
        <!-- Brand Column -->
        <div class="lg:col-span-1">
          <div class="mb-6 flex items-center gap-3">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600"
            >
              <span class="text-2xl font-black text-white">V</span>
            </div>
            <span class="text-2xl font-black text-white">Velin</span>
          </div>
          <p class="mb-6 text-sm leading-relaxed text-slate-400">
            La piattaforma di messaggistica che mette al centro privacy e
            velocità.
          </p>

          <!-- Social Icons -->
          <div class="flex gap-4">
            <a
              href="#"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-300 transition-all hover:bg-indigo-500 hover:text-white"
            >
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                />
              </svg>
            </a>
            <a
              href="#"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-300 transition-all hover:bg-indigo-500 hover:text-white"
            >
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                />
              </svg>
            </a>
            <a
              href="#"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-300 transition-all hover:bg-indigo-500 hover:text-white"
            >
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                />
              </svg>
            </a>
            <a
              href="#"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-300 transition-all hover:bg-indigo-500 hover:text-white"
            >
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
                />
              </svg>
            </a>
          </div>
        </div>

        <!-- Product Column -->
        <div>
          <h3
            class="mb-4 text-sm font-bold uppercase tracking-wider text-indigo-400"
          >
            Prodotto
          </h3>
          <ul class="space-y-3 text-sm">
            <li>
              <a
                @click="router.push('/download')"
                class="cursor-pointer text-slate-300 transition-colors hover:text-white hover:underline"
              >
                Download
              </a>
            </li>
            <li>
              <a
                href="#"
                class="text-slate-300 transition-colors hover:text-white hover:underline"
              >
                Premium
              </a>
            </li>
            <li>
              <a
                href="#"
                class="text-slate-300 transition-colors hover:text-white hover:underline"
              >
                Stato servizi
              </a>
            </li>
            <li>
              <a
                href="#"
                class="text-slate-300 transition-colors hover:text-white hover:underline"
              >
                Changelog
              </a>
            </li>
          </ul>
        </div>

        <!-- Company Column -->
        <div>
          <h3
            class="mb-4 text-sm font-bold uppercase tracking-wider text-indigo-400"
          >
            Azienda
          </h3>
          <ul class="space-y-3 text-sm">
            <li>
              <a
                @click="router.push('/about')"
                class="cursor-pointer text-slate-300 transition-colors hover:text-white hover:underline"
              >
                Chi siamo
              </a>
            </li>
            <li>
              <a
                @click="router.push('/careers')"
                class="cursor-pointer text-slate-300 transition-colors hover:text-white hover:underline"
              >
                Lavora con noi
              </a>
            </li>
            <li>
              <a
                href="#"
                class="text-slate-300 transition-colors hover:text-white hover:underline"
              >
                Brand
              </a>
            </li>
            <li>
              <a
                href="#"
                class="text-slate-300 transition-colors hover:text-white hover:underline"
              >
                Newsroom
              </a>
            </li>
          </ul>
        </div>

        <!-- Resources Column -->
        <div>
          <h3
            class="mb-4 text-sm font-bold uppercase tracking-wider text-indigo-400"
          >
            Risorse
          </h3>
          <ul class="space-y-3 text-sm">
            <li>
              <a
                @click="router.push('/support')"
                class="cursor-pointer text-slate-300 transition-colors hover:text-white hover:underline"
              >
                Supporto
              </a>
            </li>
            <li>
              <a
                @click="router.push('/safety')"
                class="cursor-pointer text-slate-300 transition-colors hover:text-white hover:underline"
              >
                Sicurezza
              </a>
            </li>
            <li>
              <a
                @click="router.push('/blog')"
                class="cursor-pointer text-slate-300 transition-colors hover:text-white hover:underline"
              >
                Blog
              </a>
            </li>
            <li>
              <a
                href="#"
                class="text-slate-300 transition-colors hover:text-white hover:underline"
              >
                Community
              </a>
            </li>
            <li>
              <a
                href="#"
                class="text-slate-300 transition-colors hover:text-white hover:underline"
              >
                Sviluppatori
              </a>
            </li>
          </ul>
        </div>

        <!-- Policies Column -->
        <div>
          <h3
            class="mb-4 text-sm font-bold uppercase tracking-wider text-indigo-400"
          >
            Legale
          </h3>
          <ul class="space-y-3 text-sm">
            <li>
              <a
                href="#"
                class="text-slate-300 transition-colors hover:text-white hover:underline"
              >
                Termini di servizio
              </a>
            </li>
            <li>
              <a
                href="#"
                class="text-slate-300 transition-colors hover:text-white hover:underline"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="#"
                class="text-slate-300 transition-colors hover:text-white hover:underline"
              >
                Cookie
              </a>
            </li>
            <li>
              <a
                href="#"
                class="text-slate-300 transition-colors hover:text-white hover:underline"
              >
                Linee guida
              </a>
            </li>
            <li>
              <a
                href="#"
                class="text-slate-300 transition-colors hover:text-white hover:underline"
              >
                Licenze
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div
        class="flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 md:flex-row"
      >
        <!-- Logo & Copyright -->
        <div class="flex items-center gap-4">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600"
          >
            <span class="text-lg font-black text-white">V</span>
          </div>
          <span class="text-sm text-slate-400"
            >© {{ currentYear }} Velin. Tutti i diritti riservati.</span
          >
        </div>

        <!-- Language Selector -->
        <div class="relative">
          <button
            class="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
              />
            </svg>
            {{ selectedLanguage }}
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
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>
