<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
// import { useAuth } from "../composables/useAuth";
import { useRoute } from "vue-router";
import { useEncryptedChat } from "../composables/useEncryptedChat";
import { keyStore } from "../stores/keyStore";
import MessageBubble from "../components/MessageBubble.vue";
import UnlockKeysModal from "../components/UnlockKeysModal.vue";

const route = useRoute();
// const { user } = useAuth();

const {
  chats,
  selectedChat,
  currentMessages,
  sendEncryptedMessage,
  selectChat,
  loadUserChats,
} = useEncryptedChat();

const chatName = computed(() => selectedChat.value?.name || "Chat");
const chatAvatar = computed(
  () => selectedChat.value?.avatar || chatName.value.charAt(0).toUpperCase(),
);

const message = ref("");
const showUnlockModal = ref(false);
const sendError = ref("");
const isSending = ref(false);
const isLoading = ref(true);
const isKeysUnlocked = computed(() => keyStore.getIsUnlocked());

onMounted(async () => {
  console.log("🚀 Chat Component mounted");

  const chatId = route.params.chatId as string;
  console.log("📌 chatId dalla route:", chatId);

  if (!chatId) {
    console.error("❌ Nessun chatId nella route!");
    sendError.value = "Chat non trovata";
    isLoading.value = false;
    return;
  }

  try {
    if (chats.value.length === 0) {
      console.log("📦 Caricamento chat da Firebase...");
      await loadUserChats();
      console.log("✅ Chat caricate:", chats.value.length);
    }

    console.log("⏳ Selezione chat con ID:", chatId);
    await selectChat(chatId);

    console.log("✅ Chat selezionata:", selectedChat.value);
  } catch (error) {
    console.error("❌ Errore nel caricamento della chat:", error);
    sendError.value = "Impossibile caricare la chat";
  } finally {
    isLoading.value = false;
  }

  if (!isKeysUnlocked.value) {
    showUnlockModal.value = true;
  }
});

async function sendMessage() {
  if (!message.value.trim() || !selectedChat.value || isSending.value) {
    return;
  }

  if (!isKeysUnlocked.value) {
    showUnlockModal.value = true;
    return;
  }

  if (selectedChat.value.isGroup) {
    sendError.value = "Le chat di gruppo sono in sviluppo";
    setTimeout(() => (sendError.value = ""), 3000);
    return;
  }

  sendError.value = "";
  isSending.value = true;
  const messageText = message.value;
  message.value = "";

  try {
    console.log("🚀 Invio messaggio crittografato...");
    await sendEncryptedMessage(selectedChat.value.id, messageText);
    console.log("✅ Messaggio inviato con successo!");
  } catch (error: any) {
    console.error("❌ Errore nell'invio:", error);

    if (error.message.includes("Chiave pubblica")) {
      sendError.value = "Impossibile cifrare: chiavi del destinatario mancanti";
    } else if (error.message.includes("Destinatario")) {
      sendError.value = "Errore: partecipante non trovato";
    } else if (error.message.includes("Chat non trovata")) {
      sendError.value = "Errore: chat non valida";
    } else {
      sendError.value = error.message || "Errore nell'invio del messaggio";
    }

    message.value = messageText;
    setTimeout(() => (sendError.value = ""), 5000);
  } finally {
    isSending.value = false;
  }
}

function handleKeysUnlocked() {
  showUnlockModal.value = false;
}
</script>

<template>
  <!-- ✅ RIMOSSO il wrapper div esterno -->
  <!-- Loading state -->
  <div v-if="isLoading" class="flex flex-1 items-center justify-center">
    <div class="text-center space-y-3">
      <svg
        class="h-10 w-10 animate-spin text-indigo-400 mx-auto"
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
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p class="text-slate-400 text-sm">Caricamento chat...</p>
    </div>
  </div>

  <!-- Chat content -->
  <div v-else class="flex flex-1 flex-col min-w-0">
    <!-- Header Chat -->
    <header
      class="flex items-center justify-between border-b border-white/10 p-3"
    >
      <span class="flex items-center gap-3 min-w-0">
        <!-- ✅ RIMOSSO il bottone "Torna indietro" -->

        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold text-white"
          :class="selectedChat?.isGroup ? 'bg-purple-600' : 'bg-indigo-600'"
        >
          {{ chatAvatar }}
        </span>
        <span class="min-w-0">
          <span class="font-semibold text-slate-100 truncate block">{{
            chatName
          }}</span>
          <span class="flex items-center gap-1.5 text-xs text-green-400">
            <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"
              />
            </svg>
            <span>Crittografia E2E</span>
          </span>
        </span>
      </span>

      <span class="flex items-center gap-1 shrink-0">
        <button
          class="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-slate-200"
          title="Chiamata vocale"
        >
          <svg
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </button>
        <button
          class="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-slate-200"
          title="Videochiamata"
        >
          <svg
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
        <button
          class="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-slate-200"
          title="Informazioni"
        >
          <svg
            class="h-5 w-5"
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
        </button>
      </span>
    </header>

    <!-- Area Messaggi -->
    <div class="flex-1 space-y-4 overflow-y-auto p-6">
      <MessageBubble
        v-for="msg in currentMessages"
        :key="msg.id"
        :message="msg"
      />
    </div>

    <!-- Input Messaggio -->
    <footer class="border-t border-white/10 p-4">
      <!-- Error Toast -->
      <div
        v-if="sendError"
        class="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400"
      >
        {{ sendError }}
      </div>

      <form @submit.prevent="sendMessage" class="flex items-center gap-3">
        <button
          type="button"
          class="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-slate-200 shrink-0"
          title="Allega file"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        </button>

        <input
          v-model="message"
          type="text"
          placeholder="Scrivi un messaggio..."
          class="flex-1 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
          :disabled="!isKeysUnlocked || isSending"
        />

        <button
          type="submit"
          :disabled="!message.trim() || !isKeysUnlocked || isSending"
          class="rounded-xl bg-indigo-600 p-3 text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
          title="Invia"
        >
          <svg
            v-if="!isSending"
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
          <svg
            v-else
            class="h-6 w-6 animate-spin"
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
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </button>
      </form>
    </footer>

    <!-- Modals -->
    <UnlockKeysModal
      v-if="showUnlockModal"
      @unlocked="handleKeysUnlocked"
      @close="showUnlockModal = false"
    />
  </div>
</template>
