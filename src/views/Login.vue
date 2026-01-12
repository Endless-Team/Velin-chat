<script setup lang="ts">
import {ref} from "vue";
import {useRouter} from "vue-router";
import {signInWithEmailAndPassword, createUserWithEmailAndPassword} from "firebase/auth";
import {auth} from "../firebase";

const router = useRouter();

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMsg = ref("");
const isSignUp = ref(false); // Toggle tra login e registrazione

async function onSubmit() {
  errorMsg.value = "";
  loading.value = true;

  try {
    if (isSignUp.value) {
      // Registrazione nuovo utente
      await createUserWithEmailAndPassword(auth, email.value, password.value);
    } else {
      // Login utente esistente
      await signInWithEmailAndPassword(auth, email.value, password.value);
    }

    // Redirect alla home dopo login/registrazione
    await router.push("/dashboard");
  } catch (error: any) {
    // Gestione errori Firebase
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
      default:
        errorMsg.value = "Errore durante l'autenticazione. Riprova.";
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="mx-auto grid w-full max-w-md gap-6">
    <div class="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20">
      <div class="space-y-2">
        <h1 class="text-2xl font-semibold tracking-tight">
          {{ isSignUp ? "Registrati" : "Accedi" }}
        </h1>
        <p class="text-sm text-slate-300">
          {{ isSignUp ? "Crea un nuovo account per iniziare." : "Inserisci le credenziali per continuare." }}
        </p>
      </div>

      <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-1">
          <label class="text-sm text-slate-200">Email</label>
          <input
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="nome@dominio.it"
              required
              class="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
          />
        </div>

        <div class="space-y-1">
          <label class="text-sm text-slate-200">Password</label>
          <input
              v-model="password"
              type="password"
              :autocomplete="isSignUp ? 'new-password' : 'current-password'"
              placeholder="••••••••"
              required
              class="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
          />
          <p v-if="isSignUp" class="text-xs text-slate-400">
            Minimo 6 caratteri
          </p>
        </div>

        <p v-if="errorMsg" class="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {{ errorMsg }}
        </p>

        <button
            type="submit"
            :disabled="loading"
            class="w-full rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ loading ? (isSignUp ? "Registrazione..." : "Accesso...") : (isSignUp ? "Registrati" : "Login") }}
        </button>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-white/10"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="bg-slate-950 px-2 text-slate-400">oppure</span>
          </div>
        </div>

        <button
            type="button"
            class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-slate-100 hover:bg-white/10"
            @click="isSignUp = !isSignUp"
        >
          {{ isSignUp ? "Hai già un account? Accedi" : "Non hai un account? Registrati" }}
        </button>

        <button
            type="button"
            class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10"
            @click="router.push('/')"
        >
          Torna alla Home
        </button>
      </form>
    </div>
  </div>
</template>
