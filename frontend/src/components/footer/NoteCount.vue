<template>
  <div>{{ notesStore.notesMap.size }}</div>
</template>

<script setup lang="ts">
import { useNotesStore } from '@/stores/notesStore';
const notesStore = useNotesStore();
</script>
