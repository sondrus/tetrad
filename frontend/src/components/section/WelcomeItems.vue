<template>
  <div class="notes_list" v-if="props.items.length">
    <h3>{{ props.title }}</h3>
    <ul :class="{compact: props.compact}">
      <li v-for="note in props.items" :key="note.id">
        <a :data-note-id="note.id">
          <div class="path">
            <template v-for="(item, index) in getPath(note.id)" :key="index">
              <span class="separator" v-if="index >= 1">{{ settingsStore.settings.title.pathSeparator }}</span>
              <span class="parent">{{ item }}</span>
            </template>
          </div>
          <div class="title">{{ note.title }}</div>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { Note } from '@/models/note';

import { useSettingsStore } from '@/stores/settingsStore';
import { useNotesStore } from '@/stores/notesStore';

const settingsStore = useSettingsStore();
const notesStore = useNotesStore();

const props = defineProps<{
  compact: boolean,
  title: string,
  items: Note[],
}>();

const getPath = (noteId: number) => {
  return notesStore.getNoteParents(noteId).map((parent)=>parent.title)
}
</script>

<style scoped>
ul {
	list-style: none;
  margin: 10px 0;
  padding: 0;
}
li {
  background-color: var(--color-panel-bg-light);
  border: 1px solid var(--color-panel-border);
  border-radius: var(--tetrad-border-radius);
  display: inline-block;
  margin: 0 8px 8px 0;
  max-width: 220px;
  min-width: 80px;
  vertical-align: top;
}
ul.compact li {
  display: block;
  min-width: none;
  max-width: none;
}
li a {
  color: var(--color-text-black);
  cursor: pointer;
  display: block;
  font-size: 0.9rem;
  padding: 20px 10px 5px;
  position: relative;
  text-decoration: none;
  transition: 0.25s
}
@media (hover: hover) and (pointer: fine) {
  li a:hover {
    border-color: var(--color-panel-border-hover);
    box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.5);
  }
}
li a div {
  display: block;
}
li a div.title {
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
li a div.path {
  color: var(--color-text-gray);
  font-size: 90%;
  left: 10px;
  margin-bottom: 4px;
  overflow: hidden;
  position: absolute;
  right: 10px;
  text-overflow: ellipsis;
  margin-top: -16px;
  white-space: nowrap;
}
li a div.path:empty:before {
  content: '/';
}
</style>
