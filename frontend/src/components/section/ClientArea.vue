<template>

  <div class="client_area" ref="refClientArea">
    <NoteWrapper v-if="notesStore.current.id > 0" />
    <WelcomePage v-else />
  </div>

  <Teleport to="head">
    <link :href="settingsStore.hljsCssFilename" rel="stylesheet" />
  </Teleport>

</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

import { useNotesStore } from '@/stores/notesStore'
import { useSettingsStore } from '@/stores/settingsStore'

import NoteWrapper from '@/components/section/NoteWrapper.vue'
import WelcomePage from '@/components/section/WelcomePage.vue'

const settingsStore = useSettingsStore();
const notesStore = useNotesStore()

// Observe client area width

const refClientArea = ref<HTMLElement>()

let observer: ResizeObserver

onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    settingsStore.widthClientArea = entry.contentRect.width
  })
  if (refClientArea.value) {
    observer.observe(refClientArea.value)
  }
})

onBeforeUnmount(() => {
  if (observer && refClientArea.value) {
    observer.unobserve(refClientArea.value)
  }
})

</script>

<style scoped>
.client_area {
  flex: 1 1 100%;
  overflow: hidden;
  user-select: text;
}
</style>
