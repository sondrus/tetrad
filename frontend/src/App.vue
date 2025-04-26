<template>
  <main v-show="notesStore.loaded && settingsStore.loaded">

    <header>
      <MainButtons />
      <NoteTitle v-if="settingsStore.widthWindow >= 768" />
      <EmptySpace v-if="settingsStore.widthWindow < 768" />
      <MainMenu />
    </header>

    <section>
      <SidebarPanel />
      <SidebarSplitter />
      <ClientArea />
    </section>

    <StatusBar />

    <AllPopups/>

  </main>

  <div class="error" v-if="notesStore.loadError">{{$t('error.loading')}}</div>

</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, onBeforeUnmount } from 'vue'

import { useLogStore } from '@/stores/logStore'
import { useNotesStore } from '@/stores/notesStore'
import { useAboutStore } from '@/stores/aboutStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useHotkeysStore } from '@/stores/hotkeysStore'

import MainButtons from '@/components/header/MainButtons.vue'
import NoteTitle from '@/components/header/NoteTitle.vue'
import EmptySpace from '@/components/header/EmptySpace.vue'
import MainMenu from '@/components/header/MainMenu.vue'

import SidebarPanel from '@/components/sidebar/SidebarPanel.vue'
import SidebarSplitter from '@/components/sidebar/SidebarSplitter.vue'
import ClientArea from '@/components/section/ClientArea.vue'
import StatusBar from '@/components/footer/StatusBar.vue'

import AllPopups from '@/components/popup/AllPopups.vue'

const logStore = useLogStore()
const notesStore = useNotesStore()
const aboutStore = useAboutStore()
const hotkeysStore = useHotkeysStore()
const settingsStore = useSettingsStore()

// Load data at startup
onBeforeMount(() => {
  logStore.loadFromStorage()
  notesStore.loadNotes()
  aboutStore.loadData()
  settingsStore.loadSettings()
  hotkeysStore.initHandler()
});

onMounted(() => {
  document.addEventListener('click', onLinkClick);
  window.addEventListener('hashchange', onHashChange);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onLinkClick);
  window.removeEventListener('hashchange', onHashChange);
});

// Handler click on internal link (referred to another note)
const onLinkClick = (event: Event) => {
  const target = (event.target as HTMLElement).closest('a');
  if(!target){
    return
  }

  if(target.tagName !== 'A') {
    return;
  }

  // Check if <a> has `data-note-id="123"`
  const noteIdFromData = (target.getAttribute('data-note-id') ?? '')
  if(noteIdFromData.match(/^\d+$/)){
    event.preventDefault()
    notesStore.setCurrent(parseInt(noteIdFromData), true)
  }

  // Check hash is set
  const hash = target.getAttribute('href') ?? ''
  if(!hash.length || hash === '#'){
    return
  }

  // Check if <a> has `href="@123"` or `href="#123"`
  const noteIdFromHash = hash.replace(/^[@#]/, '')
  if(noteIdFromHash.match(/^\d+$/)){
    event.preventDefault()
    notesStore.setCurrent(parseInt(noteIdFromHash), true)
  }

  // Check if <a> has `href="#header-x"`
  if(hash.length){
    const target = document.querySelector(hash) as HTMLElement
    if(target){
      event.preventDefault()
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

};

// Handler for hashchange
const onHashChange = () => {
  location.hash = '';
}

// Consider mobile device keyboard open
// ToDo: improve for all mobile devices
function updatePropertyVh() {
  const vh = (window.visualViewport ? window.visualViewport.height : window.innerHeight) / 100;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', updatePropertyVh)
window.addEventListener('orientationchange', updatePropertyVh)
onMounted(() => {
  updatePropertyVh()
});
</script>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
header {
  background: var(--tetrad-panel);
  display: flex;
  flex: 0 0 0%;
  padding: 4px 8px;
  place-items: center;
}
section {
  border-bottom: 1px solid var(--color-panel-border);
  border-top: 1px solid var(--color-panel-border);
  display: flex;
  flex: 1 0 0%;
  overflow: hidden;
}
.error {
  color: red;
  font-family: monospace;
  height: 100%;
  padding: 20px;
  user-select: text;
}
/**/
@media (max-width: 767px) {
  body.reverse_mobile main {
    flex-direction: column-reverse;
  }
}
</style>
