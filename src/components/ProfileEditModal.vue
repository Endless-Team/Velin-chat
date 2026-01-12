<script setup lang="ts">
import {ref, computed} from "vue";
import {useAuth} from "../composables/useAuth";
import Modal from "./Modal.vue";

const emit = defineEmits<{
  close: []
}>();

const {user, updateUserProfile} = useAuth();

const displayName = ref("");
const photoURL = ref("");
const error = ref("");
const isLoading = ref(false);

const currentDisplayName = computed(() => {
  return user.value?.displayName || user.value?.email?.split("@")[0] || "";
});

const currentPhotoURL = computed(() => {
  return user.value?.photoURL || "";
});

// Inizializza i valori correnti
displayName.value = currentDisplayName.value;
photoURL.value = currentPhotoURL.value;

const hasChanges = computed(() => {
  return displayName.value !== currentDisplayName.value ||
      photoURL.value !== currentPhotoURL.value;
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

  isLoading.value = true;
  error.value = "";

  try {
    await updateUserProfile({
      displayName: displayName.value.trim(),
      photoURL: photoURL.value.trim() || undefined
    });

    // Aspetta un attimo per assicurarsi che l'aggiornamento sia completo
    await new Promise(resolve => setTimeout(resolve, 500));

    emit("close");
  } catch (err: any) {
    console.error("Errore aggiornamento profilo:", err);
    error.value = err.message || "Errore durante l'aggiornamento del profilo";
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
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-white/10 p-6">
      <h2 class="text-xl font-semibold text-slate-100">Modifica Profilo</h2>
      <button
          @click="handleCancel"
          class="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-slate-200"
          title="Chiudi"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Body -->
    <div class="p-6 space-y-6">
      <!-- Avatar Preview -->
      <div class="flex justify-center">
        <div
            class="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600 text-3xl font-semibold text-white"
        >
          {{ displayName.charAt(0).toUpperCase() || "?" }}
        </div>
      </div>

      <!-- Display Name -->
      <div>
        <label class="block text-sm font-medium text-slate-300 mb-2">
          Nome visualizzato
        </label>
        <input
            v-model="displayName"
            type="text"
            class="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
            placeholder="Il tuo nome"
            maxlength="50"
        />
      </div>

      <!-- Photo URL (optional) -->
      <div>
        <label class="block text-sm font-medium text-slate-300 mb-2">
          URL Foto Profilo (opzionale)
        </label>
        <input
            v-model="photoURL"
            type="url"
            class="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
            placeholder="https://esempio.com/foto.jpg"
        />
      </div>

      <!-- Error Message -->
      <div
          v-if="error"
          class="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400"
      >
        {{ error }}
      </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-end gap-3 border-t border-white/10 p-6">
      <button
          @click="handleCancel"
          :disabled="isLoading"
          class="rounded-xl px-6 py-2.5 text-slate-300 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Annulla
      </button>
      <button
          @click="handleSave"
          :disabled="isLoading || !hasChanges"
          class="rounded-xl bg-indigo-600 px-6 py-2.5 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <svg
            v-if="isLoading"
            class="animate-spin h-4 w-4"
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
        {{ isLoading ? "Salvataggio..." : "Salva Modifiche" }}
      </button>
    </div>
  </Modal>
</template>
