<template>
  <div class="note_container">
    <div class="note_title_mobile" v-if="settingsStore.widthWindow < 768">
      <NoteTitle  />
    </div>
    <div :class="['note_wrapper', { 
      horizontal: !settingsStore.settings.doublePanel.vertical,
      vertical: settingsStore.settings.doublePanel.vertical
    }]">
      <NoteEditor :class="{visible: isModeEditor}" />
      <NoteViewer :class="{visible: isModeViewer}" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useSettingsStore } from '@/stores/settingsStore'
import { useNotesStore } from '@/stores/notesStore'

import NoteTitle from '@/components/header/NoteTitle.vue'

import NoteEditor from '@/components/section/NoteEditor.vue'
import NoteViewer from '@/components/section/NoteViewer.vue'

const settingsStore = useSettingsStore()
const notesStore = useNotesStore()

const isModeEditor = computed(() => {
  if (settingsStore.settings.doublePanel.enabled) {
    return true
  }
  if(notesStore.current.readonly){
    return false
  }
  return settingsStore.isEditMode()
})

const isModeViewer = computed(() => {
  if (settingsStore.settings.doublePanel.enabled) {
    return true
  }
  if(notesStore.current.readonly){
    return true
  }
  return !settingsStore.isEditMode()
})
</script>

<style scoped>
.note_container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.note_title_mobile {
  background-color: var(--tetrad-panel);
  border-bottom: 1px solid var(--color-panel-border);
  flex: 0 0 calc(var(--tetrad-height-header) + 4px);
  place-items: center;
}
.note_wrapper {
  display: flex;
  height: 100%;
  flex: 0 1 100%;
  overflow: hidden;
  position: relative;
}
.note_wrapper.horizontal {
  flex-direction: column-reverse;
}
.note_wrapper > * {
  flex: 1 0 50%;
}
</style>

<style>
/* Double panel horizontal */
.note_wrapper.vertical > *.visible + *.visible {
  border-left: 1px solid var(--color-panel-border);
}
.note_wrapper.horizontal > *.visible + *.visible {
  border-bottom: 1px solid var(--color-panel-border);
}
</style>