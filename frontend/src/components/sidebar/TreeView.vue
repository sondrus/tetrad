<template>

  <nav ref="refNav" tabindex="0" :class="{
    multiline: settingsStore.settings.treeview.multiline,
    select_mode: props.selectMode,
    search_mode: !props.selectMode && searchStore.searchMode,
    is_loading: !props.selectMode && searchStore.isLoading,
    tree_mode: !props.selectMode && settingsStore.settings.search.treeMode
  }">
    <ul>
      <TreeViewItem v-if="props.selectMode"
        :selectMode="props.selectMode"
        :searchMode="!props.selectMode && searchStore.searchMode"
      />
      <TreeViewItem v-for="note in notesStore.notesTree" :key="note.id" :note="note"
        :selectMode="props.selectMode"
        :searchMode="!props.selectMode && searchStore.searchMode"
      />
    </ul>
  </nav>

</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import { useSettingsStore } from '@/stores/settingsStore';
import { useNotesStore } from '@/stores/notesStore'
import { useSearchStore } from '@/stores/searchStore'
import { scrollToSelected } from '@/utils/viewport.ts'

import TreeViewItem from './TreeViewItem.vue'

const settingsStore = useSettingsStore();
const searchStore = useSearchStore();

const notesStore = useNotesStore()

// Props
const props = defineProps<{
  selectMode?: boolean
}>()

const refNav = ref<HTMLElement>()

if(props.selectMode){
  watch(() => searchStore.searchResults, () => {
    scrollToSelected(document.querySelector('nav'))
  });
}
</script>

<style scoped>
nav {
  background-color: var(--color-input-bg);
  flex: 1 1 100%;
  height: 100%;
  overflow: auto;
  position: relative;
}
aside.not_found nav {
  background-color: transparent;
}
nav.select_mode {
  border: 1px solid var(--color-panel-border);
}
ul {
  padding: 0;
}
/* loading */
nav.is_loading:before {
  background: #ffffff;
  content: '';
  height: 100%;
  left: 0;
  opacity: 0.6;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 1;
}
nav.is_loading:after {
  animation: rotation 1s linear infinite;
  border: 5px solid var(--color-panel-border);
  border-bottom-color: transparent;
  border-radius: 50%;
  content: '';
  height: 48px;
  left: 50%;
  margin: -24px 0 0 -24px;
  position: absolute;
  top: 50%;
  width: 48px;
  z-index: 2;
}
@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
