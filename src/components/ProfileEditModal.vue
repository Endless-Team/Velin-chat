<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAuth } from "../composables/useAuth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import Modal from "./Modal.vue";

const emit = defineEmits<{
  close: [];
}>();

const { user, updateUserProfile } = useAuth();

const displayName = ref("");
const photoURL = ref("");
const error = ref("");
const isLoading = ref(false);
const showSuccess = ref(false);

onMounted(async () => {
  displayName.value = currentDisplayName.value;
  photoURL.value = currentPhotoURL.value;
});

const currentDisplayName = computed(() => {
  return user.value?.displayName || user.value?.email?.split("@")[0] || "";
});

const currentPhotoURL = computed(() => {
  return user.value?.photoURL || "";
});

const hasChanges = computed(() => {
  return (
    displayName.value !== currentDisplayName.value ||
    photoURL.value !== currentPhotoURL.value
  );
});

// Gradient color basato sul nome
const avatarGradient = computed(() => {
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

  const hash = displayName.value.split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  return gradients[hash % gradients.length];
});

async function handleSave() {
  if (!displayName.value.trim()) {
    error.value = "Il nome non può essere vuoto";
    return;
  }

  if (displayName.value.trim().length < 2) {
    error.value = "Il nome deve contenere almeno 2 caratteri";
    return;
  }

  if (!user.value) {
    error.value = "Utente non autenticato";
    return;
  }

  isLoading.value = true;
  error.value = "";

  try {
    const updates = {
      displayName: displayName.value.trim(),
      photoURL: photoURL.value.trim() || undefined,
    };

    // Aggiorna il profilo Firebase Auth
    await updateUserProfile(updates);

    // Salva anche nel database Firestore
    const userDocRef = doc(db, "users", user.value.uid);
    await setDoc(
      userDocRef,
      {
        uid: user.value.uid,
        email: user.value.email,
        displayName: updates.displayName,
        photoURL: updates.photoURL || null,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    console.log("✅ Profilo aggiornato su Auth e Firestore");

    // Mostra messaggio di successo
    showSuccess.value = true;

    // Aspetta e chiudi
    await new Promise((resolve) => setTimeout(resolve, 1000));
    emit("close");
  } catch (err: any) {
    console.error("❌ Errore aggiornamento profilo:", err);

    if (err.code === "permission-denied") {
      error.value = "Permessi insufficienti. Verifica le regole Firestore.";
    } else {
      error.value = err.message || "Errore durante l'aggiornamento del profilo";
    }
  } finally {
    isLoading.value = false;
  }
}

function handleCancel() {
  emit("close");
}
</script>

<template>
  <Modal @close="handleCancel">
    <div
      class="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full"
    >
      <!-- Header con Gradient -->
      <div
        class="relative flex items-center justify-between border-b border-white/5 p-6 bg-gradient-to-r from-indigo-600/10 to-purple-600/10"
      >
        <div>
          <h2 class="text-2xl font-black text-slate-100">Modifica Profilo</h2>
          <p class="text-sm text-slate-400 mt-1">Personalizza il tuo account</p>
        </div>
        <button
          @click="handleCancel"
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

      <!-- Body -->
      <div class="p-6 space-y-6">
        <!-- Avatar Preview Migliorato -->
        <div class="flex flex-col items-center space-y-4">
          <div class="relative group">
            <!-- Avatar -->
            <div
              class="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br text-4xl font-black text-white shadow-2xl ring-4 ring-white/10 transition-all group-hover:ring-8 group-hover:ring-white/20"
              :class="avatarGradient"
            >
              {{ displayName.charAt(0).toUpperCase() || "?" }}
            </div>

            <!-- Edit Icon Overlay -->
            <div
              class="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/0 group-hover:bg-black/40 transition-all"
            >
              <svg
                class="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </div>

            <!-- Status Indicator -->
            <span class="absolute -bottom-1 -right-1 flex h-6 w-6">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
              ></span>
              <span
                class="relative inline-flex rounded-full h-6 w-6 bg-green-500 ring-4 ring-slate-900"
              ></span>
            </span>
          </div>

          <div class="text-center">
            <p class="text-sm font-medium text-slate-300">
              {{ currentDisplayName }}
            </p>
            <p class="text-xs text-slate-500">
              {{ user?.email }}
            </p>
          </div>
        </div>

        <!-- Display Name -->
        <div class="space-y-2">
          <label
            class="flex items-center gap-2 text-sm font-bold text-slate-300"
          >
            <svg
              class="h-4 w-4 text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Nome visualizzato
          </label>
          <input
            v-model="displayName"
            type="text"
            class="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3.5 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition-all"
            placeholder="Il tuo nome"
            maxlength="50"
          />
          <p class="text-xs text-slate-500 flex items-center gap-1">
            <svg
              class="h-3 w-3"
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
            Visibile agli altri utenti
          </p>
        </div>

        <!-- Photo URL (optional) -->
        <div class="space-y-2">
          <label
            class="flex items-center gap-2 text-sm font-bold text-slate-300"
          >
            <svg
              class="h-4 w-4 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            URL Foto Profilo
            <span class="text-xs text-slate-500 font-normal">(opzionale)</span>
          </label>
          <input
            v-model="photoURL"
            type="url"
            class="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3.5 text-slate-100 placeholder:text-slate-500 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all"
            placeholder="https://esempio.com/foto.jpg"
          />
        </div>

        <!-- Success Message -->
        <div
          v-if="showSuccess"
          class="rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 p-4 flex items-center gap-3 animate-fadeIn"
        >
          <svg
            class="h-5 w-5 text-green-400 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p class="text-sm font-bold text-green-300">Profilo aggiornato!</p>
            <p class="text-xs text-green-400/80">
              Le modifiche sono state salvate con successo
            </p>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="error"
          class="rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 p-4 flex items-start gap-3 animate-shake"
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
          <div>
            <p class="text-sm font-bold text-red-300">Errore</p>
            <p class="text-xs text-red-400/80">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Footer con Gradienti -->
      <div
        class="flex items-center justify-end gap-3 border-t border-white/5 p-6 bg-slate-900/50"
      >
        <button
          @click="handleCancel"
          :disabled="isLoading"
          class="rounded-xl px-6 py-3 text-slate-300 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
        >
          Annulla
        </button>
        <button
          @click="handleSave"
          :disabled="isLoading || !hasChanges"
          class="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-white hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5 font-bold shadow-lg hover:shadow-indigo-500/50 transition-all hover:scale-105 active:scale-95"
        >
          <!-- Loading Spinner -->
          <svg
            v-if="isLoading"
            class="animate-spin h-5 w-5"
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

          <!-- Success Check -->
          <svg
            v-else-if="showSuccess"
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>

          <!-- Save Icon -->
          <svg
            v-else
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>

          <span>
            {{
              isLoading
                ? "Salvataggio..."
                : showSuccess
                  ? "Salvato!"
                  : "Salva Modifiche"
            }}
          </span>

          <!-- Shine Effect -->
          <div
            v-if="!isLoading && !showSuccess"
            class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700"
          ></div>
        </button>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
@keyframes fadeIn {
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
  animation: fadeIn 0.3s ease-out;
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}
</style>
