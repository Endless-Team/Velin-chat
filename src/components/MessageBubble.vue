<script setup lang="ts">
import type { Message } from "../types/chat.types";

interface Props {
  message: Message;
}

defineProps<Props>();
</script>

<template>
  <div
    class="flex animate-fadeIn"
    :class="message.sent ? 'justify-end' : 'justify-start'"
  >
    <div
      class="max-w-md rounded-xl px-3 py-2 relative group shadow-md transition-all hover:shadow-lg"
      :class="
        message.sent
          ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm'
          : 'border border-white/10 bg-slate-800/80 backdrop-blur-sm text-slate-100 rounded-bl-sm'
      "
    >
      <p class="text-sm leading-snug whitespace-pre-wrap break-words">
        {{ message.text }}
      </p>

      <div class="flex items-center justify-end gap-1.5 mt-1">
        <span
          class="text-xs"
          :class="message.sent ? 'text-indigo-200' : 'text-slate-400'"
        >
          {{ message.timestamp }}
        </span>

        <!-- Status indicators -->
        <span v-if="message.sent" class="flex items-center">
          <!-- Sending -->
          <svg
            v-if="message.status === 'sending'"
            class="h-3.5 w-3.5 text-indigo-200 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2.5"
          >
            <circle cx="12" cy="12" r="9" />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 7v5l3 2"
            />
          </svg>

          <!-- Sent -->
          <svg
            v-else-if="!message.status || message.status === 'sent'"
            class="h-3.5 w-3.5 text-indigo-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>

          <!-- Delivered -->
          <svg
            v-else-if="message.status === 'delivered'"
            class="h-3.5 w-3.5 text-indigo-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2.5"
          >
            <polyline points="17 6 6 17 1 12" />
            <polyline points="23 6 12 17" />
          </svg>

          <!-- Read -->
          <svg
            v-else-if="message.status === 'read'"
            class="h-3.5 w-3.5 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2.5"
          >
            <polyline points="17 6 6 17 1 12" />
            <polyline points="23 6 12 17" />
          </svg>

          <!-- Fallback -->
          <svg
            v-else
            class="h-3.5 w-3.5 text-indigo-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      </div>

      <!-- Encryption Badge (hover) -->
      <div
        class="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        title="Messaggio cifrato end-to-end"
      >
        <div
          class="bg-slate-900 rounded-full p-1 shadow-lg ring-1 ring-white/10"
        >
          <svg
            class="h-2.5 w-2.5 text-green-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>
