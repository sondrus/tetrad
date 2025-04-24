<template>
  <aside v-if="settingsStore.settings.sidebar.visible"
    :class="{
      not_found: searchStore.searchMode && searchStore.notFound,
    }"
    :style="sidebarStyle"
  >
    <SearchBox />
    <TreeView />
  </aside>
</template>

<script setup lang="ts">
import { computed, watch, nextTick } from 'vue'

import SearchBox from '@/components/sidebar/SearchBox.vue'
import TreeView from '@/components/sidebar/TreeView.vue'

import { useSettingsStore } from '@/stores/settingsStore'
import { useSearchStore } from '@/stores/searchStore'
import { scrollToSelected } from '@/utils/viewport.ts'

const settingsStore = useSettingsStore()
const searchStore = useSearchStore();

const sidebarStyle = computed(() => ({
  width: settingsStore.settings.sidebar.width
    ? `${settingsStore.settings.sidebar.width}px`
    : '',
}))

// Watch for change sidebar vsibility => scroll to selected note in tree
watch(() => settingsStore.settings.sidebar.visible, (visible) => {
  if(!visible){
    return
  }
  nextTick(() => {
    scrollToSelected(document.querySelector('nav'))
  })
})
</script>

<style scoped>
aside {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  max-width: calc(100% - var(--tetrad-minwidth-aside));
  min-width: var(--tetrad-minwidth-aside);
  overflow: hidden;
}
aside.not_found {
  background: var(--color-panel-error);
}
/**/
@media (max-width: 767px) {
  body.reverse_mobile aside {
    flex-direction: column-reverse;
  }
}
</style>
