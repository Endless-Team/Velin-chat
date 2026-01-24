<script setup lang="ts">
import { computed } from "vue";
import type { Chat } from "../types/chat.types";

interface Props {
  chat: Chat;
  isSelected: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  select: [chatId: string];
}>();

// ✅ Calcola l'iniziale del nome
const chatInitial = computed(() => {
  return props.chat.name.charAt(0).toUpperCase();
});

// ✅ Colore casuale ma consistente basato sul nome
const avatarColor = computed(() => {
  const colors = [
    "bg-indigo-600",
    "bg-purple-600",
    "bg-pink-600",
    "bg-blue-600",
    "bg-green-600",
    "bg-yellow-600",
    "bg-red-600",
    "bg-cyan-600",
  ];

  // Hash semplice del nome per avere sempre lo stesso colore
  const hash = props.chat.name.split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  return colors[hash % colors.length];
});

function handleClick() {
  emit("select", props.chat.id);
}
</script>

<template>
  <button
    @click="handleClick"
    class="flex w-full items-center gap-3 border-b border-white/5 p-3 transition-colors hover:bg-white/5"
    :class="{ 'bg-white/10': isSelected }"
  >
    <!-- ✅ Avatar con iniziale -->
    <span
      class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-semibold text-white"
      :class="avatarColor"
    >
      {{ chatInitial }}
    </span>

    <!-- Info Chat -->
    <span class="min-w-0 flex-1 text-left">
      <span class="flex items-center justify-between gap-2">
        <span class="truncate font-semibold text-slate-100">{{
          chat.name
        }}</span>
        <span class="shrink-0 text-xs text-slate-400">{{
          chat.timestamp
        }}</span>
      </span>

      <span class="flex items-center justify-between gap-2 mt-1">
        <span class="truncate text-sm text-slate-400">{{
          chat.lastMessage
        }}</span>

        <!-- Badge non letti -->
        <span
          v-if="chat.unread > 0"
          class="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-semibold text-white"
        >
          {{ chat.unread }}
        </span>
      </span>
    </span>
  </button>
</template>
