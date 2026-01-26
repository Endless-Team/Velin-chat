<script setup lang="ts">
import { ref, computed } from "vue";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../firebase";

interface UserSearchResult {
  uid: string;
  email: string;
  displayName?: string;
  publicKey?: string;
}

const emit = defineEmits<{
  close: [];
  userSelected: [user: UserSearchResult];
}>();

const searchQuery = ref("");
const searchResults = ref<UserSearchResult[]>([]);
const isSearching = ref(false);
const searchError = ref("");

const hasResults = computed(() => searchResults.value.length > 0);
const noResults = computed(
  () =>
    !isSearching.value && searchQuery.value.length >= 2 && !hasResults.value,
);

// Gradient color per avatar basato sull'email
function getAvatarGradient(email: string) {
  const gradients = [
    "from-indigo-500 to-purple-600",
    "from-purple-500 to-pink-600",
    "from-pink-500 to-rose-600",
    "from-blue-500 to-cyan-600",
    "from-green-500 to-emerald-600",
    "from-yellow-500 to-orange-600",
    "from-red-500 to-pink-600",
    "from-cyan-500 to-blue-600",
  ];

  const hash = email.split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  return gradients[hash % gradients.length];
}

async function searchUsers() {
  if (searchQuery.value.length < 2) {
    searchResults.value = [];
    return;
  }

  isSearching.value = true;
  searchError.value = "";

  try {
    const usersRef = collection(db, "users");

    // Cerca per email esatta
    const emailQuery = query(
      usersRef,
      where("email", "==", searchQuery.value.trim()),
      limit(10),
    );

    const emailSnapshot = await getDocs(emailQuery);
    const results: UserSearchResult[] = [];

    emailSnapshot.forEach((doc) => {
      const data = doc.data();
      results.push({
        uid: doc.id,
        email: data.email,
        displayName: data.displayName || data.email.split("@")[0],
        publicKey: data.publicKey,
      });
    });

    // Se non trova per email, cerca per displayName
    if (results.length === 0) {
      const searchLower = searchQuery.value.toLowerCase().trim();
      const nameQuery = query(
        usersRef,
        where("displayName", ">=", searchLower),
        where("displayName", "<=", searchLower + "\uf8ff"),
        limit(10),
      );

      const nameSnapshot = await getDocs(nameQuery);

      nameSnapshot.forEach((doc) => {
        const data = doc.data();
        if (!results.some((r) => r.uid === doc.id)) {
          results.push({
            uid: doc.id,
            email: data.email,
            displayName: data.displayName || data.email.split("@")[0],
            publicKey: data.publicKey,
          });
        }
      });
    }

    searchResults.value = results;
  } catch (error: any) {
    console.error("Errore nella ricerca:", error);
    searchError.value = "Errore durante la ricerca degli utenti";
  } finally {
    isSearching.value = false;
  }
}

function selectUser(user: UserSearchResult) {
  emit("userSelected", user);
}

function handleClose() {
  emit("close");
}

let searchTimeout: NodeJS.Timeout;

