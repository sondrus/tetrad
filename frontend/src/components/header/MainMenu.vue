<template>
  <div class="mainmenu-container">
    <div class="hamburger icon" @click.stop="toggleMenu"></div>
    <Teleport to="body">
      <div v-if="isOpen" class="mainmenu" ref="mainmenu">
        <ul>

          <li>
            <div class="block">
              <div class="block_inner">

                <button
                  @click="actionsStore.note.addRoot"
                >{{$t('menu.add_root')}}</button>

                <template v-if="notesStore.isNoteOpened">

                  <hr/>
                  <button
                    @click="actionsStore.note.addNear"
                  >{{$t('menu.add_near')}}</button>

                  <hr/>
                  <button
                    @click="actionsStore.note.addChild"
                  >{{$t('menu.add_child')}}</button>
                </template>

              </div>
            </div>
          </li>

          <li></li>
          <li>
            <button
              @click="actionsStore.view.toggleSidebar"
              :class="{selected: settingsStore.isSidebar()}"
            >{{$t('menu.sidebar')}}</button>
          </li>

          <li>
            <div class="block">
              <div class="block_inner">

                <button class="btn_singleline"
                  @click="actionsStore.treeview.singleline"
                  :class="{selected: !settingsStore.settings.treeview.multiline}"
                >{{$t('menu.treeview_singleline')}}</button>

                <button class="btn_multilinel"
                  @click="actionsStore.treeview.multiline"
                  :class="{selected: settingsStore.settings.treeview.multiline}"
                >{{$t('menu.treeview_multiline')}}</button>

              </div>
            </div>
          </li>

          <template v-if="settingsStore.isSidebar()">
            <li></li>
            <li>
              <div class="block">
                <div class="block_inner">

                  <button class="btn_expand_all"
                    @click="actionsStore.treeview.expandAll"
                  >{{$t('menu.expand_all')}}</button>

                  <button class="btn_collapse_all"
                    @click="actionsStore.treeview.collapseAll"
                  >{{$t('menu.collapse_all')}}</button>

                </div>
              </div>
            </li>
          </template>

          <template v-if="notesStore.isEditable">
            <li></li>
            <li>
              <div class="block">
                <div class="block_inner">

                  <button class="btn_doublepanel_off"
                    @click="actionsStore.view.modeDefault"
                    :class="{selected: isDoublePanelOff}"
                  >{{$t('menu.mode_default')}}</button>

                  <button class="btn_doublepanel_vertical"
                    @click="actionsStore.view.modeVertical"
                    :class="{selected: isDoublePanelVertical}"
                  >{{$t('menu.mode_vertical')}}</button>

                  <button class="btn_doublepanel_horizontal"
                    @click="actionsStore.view.modeHorizontal"
                    :class="{selected: isDoublePanelHorizontal}"
                  >{{$t('menu.mode_horizontal')}}</button>

                </div>
              </div>
            </li>
          </template>

          <template v-if="notesStore.isEditable && !settingsStore.settings.doublePanel.enabled">
            <li></li>
            <li>
              <div class="block">
                <div class="block_inner">

                  <button class="btn_viewer"
                    @click="actionsStore.view.showViewer"
                    :class="{
                      selected: !settingsStore.isEditMode()
                    }"
                  >{{$t('menu.viewer')}}</button>

                  <button class="btn_editor"
                    @click="actionsStore.view.showEditor"
                    :class="{
                      selected: settingsStore.isEditMode()
                    }"
                  >{{$t('menu.editor')}}</button>

                  <hr/>

                  <button class="btn_autoview"
                    @click="actionsStore.view.toggleAutoView()"
                    :class="{selected: settingsStore.isAutoView()}"
                  >{{$t('menu.auto_viewer')}}</button>

                </div>
              </div>
            </li>
          </template>

          <template v-if="!settingsStore.isEditMode() || settingsStore.settings.doublePanel.enabled">
            <li></li>
            <li>
              <button class="btn_linewrap"
                @click="actionsStore.view.toggleViewerPreWrap"
                :class="{selected: settingsStore.isViewerPreWrap()}"
              >{{$t('menu.pre_wrap')}}</button>
            </li>
          </template>

          <template v-if="settingsStore.isEditMode() || settingsStore.settings.doublePanel.enabled">
            <li></li>
            <li>
              <button class="btn_linewrap"
                @click="actionsStore.view.toggleEditorLineWrap"
                :class="{selected: settingsStore.isEditorLineWrap()}"
              >{{$t('menu.line_wrap')}}</button>
            </li>
          </template>

          <template v-if="settingsStore.widthWindow <= 767">
            <li></li>
            <li>
              <button
                @click="actionsStore.view.toggleReverseMobileInterface"
                :class="{selected: settingsStore.isReverseMobileInterface()}"
              >{{$t('menu.reverse_mobile_interface')}}</button>
            </li>
          </template>

          <template v-if="settingsStore.isEditMode() || settingsStore.settings.doublePanel.enabled">
            <li></li>
            <li>
              <button
                @click="actionsStore.general.showEmojiSelector"
              >{{$t('menu.emoji')}}</button>
            </li>
          </template>

          <li></li>
          <li>
            <div class="block">
              <div class="block_inner block_auto">

                <button
                  @click="settingsStore.settings.language = 'en'"
                  :class="['flag', 'flag-en', {
                    selected: settingsStore.settings.language === 'en'
                  }]"
                >EN</button>

                <button
                  @click="settingsStore.settings.language = 'ru'"
                  :class="['flag', 'flag-ru', {
                    selected: settingsStore.settings.language === 'ru'
                  }]"
                >RU</button>

                <button
                  @click="settingsStore.settings.language = 'cn'"
                  :class="['flag', 'flag-cn', {
                    selected: settingsStore.settings.language === 'cn'
                  }]"
                >CN</button>

                <button
                  @click="settingsStore.settings.language = 'hi'"
                  :class="['flag', 'flag-hi', {
                    selected: settingsStore.settings.language === 'hi'
                  }]"
                >HI</button>

                <button
                  @click="settingsStore.settings.language = 'es'"
                  :class="['flag', 'flag-es', {
                    selected: settingsStore.settings.language === 'es'
                  }]"
                >ES</button>

                <button
                  @click="settingsStore.settings.language = 'eg'"
                  :class="['flag', 'flag-eg', {
                    selected: settingsStore.settings.language === 'eg'
                  }]"
                >EG</button>

                <button
                  @click="settingsStore.settings.language = 'jp'"
                  :class="['flag', 'flag-jp', {
                    selected: settingsStore.settings.language === 'jp'
                  }]"
                >JP</button>

                <button
                  @click="settingsStore.settings.language = 'ko'"
                  :class="['flag', 'flag-ko', {
                    selected: settingsStore.settings.language === 'ko'
                  }]"
                >KO</button>

                <button
                  @click="settingsStore.settings.language = 'bn'"
                  :class="['flag', 'flag-bn', {
                    selected: settingsStore.settings.language === 'bn'
                  }]"
                >BN</button>

                <button
                  @click="settingsStore.settings.language = 'br'"
                  :class="['flag', 'flag-br', {
                    selected: settingsStore.settings.language === 'br'
                  }]"
                >BR</button>

                <button
                  @click="settingsStore.settings.language = 'it'"
                  :class="['flag', 'flag-it', {
                    selected: settingsStore.settings.language === 'it'
                  }]"
                >IT</button>

                <button
                  @click="settingsStore.settings.language = 'fr'"
                  :class="['flag', 'flag-fr', {
                    selected: settingsStore.settings.language === 'fr'
                  }]"
                >FR</button>

                <button
                  @click="settingsStore.settings.language = 'de'"
                  :class="['flag', 'flag-de', {
                    selected: settingsStore.settings.language === 'de'
                  }]"
                >DE</button>

                <button
                  @click="settingsStore.settings.language = 'tr'"
                  :class="['flag', 'flag-tr', {
                    selected: settingsStore.settings.language === 'tr'
                  }]"
                >TR</button>

              </div>
            </div>
          </li>

          <li></li>
          <li>
            <button @click="actionsStore.general.showMessageLog">
              {{$t('menu.log')}}
            </button>
          </li>

          <template v-if="notesStore.isNoteOpened">
            <li></li>
            <li>
              <button @click="actionsStore.general.goToWelcomePage">
                {{$t('menu.welcome')}}
              </button>
            </li>
          </template>

          <li></li>
          <li>
            <button @click="actionsStore.general.showAbout">
              {{$t('menu.about')}}
            </button>
          </li>

        </ul>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore';
