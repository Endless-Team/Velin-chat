<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase";
import { useEncryption } from "../composables/useEncryption";
import { firebaseMessaging } from "../services/firebaseMessaging";

const router = useRouter();
const { initializeNewUserKeys, loadAndUnlockKeys } = useEncryption();

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMsg = ref("");
const isSignUp = ref(false);
const isTauri = ref(false);

onMounted(async () => {
  // ✅ Rileva se siamo in Tauri
  try {
    if (typeof window !== "undefined") {
      const hasTauri =
      // @ts-ignore
        window.__TAURI_INTERNALS__ ||
        // @ts-ignore
        window.__TAURI__ ||
        // @ts-ignore
        window.__TAURI_IPC__ ||
        navigator.userAgent.includes("Tauri");

      if (hasTauri) {
        isTauri.value = true;
        console.log(
          "🖥️ App in modalità Tauri Desktop - Google login disabilitato"
        );
      } else {
        isTauri.value = false;
        console.log("🌐 App in modalità Web - Google login disponibile");
      }
    }
  } catch (error) {
    console.log("⚠️ Errore rilevamento Tauri, assumo modalità Web");
    isTauri.value = false;
  }

  console.log("🔍 Verifico se sto tornando da Google...");
  loading.value = true;

  try {
    const result = await getRedirectResult(auth);

    if (result) {
      const userId = result.user.uid;
      console.log("✅ Tornato da Google! UserId:", userId);

      const isNewUser =
        result.user.metadata.creationTime ===
        result.user.metadata.lastSignInTime;
      const tempPassword = `google_${userId}_temp`;

      if (isNewUser) {
        await firebaseMessaging.saveUserProfile(
          userId,
          result.user.email || "",
          result.user.displayName || undefined
        );
        await initializeNewUserKeys(userId, tempPassword);
        console.log("✅ Nuovo utente Google configurato");
      } else {
        await loadAndUnlockKeys(userId, tempPassword);
        console.log("✅ Utente Google esistente caricato");
      }

      await router.push("/dashboard");
    }
  } catch (error: any) {
    console.error("❌ Errore redirect Google:", error);
    if (error.code && error.code !== "auth/invalid-api-key") {
      errorMsg.value = "Errore durante l'autenticazione con Google.";
    }
  } finally {
    loading.value = false;
  }
});

async function onSubmit() {
  errorMsg.value = "";
  loading.value = true;

  try {
    if (isSignUp.value) {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.value,
        password.value
      );

      console.log("✅ Utente registrato:", userCredential.user.uid);

      await firebaseMessaging.saveUserProfile(
        userCredential.user.uid,
        email.value
      );

      await initializeNewUserKeys(userCredential.user.uid, password.value);
      console.log("✅ Chiavi crittografiche generate");

      await router.push("/dashboard");
    } else {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.value,
        password.value
      );

      console.log("✅ Login effettuato:", userCredential.user.uid);

      const keysUnlocked = await loadAndUnlockKeys(
        userCredential.user.uid,
        password.value
      );

      if (!keysUnlocked) {
        errorMsg.value = "Errore nello sblocco delle chiavi crittografiche.";
        loading.value = false;
        return;
      }

      console.log("✅ Chiavi sbloccate");
      await router.push("/dashboard");
    }
  } catch (error: any) {
    console.error("❌ Errore autenticazione:", error);
    switch (error.code) {
      case "auth/email-already-in-use":
        errorMsg.value = "Questa email è già registrata.";
        break;
      case "auth/invalid-email":
        errorMsg.value = "Email non valida.";
        break;
      case "auth/user-not-found":
        errorMsg.value = "Utente non trovato.";
        break;
      case "auth/wrong-password":
        errorMsg.value = "Password errata.";
        break;
      case "auth/weak-password":
        errorMsg.value = "La password deve avere almeno 6 caratteri.";
        break;
      case "auth/invalid-credential":
        errorMsg.value = "Credenziali non valide.";
        break;
      case "auth/too-many-requests":
        errorMsg.value = "Troppi tentativi. Riprova più tardi.";
        break;
      default:
        errorMsg.value = "Errore durante l'autenticazione. Riprova.";
    }
  } finally {
    loading.value = false;
  }
}

