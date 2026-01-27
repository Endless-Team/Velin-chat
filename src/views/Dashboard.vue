<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAuth } from "../composables/useAuth";
import { useRouter, useRoute } from "vue-router";
import { useEncryptedChat } from "../composables/useEncryptedChat";
import { keyStore } from "../stores/keyStore";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import ChatListItem from "../components/ChatListItem.vue";
import ProfileEditModal from "../components/ProfileEditModal.vue";
import UnlockKeysModal from "../components/UnlockKeysModal.vue";
import NewChatModal from "../components/NewChatModal.vue";

const router = useRouter();
const route = useRoute();
const { user, logout } = useAuth();
const { chats, selectedChatId, selectChat, loadUserChats, createChatWithUser } =
  useEncryptedChat();

const searchQuery = ref("");
const showProfileModal = ref(false);
const showUnlockModal = ref(false);
const showNewChatModal = ref(false);
const isCreatingChat = ref(false);
const isKeysUnlocked = computed(() => keyStore.getIsUnlocked());

const realtimeDisplayName = ref("");
let unsubscribeUserProfile: (() => void) | null = null;

/**
 * Considero "chat aperta" quando sono nella route chat e ho un chatId.
 * (Per mobile: se true -> mostra solo la chat, se false -> mostra solo lista.)
 */
const isChatOpen = computed(
  () => route.name === "chat" && !!route.params.chatId,
);

const displayName = computed(() => {
  if (realtimeDisplayName.value) return realtimeDisplayName.value;
  return user.value?.displayName || user.value?.email?.split("@")[0] || "User";
});

const filteredChats = computed(() => {
  if (!searchQuery.value) return chats.value;
  return chats.value.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});

onMounted(async () => {
  await loadUserChats();

  if (!isKeysUnlocked.value) {
    showUnlockModal.value = true;
  }

  if (user.value?.uid) {
    const userDocRef = doc(db, "users", user.value.uid);

    unsubscribeUserProfile = onSnapshot(
      userDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          realtimeDisplayName.value = data.displayName || "";
        }
      },
      (error) => {
        console.error("❌ Errore listener profilo:", error);
      },
    );
  }
});

onUnmounted(() => {
  if (unsubscribeUserProfile) unsubscribeUserProfile();
});

async function handleSelectChat(chatId: string) {
  if (!isKeysUnlocked.value) {
    showUnlockModal.value = true;
    return;
  }

  await selectChat(chatId);
  await router.push(`/chat/${chatId}`);
}

async function handleUserSelected(user: any) {
  if (!isKeysUnlocked.value) {
    showUnlockModal.value = true;
    showNewChatModal.value = false;
    return;
  }

  isCreatingChat.value = true;

  try {
    const chatId = await createChatWithUser(user.uid);

    if (chatId) {
      showNewChatModal.value = false;
      await new Promise((resolve) => setTimeout(resolve, 500));
      await router.push(`/chat/${chatId}`);
    }
  } catch (error: any) {
    console.error("❌ Errore nella creazione della chat:", error);
    alert(error.message || "Errore nella creazione della chat. Riprova.");
  } finally {
    isCreatingChat.value = false;
  }
}

async function handleLogout() {
  keyStore.lockKeys();
  await logout();
  await router.push("/login");
}

function openProfileModal() {
  showProfileModal.value = true;
}

function closeProfileModal() {
  showProfileModal.value = false;
}

function openNewChatModal() {
  if (!isKeysUnlocked.value) {
    showUnlockModal.value = true;
    return;
  }
  showNewChatModal.value = true;
}

