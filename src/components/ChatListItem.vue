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

const chatInitial = computed(() => {
  return props.chat.name.charAt(0).toUpperCase();
});

const avatarColor = computed(() => {
  const colors = [
    "from-indigo-500 to-purple-600",
    "from-purple-500 to-pink-600",
    "from-pink-500 to-rose-600",
    "from-blue-500 to-cyan-600",
    "from-green-500 to-emerald-600",
    "from-yellow-500 to-orange-600",
    "from-red-500 to-pink-600",
    "from-cyan-500 to-blue-600",
  ];

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
    class="relative flex w-full items-center gap-2.5 px-3 py-2.5 transition-all duration-200 group hover:bg-white/5"
    :class="{
      'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-l-2 border-indigo-500':
        isSelected,
      'border-l-2 border-transparent': !isSelected,
    }"
  >
    <!-- Avatar più piccolo -->
    <div class="relative shrink-0">
      <span
        class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br font-bold text-white text-sm shadow-md ring-2 transition-all group-hover:ring-4"
        :class="[
          avatarColor,
          isSelected
            ? 'ring-indigo-500/30'
            : 'ring-white/10 group-hover:ring-white/20',
        ]"
      >
        {{ chatInitial }}
      </span>

      <!-- Status Online Indicator più piccolo -->
      <span class="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
        <span
          class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
        ></span>
        <span
          class="relative inline-flex rounded-full h-3 w-3 bg-green-500 ring-2 ring-slate-900"
        ></span>
      </span>
    </div>

    <!-- Info Chat -->
    <div class="min-w-0 flex-1 text-left">
      <div class="flex items-center justify-between gap-2 mb-0.5">
        <span
          class="truncate font-bold text-sm transition-colors"
          :class="
            isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
          "
        >
          {{ chat.name }}
        </span>
        <span class="shrink-0 text-xs text-slate-500">
          {{ chat.timestamp }}
        </span>
      </div>

      <div class="flex items-center justify-between gap-2">
        <span
          class="truncate text-xs text-slate-400 group-hover:text-slate-300"
        >
          {{ chat.lastMessage }}
        </span>

        <!-- Badge non letti più piccolo -->
        <span
          v-if="chat.unread > 0"
          class="flex h-4 min-w-[16px] shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-1.5 text-xs font-bold text-white shadow-md animate-pulse"
        >
          {{ chat.unread > 99 ? "99+" : chat.unread }}
        </span>
      </div>
    </div>

    <!-- Hover Effect -->
    <div
      class="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-purple-500/0 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none"
    ></div>
  </button>
</template>
