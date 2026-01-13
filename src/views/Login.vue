<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
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

async function onSubmit() {
  errorMsg.value = "";
  loading.value = true;

  try {
    if (isSignUp.value) {
      // REGISTRAZIONE
      const userCredential = await createUserWithEmailAndPassword(
          auth,
          email.value,
          password.value
      );

      console.log('✅ Utente registrato:', userCredential.user.uid);

      // Salva profilo utente in Firebase
      try {
        await firebaseMessaging.saveUserProfile(
            userCredential.user.uid,
            email.value
        );
        console.log('✅ Profilo salvato');
      } catch (profileError) {
        console.error('Errore nel salvataggio del profilo:', profileError);
      }

      // Genera le chiavi di crittografia per il nuovo utente
      try {
        await initializeNewUserKeys(userCredential.user.uid, password.value);
        console.log('✅ Chiavi crittografiche generate');
      } catch (keyError) {
        console.error('Errore nella generazione delle chiavi:', keyError);
        errorMsg.value = "Errore nella generazione delle chiavi crittografiche.";
        loading.value = false;
        return;
      }

      await router.push("/dashboard");
    } else {
      // LOGIN
      const userCredential = await signInWithEmailAndPassword(
          auth,
          email.value,
          password.value
      );

      console.log('✅ Login effettuato:', userCredential.user.uid);

      // Carica e sblocca le chiavi di crittografia
      try {
        const keysUnlocked = await loadAndUnlockKeys(
            userCredential.user.uid,
            password.value
        );

        if (!keysUnlocked) {
          errorMsg.value = "Errore nello sblocco delle chiavi crittografiche. Verifica la password.";
          loading.value = false;
          return;
        }

        console.log('✅ Chiavi sbloccate');
      } catch (keyError) {
        console.error('Errore nel caricamento delle chiavi:', keyError);
        errorMsg.value = "Errore nel caricamento delle chiavi crittografiche.";
        loading.value = false;
        return;
      }

      await router.push("/dashboard");
    }
  } catch (error: any) {
    console.error('❌ Errore autenticazione:', error);
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
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const userId = userCredential.user.uid;

    console.log('✅ Login Google:', userId);

    // Verifica se è un nuovo utente
    const isNewUser = userCredential.user.metadata.creationTime === userCredential.user.metadata.lastSignInTime;

    // Password temporanea per Google (in produzione, chiedi una password separata)
    const tempPassword = `google_${userId}_temp`;

    if (isNewUser) {
      // Nuovo utente - salva profilo
      try {
        await firebaseMessaging.saveUserProfile(
            userId,
            userCredential.user.email || '',
            userCredential.user.displayName || undefined
        );
        console.log('✅ Profilo Google salvato');
      } catch (profileError) {
        console.error('Errore nel salvataggio profilo:', profileError);
      }

      // Genera chiavi
      try {
        await initializeNewUserKeys(userId, tempPassword);
        console.log('✅ Chiavi generate per utente Google');
      } catch (keyError) {
        console.error('Errore generazione chiavi:', keyError);
      }
    } else {
      // Utente esistente - carica chiavi
      try {
        await loadAndUnlockKeys(userId, tempPassword);
        console.log('✅ Chiavi caricate per utente Google');
      } catch (keyError) {
        console.error('Errore caricamento chiavi:', keyError);
      }
    }

    await router.push("/dashboard");
  } catch (error: any) {
    console.error('❌ Errore Google Sign-In:', error);
    switch (error.code) {
      case "auth/popup-closed-by-user":
        errorMsg.value = "Popup chiuso. Riprova.";
        break;
      case "auth/cancelled-popup-request":
        errorMsg.value = "Richiesta annullata.";
        break;
      case "auth/account-exists-with-different-credential":
        errorMsg.value = "Account già esistente con credenziali diverse.";
        break;
      default:
        errorMsg.value = "Errore durante l'autenticazione con Google.";
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen w-screen items-center justify-center bg-slate-950 text-slate-100 p-6">
    <div class="w-full max-w-md">
      <div class="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/20">
        <!-- Header -->
        <div class="space-y-2 text-center">
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20">
            <svg class="h-8 w-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h1 class="text-3xl font-bold tracking-tight">
            {{ isSignUp ? "Registrati" : "Bentornato" }}
          </h1>
          <p class="text-sm text-slate-400">
            {{ isSignUp ? "Crea un nuovo account per iniziare." : "Inserisci le credenziali per continuare." }}
          </p>
        </div>

        <!-- E2EE Info Badge -->
        <div class="mt-6 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-2 text-center">
          <div class="flex items-center justify-center gap-2 text-sm text-green-400">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>Protetto con crittografia end-to-end</span>
          </div>
        </div>

        <!-- Google Sign In Button -->
        <button
            type="button"
            @click="signInWithGoogle"
            :disabled="loading"
            class="mt-6 w-full rounded-xl border border-white/10 bg-white px-4 py-3 font-semibold text-slate-900 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-3"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Continua con Google</span>
        </button>

        <!-- Divider -->
        <div class="relative my-6 flex items-center gap-4">
          <div class="flex-1 border-t border-white/10"></div>
          <span class="text-sm text-slate-400">oppure</span>
          <div class="flex-1 border-t border-white/10"></div>
        </div>

        <!-- Form -->
        <form class="space-y-5" @submit.prevent="onSubmit">
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-200">Email</label>
            <input
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="nome@dominio.it"
                required
                class="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-200">Password</label>
            <input
                v-model="password"
                type="password"
                :autocomplete="isSignUp ? 'new-password' : 'current-password'"
                placeholder="••••••••"
                required
                class="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
            />
            <p v-if="isSignUp" class="text-xs text-slate-400">
              Minimo 6 caratteri. Questa password proteggerà anche i tuoi messaggi.
            </p>
          </div>

          <!-- Error Message -->
          <div
              v-if="errorMsg"
              class="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            <div class="flex items-center gap-2">
              <svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{{ errorMsg }}</span>
            </div>
          </div>

          <!-- Submit Button -->
          <button
              type="submit"
              :disabled="loading"
              class="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <svg class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ isSignUp ? "Registrazione..." : "Accesso..." }}
            </span>
            <span v-else>
              {{ isSignUp ? "Registrati" : "Accedi" }}
            </span>
          </button>

          <!-- Divider -->
          <div class="relative my-6 flex items-center gap-4">
            <div class="flex-1 border-t border-white/10"></div>
            <span class="text-sm text-slate-400">oppure</span>
            <div class="flex-1 border-t border-white/10"></div>
          </div>

          <!-- Toggle Sign Up / Login -->
          <button
              type="button"
              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-slate-100 transition-colors hover:bg-white/10"
              @click="isSignUp = !isSignUp; errorMsg = ''"
          >
            {{ isSignUp ? "Hai già un account? Accedi" : "Non hai un account? Registrati" }}
          </button>

          <!-- Back to Home -->
          <button
              type="button"
              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10"
              @click="router.push('/')"
          >
            ← Torna alla Home
          </button>
        </form>
      </div>

      <!-- Footer Text -->
      <p class="mt-6 text-center text-xs text-slate-500">
        Effettuando l'accesso accetti i nostri termini di servizio e la privacy policy.
        <br>
        I tuoi messaggi sono protetti con crittografia end-to-end.
      </p>
    </div>
  </div>
</template>
