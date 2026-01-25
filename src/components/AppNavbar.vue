<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const isMenuOpen = ref(false);
const isScrolled = ref(false);

const navLinks = [
  { name: "Home", path: "/", icon: "🏠" },
  { name: "Download", path: "/download", icon: "⬇️" },
  { name: "Sicurezza", path: "/safety", icon: "🔒" },
  { name: "Supporto", path: "/support", icon: "💬" },
  { name: "Blog", path: "/blog", icon: "📝" },
];

const isActive = (path: string) => {
  return route.path === path;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <header
    :class="[
      'sticky top-0 z-50 transition-all duration-300',
      isScrolled
        ? 'border-b border-white/10 bg-slate-950/95 shadow-xl shadow-black/20 backdrop-blur-xl'
        : 'border-b border-white/5 bg-slate-950/80 backdrop-blur-md',
    ]"
  >
    <nav
      :class="[
        'mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-300',
        isScrolled ? 'py-3' : 'py-4',
      ]"
    >
      <!-- Logo -->
      <div
        @click="router.push('/')"
        class="flex cursor-pointer items-center gap-3 transition-transform hover:scale-105"
      >
        <div
          :class="[
            'flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 transition-all',
            isScrolled ? 'h-9 w-9' : 'h-10 w-10',
          ]"
        >
          <span
            :class="[
              'font-black text-white transition-all',
              isScrolled ? 'text-lg' : 'text-xl',
            ]"
            >V</span
          >
        </div>
        <span class="text-xl font-black tracking-tight text-white">Velin</span>
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden items-center gap-2 md:flex">
        <a
          v-for="link in navLinks"
          :key="link.path"
          @click="router.push(link.path)"
          :class="[
            'cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-all',
            isActive(link.path)
              ? 'bg-white/10 text-white shadow-sm shadow-white/10'
              : 'text-slate-300 hover:bg-white/5 hover:text-white',
          ]"
        >
          {{ link.name }}
        </a>
      </div>

      <!-- Desktop CTA -->
      <div class="hidden items-center gap-3 md:flex">
        <button
          @click="router.push('/login')"
          class="rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 transition-all hover:text-white"
        >
          Accedi
        </button>
        <button
          @click="router.push('/login')"
          class="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-white/20 transition-all hover:scale-105 hover:shadow-white/30"
        >
          Apri Velin
        </button>
      </div>

      <!-- Mobile Menu Button -->
      <button
        @click="isMenuOpen = !isMenuOpen"
        class="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/5 hover:text-white md:hidden"
      >
        <svg
          v-if="!isMenuOpen"
          class="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <svg
          v-else
          class="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </nav>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="isMenuOpen"
        class="border-t border-white/10 bg-slate-900/95 backdrop-blur-xl md:hidden"
      >
        <div class="mx-auto max-w-7xl space-y-1 px-6 py-4">
          <!-- Mobile Nav Links -->
          <a
            v-for="link in navLinks"
            :key="link.path"
            @click="
              router.push(link.path);
              closeMenu();
            "
            :class="[
              'flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all',
              isActive(link.path)
                ? 'bg-white/10 text-white shadow-sm shadow-white/5'
                : 'text-slate-300 hover:bg-white/5 hover:text-white',
            ]"
          >
            <span class="text-lg">{{ link.icon }}</span>
            {{ link.name }}
          </a>

          <!-- Mobile CTA Buttons -->
          <div class="space-y-2 border-t border-white/10 pt-4">
            <button
              @click="
                router.push('/login');
                closeMenu();
              "
              class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Accedi
            </button>
            <button
              @click="
                router.push('/login');
                closeMenu();
              "
              class="w-full rounded-lg bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-white/20 transition-all hover:shadow-white/30"
            >
              Apri Velin
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>
