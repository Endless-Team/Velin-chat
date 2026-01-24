<script setup lang="ts">
import { ref } from "vue";
import { keyStore } from "../stores/keyStore";
import { auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const emit = defineEmits<{
  unlocked: [];
  close: [];
}>();

const password = ref("");
const error = ref("");
const showPassword = ref(false);
const isUnlocking = ref(false);

async function handleUnlock() {
  if (!password.value) {
    error.value = "Inserisci la password";
    return;
  }

  const currentUser = auth.currentUser;

  // ✅ Debug: verifica autenticazione
  console.log("🔐 Auth state:", {
    isAuthenticated: !!currentUser,
    uid: currentUser?.uid,
    email: currentUser?.email,
  });

  if (!currentUser) {
    error.value = "Utente non autenticato";
    return;
  }

  isUnlocking.value = true;
  error.value = "";

  try {
    console.log("🔓 Tentativo di sblocco chiavi...");
    console.log("📍 Percorso Firestore:", `userKeys/${currentUser.uid}`);

    // 1. Recupera le chiavi cifrate da Firebase
    const userKeysRef = doc(db, "userKeys", currentUser.uid);
    const userKeysSnap = await getDoc(userKeysRef);

    console.log("📦 Documento trovato:", userKeysSnap.exists());

    if (!userKeysSnap.exists()) {
      error.value = "Chiavi non trovate. Genera nuove chiavi.";
      isUnlocking.value = false;
      return;
    }

    const userKeys = userKeysSnap.data();
    console.log("🔑 Chiavi caricate:", {
      hasEncryptedPrivateKey: !!userKeys.encryptedPrivateKey,
      hasPublicKey: !!userKeys.publicKey,
      hasSalt: !!userKeys.salt,
    });

    // 2. Prova a sbloccare con la password
    const success = await keyStore.unlockKeys(userKeys as any, password.value);

    if (success) {
      console.log("✅ Chiavi sbloccate con successo!");
      emit("unlocked");
    } else {
      console.error("❌ Password errata");
      error.value = "Password non corretta";
    }
  } catch (e: any) {
    console.error("❌ Errore nello sblocco:", e);
    console.error("🔍 Dettagli errore:", {
      code: e.code,
      message: e.message,
      stack: e.stack,
    });

    // ✅ Messaggi di errore più specifici
    if (e.code === "permission-denied") {
      error.value =
        "Errore di permessi Firestore. Verifica le regole di sicurezza.";
    } else if (e.message?.includes("Missing or insufficient permissions")) {
      error.value =
        "Permessi insufficienti. Le regole potrebbero non essere state applicate.";
    } else {
      error.value = e.message || "Errore nello sblocco delle chiavi";
    }
  } finally {
    isUnlocking.value = false;
  }
}

function handleCancel() {
  emit("close");
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
  >
    <div
      class="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl"
    >
      <!-- Header -->
      <div class="mb-6 text-center">
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20"
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
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-slate-100">Sblocca Crittografia</h2>
        <p class="mt-2 text-sm text-slate-400">
          Inserisci la password che hai usato per creare le chiavi di
          crittografia
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleUnlock" class="space-y-4">
        <!-- Password Input -->
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-300"
            >Password</label
          >
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••"
              class="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 pr-12 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              :disabled="isUnlocking"
              autocomplete="current-password"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
              :disabled="isUnlocking"
            >
              <svg
                v-if="!showPassword"
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
              <svg
                v-else
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="error"
          class="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {{ error }}
        </div>

        <!-- Info Box -->
        <div class="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
          <div class="flex gap-3">
            <svg
              class="h-5 w-5 shrink-0 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div class="text-sm">
              <p class="font-medium text-blue-300">Perché serve la password?</p>
              <p class="mt-1 text-blue-400">
                La tua chiave privata è cifrata e protetta dalla password.
                Nessuno, nemmeno noi, può leggere i tuoi messaggi.
              </p>
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3">
          <button
            type="button"
            @click="handleCancel"
            class="flex-1 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 font-medium text-slate-300 hover:bg-white/5 disabled:opacity-50"
            :disabled="isUnlocking"
          >
            Annulla
          </button>
          <button
            type="submit"
            class="flex-1 rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!password || isUnlocking"
          >
            <span v-if="!isUnlocking">Sblocca</span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
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
              Sblocco...
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