import { useNotesStore } from '@/stores/notesStore';
import { useActionsStore } from '@/stores/actionsStore';

const settingsStore = useSettingsStore();
const notesStore = useNotesStore();
const actionsStore = useActionsStore();

// Open/close menu

const isOpen = ref(false)

const mainmenu = ref<HTMLElement>()

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

onMounted(() => {
  document.addEventListener('mousedown', onMouseDown)
  document.addEventListener('touchstart', onMouseDown)
  document.addEventListener('click', onButtonClick)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onMouseDown)
  document.removeEventListener('touchstart', onMouseDown)
  document.removeEventListener('click', onButtonClick)
})

// Close menu on outside click/touch
const onMouseDown = (event: Event) => {
  if((event.target as HTMLElement).closest('.mainmenu')){
    return;
  }
  if((event.target as HTMLElement).closest('.hamburger')){
    return;
  }
  isOpen.value = false
}

// Close menu on any menuitem click (just if left-click)
const onButtonClick = (event: Event) => {
  if(event.target && (event.target as HTMLElement).tagName === 'BUTTON'){
    if((event as PointerEvent).button === 0){
      isOpen.value = false
    }
  }
}

// Settings in menu
const isDoublePanelOff = computed(() => {
  return !settingsStore.settings.doublePanel.enabled;
})

