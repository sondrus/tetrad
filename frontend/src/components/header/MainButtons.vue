<template>
  <div class="buttons">

    <button @click="actionsStore.view.toggleSidebar" class="btn_sidebar icon sidebar"
      :title="$t('toolbar.sidebar')"></button>

    <span class="separator"></span>

    <div class="group">
      <button @click="actionsStore.general.goToWelcomePage" class="btn_logo icon logo"
        :title="$t('toolbar.welcome')"></button>
    </div>

    <!-- Buttons: add new note -->
    <div class="group">
      <button @click="actionsStore.note.addRoot" class="btn_add_root icon add_root"
        :title="$t('toolbar.add_root')"></button>
      <button @click="actionsStore.note.addNear" v-if="notesStore.isNoteOpened"
        :title="$t('toolbar.add_near')" class="btn_add_near icon add_near"></button>
      <button @click="actionsStore.note.addChild" v-if="notesStore.isNoteOpened"
      :title="$t('toolbar.add_child')" class="btn_add_child icon add_child"></button>
    </div>

    <!-- Buttons: edit -->
    <div class="group" v-if="notesStore.isNoteOpened">
      <button @click="actionsStore.note.edit" class="btn_edit icon edit"
        :title="$t('toolbar.edit')"></button>
    </div>

    <!-- Buttons: delete -->
    <div class="group" v-if="notesStore.isNoteOpened">
      <button @click="actionsStore.note.delete" class="btn_delete icon delete"
        :title="$t('toolbar.delete')"></button>
    </div>

    <!-- Options: Viewer/Editor -->
    <div class="group" v-if="notesStore.isEditable && !settingsStore.settings.doublePanel.enabled">

      <button @click="actionsStore.view.showViewer"
        :title="$t('toolbar.viewer')"
        :class="{
          selected: !settingsStore.isEditMode() && !settingsStore.settings.doublePanel.enabled
        }" class="btn_viewmode icon viewer"></button>

      <button @click="actionsStore.view.showEditor"
        :title="$t('toolbar.editor')"
        :class="{
          selected: settingsStore.isEditMode()
        }" class="btn_editmode icon editor"></button>

    </div>

  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settingsStore';
import { useNotesStore } from '@/stores/notesStore';
import { useActionsStore } from '@/stores/actionsStore';

const settingsStore = useSettingsStore();
const notesStore = useNotesStore();
const actionsStore = useActionsStore();
</script>

<style scoped>
.buttons {
  display: flex;
}
.group {
  display: flex;
}
button {
  background-color: var(--color-btn-bg);
  background-position: center center;
  background-repeat: no-repeat;
  background-size: var(--tetrad-height-icons-m);
  border: 1px solid var(--color-btn-border);
  border-radius: var(--tetrad-border-radius);
  font-size: 0;
  height: var(--tetrad-height-header);
  margin: 0 var(--tetrad-icons-margin);
  position: relative;
  width: var(--tetrad-height-header);
}
.buttons > button:first-child {
  margin-left: 0;
}
@media (hover: hover) and (pointer: fine) {
  button:hover {
    background-color: var(--color-btn-bg-active);
  }
}
button.selected,
button:active {
  background-color: var(--color-btn-bg-active);
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.5) inset;
}
.group {
  margin: 0 var(--tetrad-icons-margin);
}
.group button {
  border-radius: 0;
  margin-right: -1px;
  margin-left: 0;
}
.group button:first-child {
  border-left: 1px solid var(--color-btn-border);
  border-bottom-left-radius: var(--tetrad-border-radius);
  border-top-left-radius: var(--tetrad-border-radius);
}
.group button:last-child {
  border-right: 1px solid var(--color-btn-border);
  border-bottom-right-radius: var(--tetrad-border-radius);
  border-top-right-radius: var(--tetrad-border-radius);
}
.group button:focus {
  z-index: 1;
}
.separator {
  background-color: var(--color-btn-border);
  flex: 0 0 1px;
  margin: 2px 0;
  width: 1px;
}
</style>
