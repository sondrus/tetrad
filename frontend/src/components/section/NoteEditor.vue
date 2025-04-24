<template>
  <div ref="editorContainer" class="note_editor"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

import {
  editorCreate, editorSetContent, editorSetLineWrap, editorSetFocus,
  editorInsertAtCursor
} from '@/services/editor'
import { useSettingsStore } from '@/stores/settingsStore';
import { useNotesStore } from '@/stores/notesStore';
import { useEmojiStore } from '@/stores/emojiStore';

const settingsStore = useSettingsStore();
const notesStore = useNotesStore();
const emojiStore = useEmojiStore();

const editorContainer = ref<HTMLElement>();
const editorContents = ref<string>()

onMounted(() => {
  if (!editorContainer.value) {
    return;
  }

  editorCreate(editorContainer.value, () => editorContents as {value: string})
  editorSetLineWrap(settingsStore.settings.editor.linewrap)
});

// Handle editor change to save contents
watch(() => editorContents.value, (contents) => {
    if(contents === undefined){
      return;
    }

    if (!notesStore.current) {
      return;
    }

    if (notesStore.current.readonly) {
      return;
    }

    // Save note contents
    notesStore.updateNoteContents(contents);
    notesStore.saveNoteContentsWithDebounce(notesStore.current.id, contents);
});

// Auto load editor text from current note
watch(() => notesStore.current.contents, (contents) => {
  editorSetContent(contents, notesStore.current.id);
});

// Auto apply options `linewrap`
watch(() => settingsStore.settings.editor.linewrap, (newValue) => {
  editorSetLineWrap(newValue)
});

// Watch for edit mode is changed to `on` => set focus to editor
watch(() => settingsStore.settings.editor.editMode, (newValue, oldValue) => {
  if(newValue === true && oldValue === false) {
    editorSetFocus()
  }
});

// Watch for emoji select
watch(() => emojiStore.emoji, (emoji) => {
  editorInsertAtCursor(emoji)
});
</script>

<style>
.note_editor {
  display: none;
  height: 100%;
  overflow: auto;
}
.note_editor.visible {
  display: block;
}
.cm-editor {
  font-size: 90%;
  height: 100%;
}
.cm-gutters {
  user-select: none;
}
</style>
