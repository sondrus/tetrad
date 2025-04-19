<template>
  <div class="messages">
    <div v-if="logStore.lastMessage && Date.now() - logStore.lastMessage.timestamp <= 600"
      :class="logStore.lastMessage.type"
    >
      {{ logStore.lastMessage.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLogStore } from '@/stores/logStore';
const logStore = useLogStore();
</script>

<style scoped>
div.messages {
  flex: 1 1 100%;
}
div.messages > div {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
div.messages > .info {
  color: var(--color-text-info);
}
div.messages > .warning {
  color: var(--color-text-warning);
}
div.messages > .error {
  color: var(--color-text-error);
}
</style>