const isDoublePanelVertical = computed(() => {
  return settingsStore.settings.doublePanel.enabled && settingsStore.settings.doublePanel.vertical;
})

const isDoublePanelHorizontal = computed(() => {
  return settingsStore.settings.doublePanel.enabled && !settingsStore.settings.doublePanel.vertical;
})

// On open/close add `mainmenu_opened` to <body>
watch(() => isOpen.value, (isOpen) => {
  document.body.classList.toggle('mainmenu_opened', isOpen)
})
</script>

<style scoped>
.mainmenu-container {
  flex: 0 0 var(--tetrad-height-header);
  position: relative;
}
.hamburger {
  background-repeat: no-repeat;
  background-position: center center;
  background-size: var(--tetrad-height-header);
  cursor: pointer;
  height: var(--tetrad-height-header);
  margin-right: 4px;
  text-align: center;
  transition: 0.25s;
}
.mainmenu_opened .hamburger {
  transform: rotate(180deg)
}
@media (hover: hover) and (pointer: fine) {
  .hamburger:hover {
    opacity: 0.8;
  }
}
.mainmenu {
  background: var(--color-panel-bg);
  border: 1px solid var(--color-panel-border);
  border-radius: var(--tetrad-border-radius);
  box-shadow: var(--tetrad-block-shadow);
  max-height: calc(100% - var(--tetrad-height-header) - 20px);
  max-width: 320px;
  min-width: 220px;
  overflow: auto;
  position: absolute;
  top: calc(var(--tetrad-height-header) + 12px);
  right: 3px;
  padding: 2px;
  z-index: 100;
}
.mainmenu ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.mainmenu li {
  line-height: 100%;
  margin: 2px 0;
  white-space: nowrap;
}
.mainmenu li:empty {
  border-bottom: 1px solid var(--color-panel-border);
  height: 0;
  padding: 0;
}
.mainmenu li button {
  background: transparent;
  border: none;
  display: block;
  font-size: 1rem;
  padding: 5px 10px;
  text-align: left;
  width: 100%;
}
@media (hover: hover) and (pointer: fine) {
  .mainmenu li button:hover {
    background: var(--color-menuitem-highlight);
    color: var(--color-text-white);
  }
}
.mainmenu li button.selected {
  background: var(--color-menuitem-highlight);
  color: var(--color-text-white);
}
.mainmenu li hr {
  border: none;
  border-right: 1px solid #333;
  background: transparent;
}
/* block */
.mainmenu li .block_inner {
  display: flex;
  gap: 2px;
}
.mainmenu li .block_padding {
  padding: 5px 10px;
}
.mainmenu li .block .title {
  margin-bottom: 4px;
}
.mainmenu li .block_auto {
  flex-wrap: wrap;
}
.mainmenu li .block_auto button {
  width: auto;
}
/* menu hover */
@media (hover: hover) and (pointer: fine) {
  .mainmenu li .mainmenu:hover,
  .mainmenu li .mainmenu:hover li:empty {
    border-color: var(--color-panel-border-hover);
  }
}
/**/
@media (max-width: 767px) {
  body.reverse_mobile .mainmenu {
    bottom: calc(var(--tetrad-height-header) + 12px);
    top: auto;
  }
}
</style>
