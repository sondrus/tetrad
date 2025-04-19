<template>
  <div class="note_title">
    <div class="path">
      <template v-for="(item, index) in parents" :key="index">
        <span class="separator" v-if="index >= 1">{{ settingsStore.settings.title.pathSeparator }}</span>
        <span class="parent">{{ item }}</span>
      </template>
    </div>
    <div class="title">
      {{ notesStore.isNoteOpened ? notesStore.current.title : $t('welcome.title') }}
    </div>
    <div
      v-if="notesStore.isNoteOpened"
      @click="notesStore.toggleFavorite()"
      :class="['favorites', {
        active: notesStore.current.favorite
      }]"
    >
      <div class="icon fav"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useSettingsStore } from '@/stores/settingsStore'
import { useNotesStore } from '@/stores/notesStore'

const settingsStore = useSettingsStore()
const notesStore = useNotesStore()

// Get array of parent titles
const parents = computed(() => {
  if(!notesStore.current){
    return []
  }

  // Get parent titles
  return notesStore.getNoteParents(notesStore.current.id).map((parent)=>parent.title);
})
</script>

<style scoped>
.note_title {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  line-height: 100%;
  overflow: hidden;
  padding: 0 8px;
  padding-right: 36px;
  position: relative;
  text-align: center;
  user-select: text;
  width: 100%;
}
header .note_title {
  margin-right: 10px;
}
.title {
  font-weight: bold;
  line-height: 110%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.path {
  color: var(--color-text-silver);
  font-size: 0.8em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.path:not(:empty) {
  margin: -2px 0 2px;
}
.path .parent {
  color: var(--color-text-black);
}
.favorites {
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
  width: 32px;
}
.favorites > div {
  background-position: center center;
  background-repeat: no-repeat;
  background-size: contain;
  content: '';
  height: 20px;
  filter: grayscale(1);
  left: 50%;
  margin: -10px 0 0 -10px;
  opacity: 0.5;
  position: absolute;
  top: 50%;
  width: 20px;
}
.favorites.active > div {
  filter: grayscale(0);
  opacity: 1;
}
@media (hover: hover) and (pointer: fine) {
  .favorites:hover > div {
    filter: grayscale(0);
    opacity: 1;
  }
}
</style>
