<script setup lang="ts">
import type {Chat} from '../types/chat.types';

interface Props {
  chat: Chat;
  isSelected: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  select: [chatId: string];
}>();

function handleClick() {
  emit('select', props.chat.id);
}
</script>

<template>
  <div
      @click="handleClick"
      class="flex cursor-pointer items-center gap-3 border-b border-white/5 p-4 transition-colors hover:bg-white/5"
      :class="{ 'bg-white/10': isSelected }"
  >
    <div class="relative flex-shrink-0">
      <div
          class="flex h-12 w-12 items-center justify-center rounded-full font-semibold text-white"
          :class="chat.isGroup ? 'bg-purple-600' : 'bg-indigo-600'"
      >
        {{ chat.avatar }}
      </div>
      <span
          v-if="chat.online && !chat.isGroup"
          class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-green-500"
      ></span>
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between">
        <p class="truncate font-semibold text-slate-100">{{ chat.name }}</p>
        <span class="text-xs text-slate-400 ml-2 flex-shrink-0">{{ chat.timestamp }}</span>
      </div>
      <p class="truncate text-sm text-slate-400">{{ chat.lastMessage }}</p>
    </div>

    <div
        v-if="chat.unread > 0"
        class="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white flex-shrink-0"
    >
      {{ chat.unread }}
    </div>
  </div>
</template>