function handleSearchInput() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchUsers();
  }, 500);
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
    @click.self="handleClose"
  >
    <div
      class="w-full max-w-lg rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 shadow-2xl border border-white/5 animate-scaleIn"
      @click.stop
    >
      <!-- Header con Gradient -->
      <div
        class="flex items-center justify-between border-b border-white/5 p-6 bg-gradient-to-r from-indigo-600/10 to-purple-600/10"
      >
        <div>
          <h2 class="text-2xl font-black text-slate-100">Nuova Chat</h2>
          <p class="text-sm text-slate-400 mt-1">
            Inizia una conversazione sicura
          </p>
        </div>
        <button
          @click="handleClose"
          class="rounded-xl p-2.5 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-all"
          title="Chiudi"
        >
          <svg
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Search Input -->
      <div class="p-6 space-y-4">
        <div class="relative group">
          <svg
            class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            v-model="searchQuery"
            @input="handleSearchInput"
            type="text"
            placeholder="Cerca per email o nome utente..."
            class="w-full rounded-xl border border-white/10 bg-slate-950/60 py-3.5 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition-all"
            autofocus
          />

          <!-- Clear Button -->
          <button
            v-if="searchQuery"
            @click="
              searchQuery = '';
              searchResults = [];
            "
            class="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-all"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Error Message -->
        <div
          v-if="searchError"
          class="rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 px-4 py-3 flex items-start gap-3 animate-shake"
        >
          <svg
            class="h-5 w-5 text-red-400 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span class="text-sm text-red-300">{{ searchError }}</span>
        </div>

        <!-- Loading State -->
        <div
          v-if="isSearching"
          class="flex flex-col items-center justify-center py-12"
        >
          <div class="relative">
            <div
              class="absolute inset-0 bg-indigo-500/20 blur-2xl animate-pulse"
            ></div>
            <svg
              class="relative h-10 w-10 animate-spin text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p class="mt-4 text-sm text-slate-400 font-medium">
            Ricerca in corso...
          </p>
        </div>

        <!-- No Results -->
        <div
          v-if="noResults"
          class="flex flex-col items-center justify-center py-12"
        >
          <div class="relative mb-4">
            <div class="absolute inset-0 bg-slate-700/20 blur-2xl"></div>
            <div
              class="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/50 border border-white/5"
            >
              <svg
                class="h-8 w-8 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
          <p class="text-sm font-semibold text-slate-300">
            Nessun utente trovato
          </p>
          <p class="mt-1 text-xs text-slate-500">
            Prova a cercare con l'email completa
          </p>
        </div>

        <!-- Search Results -->
        <div
          v-if="hasResults && !isSearching"
          class="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
        >
          <div class="space-y-2">
            <button
              v-for="user in searchResults"
              :key="user.uid"
              @click="selectUser(user)"
              class="group relative flex w-full items-center gap-3 rounded-xl p-3 hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
            >
              <!-- Avatar con Gradient -->
              <div class="relative shrink-0">
                <span
                  class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br font-bold text-white shadow-lg ring-2 ring-white/10 group-hover:ring-white/20 transition-all text-sm"
                  :class="getAvatarGradient(user.email)"
                >
                  {{
                    user.displayName?.charAt(0).toUpperCase() ||
                    user.email.charAt(0).toUpperCase()
                  }}
                </span>

                <!-- Verified Badge (se ha la chiave pubblica) -->
                <span
                  v-if="user.publicKey"
                  class="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 ring-2 ring-slate-900"
                  title="Chiave pubblica verificata"
                >
                  <svg
                    class="h-2.5 w-2.5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </div>

              <!-- User Info -->
              <div class="flex-1 min-w-0 text-left">
                <div
                  class="font-semibold text-slate-100 truncate group-hover:text-white transition-colors"
                >
                  {{ user.displayName || "Utente" }}
                </div>
                <div
                  class="text-xs text-slate-400 truncate group-hover:text-slate-300 transition-colors"
                >
                  {{ user.email }}
                </div>

                <!-- E2E Badge -->
                <div class="flex items-center gap-1 mt-1">
                  <svg
                    class="h-3 w-3 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"
                    />
                  </svg>
                  <span class="text-xs text-green-400 font-medium">E2E</span>
                </div>
              </div>

              <!-- Arrow Icon -->
              <svg
                class="h-5 w-5 text-slate-400 shrink-0 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>

              <!-- Hover Effect -->
              <div
                class="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-purple-500/0 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none rounded-xl"
              ></div>
            </button>
          </div>
        </div>

        <!-- Helper Text -->
        <div
          v-if="!searchQuery && !isSearching && !hasResults"
          class="rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 px-4 py-3"
        >
          <div class="flex items-start gap-3">
            <div class="shrink-0">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20"
              >
                <svg
                  class="h-4 w-4 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <p class="text-xs font-semibold text-indigo-300 mb-1">
                Come cercare un utente
              </p>
              <p class="text-xs text-indigo-300/80 leading-relaxed">
                Cerca un utente per email o nome utente per iniziare una nuova
                conversazione protetta con crittografia end-to-end
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}

.animate-scaleIn {
  animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.5);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.7);
}
</style>