async function handleKeysUnlocked() {
  showUnlockModal.value = false;
  await loadUserChats();
}
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
    <!-- Sidebar Sinistra -->
    <!-- Mobile: visibile SOLO se chat NON aperta -->
    <!-- Desktop (md+): sempre visibile -->
    <aside
      class="flex flex-col border-r border-white/5 bg-slate-900/80 backdrop-blur-xl w-full md:w-80 md:min-w-70 md:max-w-md shadow-2xl"
      :class="isChatOpen ? 'hidden md:flex' : 'flex'"
    >
      <!-- User Header più compatto -->
      <div class="flex items-center justify-between border-b border-white/5 p-3 bg-linear-to-r from-indigo-600/10 to-purple-600/10">
        <button
          @click="openProfileModal"
          class="flex items-center gap-2 min-w-0 hover:bg-white/10 rounded-lg p-1.5 -ml-1.5 transition-all duration-200 group"
        >
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 font-bold text-white text-sm shadow-lg ring-2 ring-white/10"
          >
            {{ displayName.charAt(0).toUpperCase() }}
          </span>
          <div class="min-w-0">
            <h2 class="font-bold text-slate-100 truncate text-sm">
              {{ displayName }}
            </h2>
            <div class="flex items-center gap-1 text-xs">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span class="text-green-400 font-medium">Online</span>
            </div>
          </div>
        </button>

        <button
          @click="handleLogout"
          class="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 shrink-0 transition-all duration-200"
          title="Logout"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>

      <!-- Search Bar e Nuova Chat -->
      <div class="px-3 pt-3 pb-3 space-y-2">
        <button
          @click="openNewChatModal"
          :disabled="isCreatingChat"
          class="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-bold text-white hover:from-indigo-500 hover:to-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg
            v-if="!isCreatingChat"
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2.5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <svg v-else class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{{ isCreatingChat ? "Creazione..." : "Nuova Chat" }}</span>
        </button>

        <div class="relative group">
          <svg
            class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors"
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
            placeholder="Cerca conversazioni..."
            class="w-full rounded-lg border border-white/10 bg-slate-950/60 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition-all"
          />
        </div>
      </div>

      <!-- Lista Chat -->
      <div class="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <div v-if="filteredChats.length === 0" class="p-6 text-center">
          <svg class="h-12 w-12 mx-auto text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p class="text-slate-400 text-sm font-medium">Nessuna chat trovata</p>
          <p class="text-slate-500 text-xs mt-1">Inizia una nuova conversazione</p>
        </div>

        <ChatListItem
          v-for="chat in filteredChats"
          :key="chat.id"
          :chat="chat"
          :is-selected="selectedChatId === chat.id"
          @select="handleSelectChat"
        />
      </div>
    </aside>

    <!-- Area Principale -->
    <!-- Mobile: visibile SOLO se chat aperta -->
    <!-- Desktop (md+): sempre visibile -->
    <main class="flex flex-1 flex-col min-w-0" :class="isChatOpen ? 'flex' : 'hidden md:flex'">
      <RouterView v-if="isChatOpen" />

      <div v-else class="hidden md:flex h-full flex-col items-center justify-center space-y-4 text-center px-4">
        <div class="relative">
          <div class="absolute inset-0 bg-indigo-500/20 blur-3xl animate-pulse"></div>
          <span class="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 shadow-2xl">
            <svg class="h-10 w-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </span>
        </div>

        <div class="space-y-2">
          <h2 class="text-xl font-black text-slate-100">Inizia una conversazione</h2>
          <p class="text-sm text-slate-400 max-w-md">
            Seleziona una chat dalla lista o crea una nuova conversazione per iniziare a chattare
          </p>
        </div>

        <div class="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 px-3 py-2 text-xs font-semibold text-green-300 shadow-lg">
          <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>Protetto con crittografia end-to-end</span>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <ProfileEditModal v-if="showProfileModal" @close="closeProfileModal" />
    <UnlockKeysModal v-if="showUnlockModal" @unlocked="handleKeysUnlocked" @close="showUnlockModal = false" />
    <NewChatModal v-if="showNewChatModal" @close="showNewChatModal = false" @user-selected="handleUserSelected" />
  </div>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
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
</style>
