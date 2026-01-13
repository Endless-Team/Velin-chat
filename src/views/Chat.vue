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
import type {Chat} from '../types/chat.types';

const router = useRouter();
const {user, logout} = useAuth();
const {
  chats,
  selectedChat,
  currentMessages,
  selectedChatId,
  sendEncryptedMessage,
  selectChat
} = useEncryptedChat();

// State
const message = ref('');
const searchQuery = ref('');
const showProfileModal = ref(false);
const showUnlockModal = ref(false);
const isKeysUnlocked = computed(() => keyStore.getIsUnlocked());

const displayName = computed(() => {
  return user.value?.displayName || user.value?.email?.split('@')[0] || 'User';
});

// Mock data per le chat (in produzione verranno dal backend)
const mockChats: Chat[] = [
  {
    id: '1',
    name: 'Marco Rossi',
    avatar: 'MR',
    lastMessage: 'Ci vediamo domani!',
    timestamp: '10:30',
    unread: 2,
    online: true,
    participants: ['user-marco-id'],
    publicKeys: {
      'user-marco-id': '{"kty":"RSA","e":"AQAB","n":"..."}' // Mock
    }
  },
  {
    id: '2',
    name: 'Team Design',
    avatar: 'TD',
    lastMessage: 'Ho caricato i nuovi mockup',
    timestamp: '09:15',
    unread: 0,
    online: false,
    isGroup: true,
    participants: ['user-1', 'user-2', 'user-3']
  },
  {
    id: '3',
    name: 'Laura Bianchi',
    avatar: 'LB',
    lastMessage: 'Perfetto, grazie!',
    timestamp: 'Ieri',
    unread: 0,
    online: false,
    participants: ['user-laura-id'],
    publicKeys: {
      'user-laura-id': '{"kty":"RSA","e":"AQAB","n":"..."}' // Mock
    }
  },
  {
    id: '4',
    name: 'Famiglia',
    avatar: 'FA',
    lastMessage: 'Mamma: A che ora arrivi?',
    timestamp: 'Ieri',
    unread: 5,
    online: false,
    isGroup: true,
    participants: ['user-mamma', 'user-papa', 'user-brother']
  }
];

const filteredChats = computed(() => {
  if (!searchQuery.value) return chats.value;
  return chats.value.filter((chat) =>
      chat.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

onMounted(() => {
  // Carica le chat mock direttamente nello stato
  chats.value = mockChats;

  // Verifica se le chiavi sono sbloccate
  if (!isKeysUnlocked.value) {
    showUnlockModal.value = true;
  }
});

function handleSelectChat(chatId: string) {
  if (!isKeysUnlocked.value) {
    showUnlockModal.value = true;
    return;
  }
  selectChat(chatId);
}

async function sendMessage() {
  if (!message.value.trim() || !selectedChat.value) return;

  if (!isKeysUnlocked.value) {
    showUnlockModal.value = true;
    return;
  }

  try {
    // Per chat di gruppo, serve logica diversa
    if (selectedChat.value.isGroup) {
      // TODO: Implementare invio per gruppo
      console.warn('Invio messaggi di gruppo non ancora implementato');
      return;
    }

    // Chat 1-1
    const recipientId = selectedChat.value.participants?.[0];
    const recipientPublicKey = selectedChat.value.publicKeys?.[recipientId || ''];

    if (!recipientPublicKey) {
      console.error('Chiave pubblica del destinatario non trovata');
      return;
    }

    await sendEncryptedMessage(
        selectedChat.value.id,
        message.value
    );

    message.value = '';
  } catch (error) {
    console.error('Errore nell\'invio del messaggio:', error);
    alert('Errore nell\'invio del messaggio. Riprova.');
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

        <div class="flex items-center gap-1 shrink-0">
          <!-- Indicatore stato crittografia -->
          <span
              :class="isKeysUnlocked ? 'text-green-400' : 'text-yellow-400'"
              :title="isKeysUnlocked ? 'Crittografia attiva' : 'Crittografia bloccata'"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                  v-if="isKeysUnlocked"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
              />
              <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </span>

          <button
              @click="handleLogout"
              class="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-slate-200"
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
        <div>
          <h2 class="text-xl font-semibold text-slate-200">Seleziona una chat</h2>
          <p class="mt-2 text-sm text-slate-400">
            Scegli una conversazione dalla lista per iniziare a chattare
          </p>
          <span class="mt-1 text-xs text-green-400 flex items-center justify-center gap-1">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Protetto con crittografia end-to-end
          </span>
        </div>
      </div>

      <!-- Chat Attiva -->
      <template v-else>
        <!-- Header Chat -->
        <header class="flex items-center justify-between border-b border-white/10 p-3">
          <div class="flex items-center gap-3 min-w-0">
            <span
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold text-white"
                :class="selectedChat.isGroup ? 'bg-purple-600' : 'bg-indigo-600'"
            >
              {{ selectedChat.avatar }}
            </span>
            <span class="min-w-0">
              <span class="font-semibold text-slate-100 truncate block">{{ selectedChat.name }}</span>
              <span class="text-xs text-slate-400 flex items-center gap-1">
                <svg class="h-3 w-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Crittografia end-to-end
              </span>
            </span>
          </div>

          <div class="flex items-center gap-1 shrink-0">
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
          </div>
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
            />

            <button
                type="submit"
                :disabled="!message.trim()"
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
