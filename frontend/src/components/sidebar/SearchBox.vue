<template>
  <div>
    <input type="text" ref="searchBox" v-model="searchStore.searchText"
      :placeholder="$t('search.placeholder')" />
    
    <button ref="clearButton" class="icon clear"
      v-if="searchStore.searchText.length"
      :title="$t('search.clear')"
      @click="clearSearchBox"
    ></button>

    <span>
      
      <button :class="['title', 'icon', 'label', {
        activated: settingsStore.settings.search.title 
      }]"
        :title="$t('search.just_in_titles')"
        @click="actionsStore.search.searchInTitles"
      ></button>
      
      <button :class="['whole', 'icon', 'space', {
        activated: settingsStore.settings.search.whole 
      }]"
        :title="$t('search.whole_phrases')"
        @click="actionsStore.search.searchWholePhrase"
      ></button>

    </span>
    
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import { useSearchStore } from '@/stores/searchStore'
import { useActionsStore } from '@/stores/actionsStore'

const settingsStore = useSettingsStore()
const searchStore = useSearchStore()
const actionsStore = useActionsStore()

const searchBox = ref<HTMLInputElement>()
const clearButton = ref<HTMLButtonElement>()

// Transfer input ref to store
onMounted(() => {
  if(!searchBox.value){
    return
  }
  searchStore.setInput(searchBox.value);
})

// Clear input
const clearSearchBox = () => {
  searchBox.value?.focus()
  searchStore.searchText = ''
}
</script>

<style scoped>
div {
  background-color: var(--tetrad-panel);
  border-bottom: 1px solid var(--color-panel-border);
  display: flex;
  flex: 0 0 calc(var(--tetrad-height-header) + 4px);
  place-items: center;
}
div:has(:focus) {
  background-color: var(--color-input-bg);
}
aside.not_found div {
  background-color: transparent;
}
div > span {
  display: flex;
  height: 100%;
  margin-right: 2px;
  place-items: center;
}
input[type=text] {
  background-color: transparent;
  border: none;
  height: 100%;
  margin-right: 2px;
  outline: none;
  padding: 0 6px;
  width: 100%;
}
button {
  background: transparent no-repeat center center / var(--tetrad-height-icons-s);
  border: 1px solid transparent;
  cursor: pointer;
  height: 80%;
  margin: 2px;
  margin-left: 0;
  width: 28px;
}
@media (hover: hover) and (pointer: fine) {
  button:hover {
    background-color: var(--color-special-btn-bg);
    border: 1px solid var(--color-btn-border);
  }
}
button:active {
  background-color: var(--color-special-btn-bg);
  border: 1px solid var(--color-btn-border);
}
button.activated {
  background-color: var(--color-special-btn-bg);
  border: 1px solid var(--color-btn-border);
}
/**/
@media (max-width: 767px) {
  body.reverse_mobile div {
    border-bottom: none;
    border-top: 1px solid var(--color-panel-border);
  }
}
</style>
