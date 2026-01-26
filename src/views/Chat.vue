<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import { useEncryptedChat } from "../composables/useEncryptedChat";
import { keyStore } from "../stores/keyStore";
import MessageBubble from "../components/MessageBubble.vue";
import UnlockKeysModal from "../components/UnlockKeysModal.vue";

const route = useRoute();

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

const messagesContainer = ref<HTMLElement | null>(null);

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

watch(
  currentMessages,
  () => {
    scrollToBottom();
  },
  { deep: true },
);

onMounted(async () => {
  const chatId = route.params.chatId as string;

  if (!chatId) {
    sendError.value = "Chat non trovata";
    isLoading.value = false;
    return;
  }

  try {
    if (chats.value.length === 0) {
      await loadUserChats();
    }

    await selectChat(chatId);
    scrollToBottom();
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
    await sendEncryptedMessage(selectedChat.value.id, messageText);
    scrollToBottom();
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
  <!-- Loading State -->
  <div
    v-if="isLoading"
    class="flex flex-1 items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900"
  >
    <div class="text-center space-y-4">
      <div class="relative">
        <div
          class="absolute inset-0 bg-indigo-500/20 blur-2xl animate-pulse"
        ></div>
        <svg
          class="relative h-12 w-12 animate-spin text-indigo-400 mx-auto"
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
      </div>
      <div class="space-y-1">
        <p class="text-slate-200 font-semibold">Caricamento chat...</p>
        <p class="text-slate-500 text-sm">Decifratura messaggi in corso</p>
      </div>
    </div>
  </div>

  <!-- Chat Content -->
  <div v-else class="flex flex-col h-full min-w-0 bg-slate-950 relative">
    <!-- Header Chat -->
    <header
      class="shrink-0 flex items-center justify-between border-b border-white/5 p-3 bg-slate-900/50 backdrop-blur-xl shadow-lg z-10"
    >
      <div class="flex items-center gap-2 min-w-0">
        <span
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-white text-sm shadow-lg ring-2 ring-white/10"
          :class="
            selectedChat?.isGroup
              ? 'bg-gradient-to-br from-purple-500 to-pink-600'
              : 'bg-gradient-to-br from-indigo-500 to-purple-600'
          "
        >
          {{ chatAvatar }}
        </span>
        <div class="min-w-0">
          <h2 class="font-bold text-slate-100 truncate text-sm">
            {{ chatName }}
          </h2>
          <div class="flex items-center gap-1 text-xs">
            <span class="relative flex h-2 w-2">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
              ></span>
              <span
                class="relative inline-flex rounded-full h-2 w-2 bg-green-500"
              ></span>
            </span>
            <span class="text-green-400 font-medium">Online</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-0.5 shrink-0">
        <button
          class="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-indigo-400 transition-all"
          title="Chiamata vocale"
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
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </button>
        <button
          class="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-purple-400 transition-all"
          title="Videochiamata"
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
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
        <button
          class="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all"
          title="Informazioni"
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>
    </header>

    <!-- Area Messaggi con padding bottom ridotto -->
    <div
      ref="messagesContainer"
      class="flex-1 min-h-0 space-y-2 overflow-y-auto p-6 pb-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
      style="
        background-image: radial-gradient(
          rgba(148, 163, 184, 0.05) 1px,
          transparent 1px
        );
        background-size: 20px 20px;
      "
    >
      <MessageBubble
        v-for="msg in currentMessages"
        :key="msg.id"
        :message="msg"
      />

      <!-- Empty State -->
      <div
        v-if="currentMessages.length === 0"
        class="flex items-center justify-center h-full"
      >
        <div class="text-center space-y-3">
          <div
            class="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 mx-auto"
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p class="text-slate-400 text-sm">Nessun messaggio ancora</p>
          <p class="text-slate-600 text-xs">
            Invia il primo messaggio per iniziare
          </p>
        </div>
      </div>
    </div>

    <!-- ✨ ISLAND - Input Messaggio (Spazio ridotto) -->
    <div class="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
      <div class="max-w-4xl mx-auto">
        <!-- Error Toast -->
        <div
          v-if="sendError"
          class="mb-2 rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-xl px-3 py-2 text-xs text-red-300 shadow-2xl flex items-start gap-2 pointer-events-auto animate-shake"
        >
          <svg
            class="h-4 w-4 text-red-400 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{{ sendError }}</span>
        </div>

        <!-- Input Island -->
        <form
          @submit.prevent="sendMessage"
          class="rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 pointer-events-auto transition-all hover:shadow-indigo-500/20"
        >
          <div class="flex items-center gap-2 p-2">
            <!-- Bottoni Sinistra -->
            <div class="flex items-center gap-0.5">
              <button
                type="button"
                class="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-indigo-400 transition-all"
                title="Emoji"
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
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>

              <button
                type="button"
                class="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-purple-400 transition-all"
                title="Allega file"
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
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
              </button>
            </div>

            <!-- Input Testo -->
            <div class="flex-1 relative">
              <textarea
                v-model="message"
                placeholder="Scrivi un messaggio..."
                rows="1"
                class="w-full max-h-24 rounded-xl border-0 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 resize-none scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
                :disabled="!isKeysUnlocked || isSending"
                @keydown.enter.exact.prevent="sendMessage"
                @input="
                  (e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height =
                      Math.min(target.scrollHeight, 96) + 'px';
                  }
                "
              />
            </div>

            <!-- Bottone Invio -->
            <button
              type="submit"
              :disabled="!message.trim() || !isKeysUnlocked || isSending"
              class="rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 text-white hover:from-indigo-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-50 shrink-0 shadow-lg hover:shadow-indigo-500/50 transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
              title="Invia"
            >
              <svg
                v-if="!isSending"
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="2.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              <svg
                v-else
                class="h-5 w-5 animate-spin"
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
          </div>
        </form>
      </div>
    </div>

    <!-- Modals -->
    <UnlockKeysModal
      v-if="showUnlockModal"
      @unlocked="handleKeysUnlocked"
      @close="showUnlockModal = false"
    />
  </div>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
  height: 6px;
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

.animate-shake {
  animation: shake 0.5s ease-in-out;
}
</style>
