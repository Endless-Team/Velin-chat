<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import {useAuth} from '../composables/useAuth';
import {useRouter} from 'vue-router';
import {useEncryptedChat} from '../composables/useEncryptedChat';
import {keyStore} from '../stores/keyStore';
import ChatListItem from '../components/ChatListItem.vue';
import MessageBubble from '../components/MessageBubble.vue';
import ProfileEditModal from '../components/ProfileEditModal.vue';
import UnlockKeysModal from '../components/UnlockKeysModal.vue';

const router = useRouter();
const {user, logout} = useAuth();
const {
  chats,
  selectedChat,
  currentMessages,
  selectedChatId,
  sendEncryptedMessage,
  selectChat,
  loadUserChats
} = useEncryptedChat();

// State
const message = ref('');
const searchQuery = ref('');
const showProfileModal = ref(false);
const showUnlockModal = ref(false);
const sendError = ref('');
const isKeysUnlocked = computed(() => keyStore.getIsUnlocked());

const displayName = computed(() => {
  return user.value?.displayName || user.value?.email?.split('@')[0] || 'User';
});

const filteredChats = computed(() => {
  if (!searchQuery.value) return chats.value;
  return chats.value.filter((chat) =>
      chat.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

onMounted(async () => {
  // Carica chat reali da Firebase
  await loadUserChats();

  if (!isKeysUnlocked.value) {
    showUnlockModal.value = true;
  }
});

async function handleSelectChat(chatId: string) {
  if (!isKeysUnlocked.value) {
    showUnlockModal.value = true;
    return;
  }
  await selectChat(chatId);
}

async function sendMessage() {
  if (!message.value.trim() || !selectedChat.value) return;

  if (!isKeysUnlocked.value) {
    showUnlockModal.value = true;
    return;
  }

  sendError.value = '';

  try {
    console.log('🚀 Tentativo invio messaggio...');

    // Per chat di gruppo
    if (selectedChat.value.isGroup) {
      console.warn('⚠️ Invio messaggi di gruppo in sviluppo');
      sendError.value = 'Le chat di gruppo sono in sviluppo';
      setTimeout(() => sendError.value = '', 3000);
      return;
    }

    // Chat 1-1
    const recipientId = selectedChat.value.participants?.[0];
    if (!recipientId) {
      console.error('❌ Nessun partecipante trovato');
      sendError.value = 'Errore: partecipante non trovato';
      setTimeout(() => sendError.value = '', 3000);
      return;
    }

    const recipientPublicKey = selectedChat.value.publicKeys?.[recipientId];
    if (!recipientPublicKey) {
      console.error('❌ Chiave pubblica non trovata');
      sendError.value = 'Errore: chiave pubblica non trovata';
      setTimeout(() => sendError.value = '', 3000);
      return;
    }

    console.log('✅ Invio messaggio a:', selectedChat.value.name);

    await sendEncryptedMessage(
        selectedChat.value.id,
        message.value
    );

    message.value = '';
    console.log('✅ Messaggio inviato con successo!');

  } catch (error: any) {
    console.error('❌ Errore nell\'invio:', error);
    sendError.value = error.message || 'Errore nell\'invio del messaggio';
    setTimeout(() => sendError.value = '', 3000);
  }
}

async function handleLogout() {
  keyStore.lockKeys();
  await logout();
  await router.push('/login');
}

function openProfileModal() {
  showProfileModal.value = true;
}

function closeProfileModal() {
  showProfileModal.value = false;
}

function handleKeysUnlocked() {
  showUnlockModal.value = false;
}
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-slate-950">
    <!-- Sidebar Sinistra - Lista Chat -->
    <aside class="flex flex-col border-r border-white/10 bg-slate-900/50 w-80 min-w-70 max-w-md">
      <!-- User Header -->
      <div class="flex items-center justify-between border-b border-white/10 p-3">
        <button
            @click="openProfileModal"
            class="flex items-center gap-2 min-w-0 hover:bg-white/5 rounded-lg p-1 -ml-1 transition-colors"
        >
          <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white text-sm"
          >
            {{ displayName.charAt(0).toUpperCase() }}
          </span>
          <span class="text-sm font-semibold text-slate-100 truncate">
            {{ displayName }}
          </span>
          <svg class="h-4 w-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>

        <button
            @click="handleLogout"
            class="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-slate-200 shrink-0"
            title="Logout"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>

      <!-- E2EE Status Badge -->
      <div class="border-b border-white/10 px-3 py-2">
        <span
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
            :class="isKeysUnlocked ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'"
        >
          <svg class="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                v-if="isKeysUnlocked"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
            <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span class="font-medium">
            {{ isKeysUnlocked ? 'Crittografia Attiva' : 'Crittografia Bloccata' }}
          </span>
        </span>
      </div>

      <!-- Search Bar -->
      <div class="border-b border-white/10 p-3">
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
              type="text"
              placeholder="Cerca chat..."
              class="w-full rounded-xl border border-white/10 bg-slate-950/40 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
          />
        </div>
      </div>

      <!-- Lista Chat -->
      <div class="flex-1 overflow-y-auto">
        <ChatListItem
            v-for="chat in filteredChats"
            :key="chat.id"
            :chat="chat"
            :is-selected="selectedChatId === chat.id"
            @select="handleSelectChat"
        />
      </div>
    </aside>

    <!-- Area Messaggi Principale -->
    <main class="flex flex-1 flex-col min-w-0">
      <!-- Empty State -->
      <div
          v-if="!selectedChat"
          class="flex h-full flex-col items-center justify-center space-y-4 text-center px-4"
      >
        <span class="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/20">
          <svg class="h-10 w-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </span>
        <span>
          <span class="text-xl font-semibold text-slate-200 block">Seleziona una chat</span>
          <span class="mt-2 text-sm text-slate-400 block">
            Scegli una conversazione dalla lista per iniziare a chattare
          </span>
          <span
              class="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400">
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Protetto con crittografia end-to-end
          </span>
        </span>
      </div>

      <!-- Chat Attiva -->
      <template v-else>
        <!-- Header Chat -->
        <header class="flex items-center justify-between border-b border-white/10 p-3">
          <span class="flex items-center gap-3 min-w-0">
            <span
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold text-white"
                :class="selectedChat.isGroup ? 'bg-purple-600' : 'bg-indigo-600'"
            >
              {{ selectedChat.avatar }}
            </span>
            <span class="min-w-0">
              <span class="font-semibold text-slate-100 truncate block">{{ selectedChat.name }}</span>
              <span class="flex items-center gap-1.5 text-xs text-green-400">
                <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                  <path
                      d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
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
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                :disabled="!isKeysUnlocked"
            />

            <button
                type="submit"
                :disabled="!message.trim() || !isKeysUnlocked"
                class="rounded-xl bg-indigo-600 p-3 text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                title="Invia"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </form>
        </footer>
      </template>
    </main>

    <!-- Modals -->
    <ProfileEditModal v-if="showProfileModal" @close="closeProfileModal"/>
    <UnlockKeysModal
        v-if="showUnlockModal"
        @unlocked="handleKeysUnlocked"
        @close="showUnlockModal = false"
    />
  </div>
</template>
