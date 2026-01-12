<script setup lang="ts">
import {ref, computed} from "vue";
import {useAuth} from "../composables/useAuth";
import {useRouter} from "vue-router";

const router = useRouter();
const {user, logout} = useAuth();

// State
const selectedChat = ref<string | null>(null);
const message = ref("");
const searchQuery = ref("");

// Mock data per le chat
const chats = ref([
  {
    id: "1",
    name: "Marco Rossi",
    avatar: "MR",
    lastMessage: "Ci vediamo domani!",
    timestamp: "10:30",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "Team Design",
    avatar: "TD",
    lastMessage: "Ho caricato i nuovi mockup",
    timestamp: "09:15",
    unread: 0,
    online: false,
    isGroup: true,
  },
  {
    id: "3",
    name: "Laura Bianchi",
    avatar: "LB",
    lastMessage: "Perfetto, grazie!",
    timestamp: "Ieri",
    unread: 0,
    online: false,
  },
  {
    id: "4",
    name: "Famiglia",
    avatar: "FA",
    lastMessage: "Mamma: A che ora arrivi?",
    timestamp: "Ieri",
    unread: 5,
    online: false,
    isGroup: true,
  },
]);

// Mock messaggi per la chat selezionata
const messages = ref([
  {
    id: "1",
    text: "Ciao! Come va?",
    sent: false,
    timestamp: "10:25",
  },
  {
    id: "2",
    text: "Tutto bene! Tu?",
    sent: true,
    timestamp: "10:26",
  },
  {
    id: "3",
    text: "Benissimo! Ci vediamo domani?",
    sent: false,
    timestamp: "10:28",
  },
  {
    id: "4",
    text: "Ci vediamo domani!",
    sent: true,
    timestamp: "10:30",
  },
]);

const selectedChatData = computed(() => {
  return chats.value.find((c) => c.id === selectedChat.value);
});

const filteredChats = computed(() => {
  if (!searchQuery.value) return chats.value;
  return chats.value.filter((chat) =>
      chat.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

function selectChat(chatId: string) {
  selectedChat.value = chatId;
}

function sendMessage() {
  if (!message.value.trim()) return;

  messages.value.push({
    id: Date.now().toString(),
    text: message.value,
    sent: true,
    timestamp: new Date().toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });

  message.value = "";
}

async function handleLogout() {
  await logout();
  router.push("/login");
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-slate-950">
    <!-- Sidebar Sinistra - Lista Chat -->
    <aside class="flex w-80 flex-col border-r border-white/10 bg-slate-900/50">
      <!-- Header Sidebar -->
      <div class="flex items-center justify-between border-b border-white/10 p-4">
        <div class="flex items-center gap-3">
          <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white"
          >
            {{ user?.email?.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-slate-100">
              {{ user?.email?.split("@")[0] }}
            </p>
            <p class="text-xs text-slate-400">Online</p>
          </div>
        </div>

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

      <!-- Search Bar -->
      <div class="border-b border-white/10 p-4">
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
        <div
            v-for="chat in filteredChats"
            :key="chat.id"
            @click="selectChat(chat.id)"
            class="flex cursor-pointer items-center gap-3 border-b border-white/5 p-4 transition-colors hover:bg-white/5"
            :class="{ 'bg-white/10': selectedChat === chat.id }"
        >
          <div class="relative">
            <div
                class="flex h-12 w-12 items-center justify-center rounded-full font-semibold text-white"
                :class="chat.isGroup ? 'bg-purple-600' : 'bg-indigo-600'"
            >
              {{ chat.avatar }}
            </div>
            <span
                v-if="chat.online"
                class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-green-500"
            ></span>
          </div>

          <div class="flex-1 overflow-hidden">
            <div class="flex items-center justify-between">
              <p class="truncate font-semibold text-slate-100">{{ chat.name }}</p>
              <span class="text-xs text-slate-400">{{ chat.timestamp }}</span>
            </div>
            <p class="truncate text-sm text-slate-400">{{ chat.lastMessage }}</p>
          </div>

          <div v-if="chat.unread > 0"
               class="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
            {{ chat.unread }}
          </div>
        </div>
      </div>
    </aside>

    <!-- Area Messaggi Principale -->
    <main class="flex flex-1 flex-col">
      <!-- Empty State -->
      <div
          v-if="!selectedChat"
          class="flex h-full flex-col items-center justify-center space-y-4 text-center"
      >
        <div class="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/20">
          <svg class="h-10 w-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-semibold text-slate-200">Seleziona una chat</h2>
          <p class="mt-2 text-sm text-slate-400">
            Scegli una conversazione dalla lista per iniziare a chattare
          </p>
        </div>
      </div>

      <!-- Chat Attiva -->
      <template v-else>
        <!-- Header Chat -->
        <header class="flex items-center justify-between border-b border-white/10 p-4">
          <div class="flex items-center gap-3">
            <div
                class="flex h-10 w-10 items-center justify-center rounded-full font-semibold text-white"
                :class="selectedChatData?.isGroup ? 'bg-purple-600' : 'bg-indigo-600'"
            >
              {{ selectedChatData?.avatar }}
            </div>
            <div>
              <p class="font-semibold text-slate-100">{{ selectedChatData?.name }}</p>
              <p class="text-xs text-slate-400">
                {{ selectedChatData?.online ? "Online" : "Offline" }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
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
          <div
              v-for="msg in messages"
              :key="msg.id"
              class="flex"
              :class="msg.sent ? 'justify-end' : 'justify-start'"
          >
            <div
                class="max-w-md rounded-2xl px-4 py-2"
                :class="
                msg.sent
                  ? 'bg-indigo-600 text-white'
                  : 'border border-white/10 bg-white/5 text-slate-100'
              "
            >
              <p class="text-sm">{{ msg.text }}</p>
              <p
                  class="mt-1 text-right text-xs"
                  :class="msg.sent ? 'text-indigo-200' : 'text-slate-400'"
              >
                {{ msg.timestamp }}
              </p>
            </div>
          </div>
        </div>

        <!-- Input Messaggio -->
        <footer class="border-t border-white/10 p-4">
          <form @submit.prevent="sendMessage" class="flex items-center gap-3">
            <button
                type="button"
                class="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-slate-200"
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
                class="rounded-xl bg-indigo-600 p-3 text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
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
  </div>
</template>