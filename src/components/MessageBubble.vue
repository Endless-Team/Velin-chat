<script setup lang="ts">
import type {Message} from '../types/chat.types';

interface Props {
  message: Message;
}

defineProps<Props>();
</script>

<template>
  <div
      class="flex"
      :class="message.sent ? 'justify-end' : 'justify-start'"
  >
    <div
        class="max-w-md rounded-2xl px-4 py-2 relative group"
        :class="
        message.sent
          ? 'bg-indigo-600 text-white'
          : 'border border-white/10 bg-white/5 text-slate-100'
      "
    >
      <p class="text-sm">{{ message.text }}</p>
      <div class="flex items-center justify-end gap-1 mt-1">
        <p
            class="text-xs"
            :class="message.sent ? 'text-indigo-200' : 'text-slate-400'"
        >
          {{ message.timestamp }}
        </p>

        <!-- Status indicator per messaggi inviati -->
        <svg
            v-if="message.sent && message.status === 'sent'"
            class="h-4 w-4 text-indigo-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
          <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
          />
        </svg>

        <svg
            v-if="message.sent && message.status === 'delivered'"
            class="h-4 w-4 text-indigo-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
          <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <!-- Indicatore crittografia (visibile on hover) -->
      <div
          class="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Messaggio cifrato end-to-end"
      >
        <svg class="h-3 w-3 text-green-400" fill="currentColor" viewBox="0 0 24 24">
          <path
              d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
        </svg>
      </div>
    </div>
  </div>
</template>
