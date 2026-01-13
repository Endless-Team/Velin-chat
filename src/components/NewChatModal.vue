<script setup lang="ts">
import {ref, computed} from 'vue';
import {collection, query, where, getDocs, limit} from 'firebase/firestore';
import {db} from '../firebase';

interface UserSearchResult {
  uid: string;
  email: string;
  displayName?: string;
  publicKey?: string;
}

const emit = defineEmits<{
  close: []
  userSelected: [user: UserSearchResult]
}>();

const searchQuery = ref('');
const searchResults = ref<UserSearchResult[]>([]);
const isSearching = ref(false);
const searchError = ref('');

const hasResults = computed(() => searchResults.value.length > 0);
const noResults = computed(() => !isSearching.value && searchQuery.value.length >= 2 && !hasResults.value);

async function searchUsers() {
  if (searchQuery.value.length < 2) {
    searchResults.value = [];
    return;
  }

  isSearching.value = true;
  searchError.value = '';

  try {
    const usersRef = collection(db, 'users');

    // Cerca per email esatta (senza forzare il lowercase, così coincide con come è salvata in Firestore)
    const emailQuery = query(
        usersRef,
        where('email', '==', searchQuery.value.trim()),
        limit(10)
    );

    const emailSnapshot = await getDocs(emailQuery);
    const results: UserSearchResult[] = [];

    emailSnapshot.forEach((doc) => {
      const data = doc.data();
      results.push({
        uid: doc.id,
        email: data.email,
        displayName: data.displayName || data.email.split('@')[0],
        publicKey: data.publicKey
      });
    });

    // Se non trova per email, cerca per displayName che inizia con il termine
    if (results.length === 0) {
      const searchLower = searchQuery.value.toLowerCase().trim();
      const nameQuery = query(
          usersRef,
          where('displayName', '>=', searchLower),
          where('displayName', '<=', searchLower + '\uf8ff'),
          limit(10)
      );

      const nameSnapshot = await getDocs(nameQuery);

      nameSnapshot.forEach((doc) => {
        const data = doc.data();
        // Evita duplicati
        if (!results.some(r => r.uid === doc.id)) {
          results.push({
            uid: doc.id,
            email: data.email,
            displayName: data.displayName || data.email.split('@')[0],
            publicKey: data.publicKey
          });
        }
      });
    }

    searchResults.value = results;

  } catch (error: any) {
    console.error('Errore nella ricerca:', error);
    searchError.value = 'Errore durante la ricerca degli utenti';
  } finally {
    isSearching.value = false;
  }
}

function selectUser(user: UserSearchResult) {
  emit('userSelected', user);
}

function handleClose() {
  emit('close');
}

// Debounce della ricerca
let searchTimeout: NodeJS.Timeout;

function handleSearchInput() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchUsers();
  }, 500);
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" @click.self="handleClose">
    <div class="w-full max-w-lg rounded-2xl bg-slate-900 shadow-xl" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-white/10 p-4">
        <h2 class="text-lg font-semibold text-slate-100">Nuova Chat</h2>
        <button
            @click="handleClose"
            class="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-slate-200"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Search Input -->
      <div class="p-4">
        <div class="relative">
          <svg
              class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
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
          <input
              v-model="searchQuery"
              @input="handleSearchInput"
              type="text"
              placeholder="Cerca per email o nome utente..."
              class="w-full rounded-xl border border-white/10 bg-slate-950/40 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              autofocus
          />
        </div>

        <!-- Error Message -->
        <div v-if="searchError" class="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {{ searchError }}
        </div>

        <!-- Loading State -->
        <div v-if="isSearching" class="mt-4 flex items-center justify-center py-8">
          <svg class="h-8 w-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>

        <!-- No Results -->
        <div v-if="noResults" class="mt-4 py-8 text-center">
          <svg class="mx-auto h-12 w-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p class="mt-2 text-sm text-slate-400">Nessun utente trovato</p>
          <p class="mt-1 text-xs text-slate-500">Prova a cercare con l'email completa</p>
        </div>

        <!-- Search Results -->
        <div v-if="hasResults && !isSearching" class="mt-4 max-h-80 overflow-y-auto">
          <div class="space-y-1">
            <button
                v-for="user in searchResults"
                :key="user.uid"
                @click="selectUser(user)"
                class="flex w-full items-center gap-3 rounded-lg p-3 hover:bg-white/5 transition-colors text-left"
            >
              <span
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white text-sm"
              >
                {{ user.displayName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase() }}
              </span>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-slate-100 truncate">{{ user.displayName || 'Utente' }}</div>
                <div class="text-xs text-slate-400 truncate">{{ user.email }}</div>
              </div>
              <svg class="h-5 w-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Helper Text -->
        <div v-if="!searchQuery && !isSearching" class="mt-4 rounded-lg bg-indigo-500/10 px-3 py-2.5">
          <div class="flex items-start gap-2">
            <svg class="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-xs text-indigo-300">
              Cerca un utente per email o nome utente per iniziare una nuova conversazione protetta con crittografia
              end-to-end
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>