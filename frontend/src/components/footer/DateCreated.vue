<template>
  <div>{{ notesStore.formatNoteDate(notesStore.current.dateCreated ?? null) }}</div>
</template>

<script setup lang="ts">
import { useNotesStore } from '@/stores/notesStore';
const notesStore = useNotesStore();
</script>

<style scoped>

</style>
