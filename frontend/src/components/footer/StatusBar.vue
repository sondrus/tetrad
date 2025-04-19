<template>
  <footer>
    <DatabaseName />
    <DatabaseSize />
    <NoteCount />
    <DateModified v-if="notesStore.isNoteOpened" />
    <DateCreated v-if="notesStore.isNoteOpened" />
    <FooterMessage />
  </footer>
</template>

<script setup lang="ts">
import { useNotesStore } from '@/stores/notesStore'

import DatabaseSize from '@/components/footer/DatabaseSize.vue'
import DatabaseName from '@/components/footer/DatabaseName.vue'
import NoteCount from '@/components/footer/NoteCount.vue'
import FooterMessage from '@/components/footer/FooterMessage.vue'
import DateModified from '@/components/footer/DateModified.vue'
import DateCreated from '@/components/footer/DateCreated.vue'

const notesStore = useNotesStore()
</script>

<style scoped>
footer {
  align-items: stretch !important;
  background-color: var(--tetrad-panel);
  display: flex;
  flex: 0 0 var(--tetrad-height-footer);
  font-size: 0.9rem;
  line-height: var(--tetrad-height-footer);
  padding: 0;
  place-items: center;
  white-space: nowrap;
}
footer > * {
  border-left: 1px solid var(--color-panel-border);
  color: var(--color-text-gray);
  flex: 1 0 auto;
  overflow: hidden;
  padding: 2px 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
footer > *:first-child {
  border-left: none;
}
@media (max-width: 767px) {
  footer {
    flex-wrap: wrap-reverse;
    font-size: 0.8rem;
  }
  footer > * {
    padding: 2px 5px;
  }
  footer > .messages {
    border-bottom: 1px solid var(--color-panel-border);
    border-left: none;
  }
  footer > .messages:empty {
    display: none;
  }
}
</style>