async function signInWithGoogle() {
  errorMsg.value = "";
  loading.value = true;

  try {
    console.log("🔄 Avvio redirect Google...");

    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  } catch (error: any) {
    console.error("❌ Errore Google redirect:", error);
    errorMsg.value = "Errore durante l'autenticazione con Google.";
    loading.value = false;
  }
}
</script>

<template>
  <div
    class="min-h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md">
      <!-- Card principale -->
      <div
        class="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-3xl shadow-2xl p-8"
      >
        <!-- Header con icona -->
        <div class="text-center mb-8">
          <div
            class="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20"
          >
            <svg
              class="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h1
            class="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2"
          >
            {{ isSignUp ? "Crea Account" : "Bentornato" }}
          </h1>
          <p class="text-slate-400 text-sm">
            {{
              isSignUp
                ? "Entra nella community sicura"
                : "Accedi al tuo account"
            }}
          </p>
        </div>

        <!-- Google Sign In (solo web) -->
        <button
          v-if="!isTauri"
          type="button"
          @click="signInWithGoogle"
          :disabled="loading"
          class="w-full mb-6 rounded-xl border border-slate-700/50 bg-white px-4 py-3 font-semibold text-slate-900 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-3 shadow-lg"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continua con Google</span>
        </button>

        <!-- Messaggio Desktop -->
        <div
          v-else
          class="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
        >
          <p class="text-sm text-yellow-400 text-center">
            🖥️ Login Google non disponibile su desktop
          </p>
        </div>

        <!-- Divider -->
        <div v-if="!isTauri" class="relative mb-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-slate-700/50"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-4 bg-slate-900/50 text-slate-400">oppure</span>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="onSubmit" class="space-y-5">
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2"
              >Email</label
            >
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="nome@esempio.it"
              required
              class="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2"
              >Password</label
            >
            <input
              v-model="password"
              type="password"
              :autocomplete="isSignUp ? 'new-password' : 'current-password'"
              placeholder="••••••••"
              required
              class="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <p v-if="isSignUp" class="mt-2 text-xs text-slate-500">
              Minimo 6 caratteri
            </p>
          </div>

          <!-- Error Message -->
          <div
            v-if="errorMsg"
            class="p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
          >
            <p class="text-sm text-red-400">{{ errorMsg }}</p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Caricamento...
            </span>
            <span v-else>
              {{ isSignUp ? "Registrati" : "Accedi" }}
            </span>
          </button>

          <!-- Toggle Sign Up / Login -->
          <button
            type="button"
            @click="
              isSignUp = !isSignUp;
              errorMsg = '';
            "
            class="w-full py-3 bg-slate-800/30 hover:bg-slate-800/50 text-slate-300 font-medium rounded-xl border border-slate-700/30 transition-all"
          >
            {{
              isSignUp
                ? "Hai già un account? Accedi"
                : "Non hai un account? Registrati"
            }}
          </button>

          <!-- Back to Home (solo web) -->
          <button
            v-if="!isTauri"
            type="button"
            @click="router.push('/')"
            class="w-full py-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
          >
            ← Torna alla Home
          </button>
        </form>
      </div>

      <!-- Footer con badge E2EE -->
      <div class="mt-6 text-center">
        <div
          class="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full"
        >
          <svg
            class="w-4 h-4 text-green-400"
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
          <span class="text-sm text-green-400 font-medium"
            >Protetto con crittografia E2EE</span
          >
        </div>
        <p class="mt-3 text-xs text-slate-500">
          I tuoi messaggi sono completamente privati e sicuri
        </p>
      </div>
    </div>
  </div>
</template>
