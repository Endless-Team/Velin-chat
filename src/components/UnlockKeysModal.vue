<script setup lang="ts">
import {ref} from 'vue';
import {keyStore} from '../stores/keyStore';
import type {UserKeys} from '../types/chat.types';

const emit = defineEmits<{
  unlocked: [];
  close: [];
}>();

const password = ref('');
const isLoading = ref(false);
const error = ref('');
const showPassword = ref(false);

// Mock user keys - in produzione verranno dal backend/localStorage
const mockUserKeys: UserKeys = {
  userId: 'current-user-id',
  publicKey: '{"kty":"RSA","e":"AQAB","n":"xGOr..."}',
  encryptedPrivateKey: 'base64_encrypted_private_key_here',
  iv: 'base64_iv_here',
  salt: 'base64_salt_here'
};

async function handleUnlock() {
  if (!password.value.trim()) {
    error.value = 'Inserisci la password';
    return;
  }

  isLoading.value = true;
  error.value = '';

  try {
    // TODO: Recupera le chiavi dal backend o localStorage
    // const userKeys = await fetchUserKeys();

    const success = await keyStore.unlockKeys(mockUserKeys, password.value);

    if (success) {
      emit('unlocked');
    } else {
      error.value = 'Password non corretta';
    }
  } catch (err) {
    console.error('Errore nello sblocco delle chiavi:', err);
    error.value = 'Errore nello sblocco. Verifica la password.';
  } finally {
    isLoading.value = false;
  }
}

function handleClose() {
  if (!isLoading.value) {
    emit('close');
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div class="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
      <!-- Header -->
      <div class="mb-6 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20">
          <svg class="h-8 w-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-slate-100">Sblocca Crittografia</h2>
        <p class="mt-2 text-sm text-slate-400">
          Inserisci la tua password per sbloccare le chiavi di crittografia end-to-end
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleUnlock" class="space-y-4">
        <!-- Password Input -->
        <div>
          <label for="unlock-password" class="mb-2 block text-sm font-medium text-slate-300">
            Password
          </label>
          <div class="relative">
            <input
                id="unlock-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Inserisci la password"
                class="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 pr-12 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                :disabled="isLoading"
                autocomplete="current-password"
            />
            <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                :disabled="isLoading"
            >
              <svg v-if="showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
              <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <div
            v-if="error"
            class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {{ error }}
        </div>

        <!-- Info Box -->
        <div class="rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-3">
          <div class="flex gap-3">
            <svg class="h-5 w-5 flex-shrink-0 text-blue-400 mt-0.5" fill="none" stroke="currentColor"
                 viewBox="0 0 24 24">
              <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div class="text-sm text-blue-300">
              <p class="font-medium">Perché serve la password?</p>
              <p class="mt-1 text-blue-400">
                La tua chiave privata è cifrata e protetta dalla password. Nessuno, nemmeno noi, può leggere i tuoi
                messaggi.
              </p>
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3">
          <button
              type="button"
              @click="handleClose"
              :disabled="isLoading"
              class="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-slate-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Annulla
          </button>
          <button
              type="submit"
              :disabled="isLoading || !password.trim()"
              class="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg
                v-if="isLoading"
                class="h-5 w-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {{ isLoading ? 'Sblocco...' : 'Sblocca' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
