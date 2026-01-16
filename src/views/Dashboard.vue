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

// State
const searchQuery = ref("");
const showProfileModal = ref(false);
const showUnlockModal = ref(false);
const showNewChatModal = ref(false);
const isCreatingChat = ref(false);
const isKeysUnlocked = computed(() => keyStore.getIsUnlocked());

// ✅ AGGIUNTO: Real-time display name dal database
const realtimeDisplayName = ref("");

// ✅ AGGIUNTO: Listener per annullare l'iscrizione
let unsubscribeUserProfile: (() => void) | null = null;

const isChatOpen = computed(() => route.name === "chat" && route.params.chatId);

// ✅ MODIFICATO: Usa il nome real-time se disponibile, altrimenti fallback
const displayName = computed(() => {
  if (realtimeDisplayName.value) {
    return realtimeDisplayName.value;
  }
  return user.value?.displayName || user.value?.email?.split("@")[0] || "User";
});

const filteredChats = computed(() => {
  if (!searchQuery.value) return chats.value;
  return chats.value.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

onMounted(async () => {
  await loadUserChats();

  if (!isKeysUnlocked.value) {
    showUnlockModal.value = true;
  }

  // ✅ AGGIUNTO: Listener real-time per il profilo utente
  if (user.value?.uid) {
    const userDocRef = doc(db, "users", user.value.uid);

    unsubscribeUserProfile = onSnapshot(
      userDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          realtimeDisplayName.value = data.displayName || "";
          console.log("📡 Nome aggiornato in real-time:", data.displayName);
        }
      },
      (error) => {
        console.error("❌ Errore listener profilo:", error);
      }
    );
  }
});

// ✅ AGGIUNTO: Pulisci il listener quando il componente viene smontato
onUnmounted(() => {
  if (unsubscribeUserProfile) {
    unsubscribeUserProfile();
    console.log("🔌 Listener profilo disconnesso");
  }
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
    console.log("🔄 Creazione chat con:", user.email, "UID:", user.uid);
    const chatId = await createChatWithUser(user.uid);

    if (chatId) {
      console.log("✅ Chat creata/recuperata:", chatId);
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

  console.log("🔓 Chiavi sbloccate, ricarico chat con messaggi decifrati...");
  await loadUserChats();
}
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-slate-950">
    <!-- Sidebar Sinistra - Lista Chat (SEMPRE VISIBILE) -->
    <aside
      class="flex flex-col border-r border-white/10 bg-slate-900/50 w-80 min-w-70 max-w-md"
    >
      <!-- User Header -->
      <div
        class="flex items-center justify-between border-b border-white/10 p-3"
      >
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
          <svg
            class="h-4 w-4 text-slate-400 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>

      <!-- E2EE Status Badge -->
      <div class="border-b border-white/10 px-3 py-2">
        <span
          class="flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
          :class="
            isKeysUnlocked
              ? 'bg-green-500/10 text-green-400'
              : 'bg-yellow-500/10 text-yellow-400'
          "
        >
          <svg
            class="h-3.5 w-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
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
            {{
              isKeysUnlocked ? "Crittografia Attiva" : "Crittografia Bloccata"
            }}
          </span>
        </span>
      </div>

      <!-- Search Bar con bottone Nuova Chat -->
      <div class="border-b border-white/10 p-3 space-y-2">
        <!-- Pulsante Nuova Chat -->
        <button
          @click="openNewChatModal"
          :disabled="isCreatingChat"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            v-if="!isCreatingChat"
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
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
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{{ isCreatingChat ? "Creazione..." : "Nuova Chat" }}</span>
        </button>

        <!-- Search esistente -->
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

    <!-- Area Principale: Empty State O Chat Component -->
    <main class="flex flex-1 flex-col min-w-0">
      <!-- Mostra RouterView (Chat.vue) se c'è una chat aperta -->
      <RouterView v-if="isChatOpen" />

      <!-- Altrimenti mostra Empty State -->
      <div
        v-else
        class="flex h-full flex-col items-center justify-center space-y-4 text-center px-4"
      >
        <span
          class="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/20"
        >
          <svg
            class="h-10 w-10 text-indigo-400"
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
        </span>
        <span>
          <span class="text-xl font-semibold text-slate-200 block"
            >Seleziona una chat</span
          >
          <span class="mt-2 text-sm text-slate-400 block">
            Scegli una conversazione dalla lista o crea una nuova chat
          </span>
          <span
            class="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400"
          >
            <svg
              class="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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
    </main>

    <!-- Modals -->
    <ProfileEditModal v-if="showProfileModal" @close="closeProfileModal" />
    <UnlockKeysModal
      v-if="showUnlockModal"
      @unlocked="handleKeysUnlocked"
      @close="showUnlockModal = false"
    />
    <NewChatModal
      v-if="showNewChatModal"
      @close="showNewChatModal = false"
      @user-selected="handleUserSelected"
    />
  </div>
</template>
