<template>
  <div class="splitter" ref="refSplitter"
    @mousedown="startDragMouse" @touchstart="startDragTouch"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

import { useSettingsStore } from '@/stores/settingsStore'

const settingsStore = useSettingsStore()

const refSplitter = ref<HTMLElement>()

let minSplitterWidth = 0

// Apply splitter styles
onMounted(() => {
  if (!refSplitter.value) {
    return
  }
  minSplitterWidth = parseInt(
    getComputedStyle(refSplitter.value).getPropertyValue('word-spacing')
  )
})

// Handler splitter drag (@mousedown)
const startDragMouse = (mouseEvent: MouseEvent) => {
  const minWidth = minSplitterWidth
  const maxWidth = window.innerWidth - minSplitterWidth

  const startX = mouseEvent.clientX
  const startWidth = settingsStore.settings.sidebar.width

  refSplitter.value?.classList.add('dragging')

  document.body.classList.add('splitter_dragging')

  const onMouseMove = (event: MouseEvent) => {
    const width = startWidth + event.clientX - startX
    settingsStore.settings.sidebar.width = Math.min(maxWidth, Math.max(minWidth, width))
  }

  const onMouseUp = () => {
    refSplitter.value?.classList.remove('dragging')
    document.body.classList.remove('splitter_dragging')
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

// Handler splitter drag (@touchstart)
const startDragTouch = (touchEvent: TouchEvent) => {
  const minWidth = minSplitterWidth
  const maxWidth = window.innerWidth - minSplitterWidth

  const startX = touchEvent.changedTouches[0].clientX
  const startWidth = settingsStore.settings.sidebar.width

  refSplitter.value?.classList.add('dragging')

  const onTouchStart = (touchEvent: TouchEvent) => {
    const width = startWidth + touchEvent.changedTouches[0].clientX - startX
    settingsStore.settings.sidebar.width = Math.min(maxWidth, Math.max(minWidth, width))
  }

  const onTouchEnd = () => {
    refSplitter.value?.classList.remove('dragging')
    window.removeEventListener('touchmove', onTouchStart)
    window.removeEventListener('touchend', onTouchEnd)
  }

  window.addEventListener('touchmove', onTouchStart)
  window.addEventListener('touchend', onTouchEnd)
}
</script>

<style scoped>
.splitter {
  background: var(--color-panel-border);
  cursor: move;
  flex: 0 0 1px;
  word-spacing: var(--tetrad-minwidth-aside); /* Not for intended purpose! */
  position: relative;
  z-index: 1;
}
.splitter:after {
  content: '';
  height: 100%;
  position: absolute;
  top: 0;
  right: -3px;
  left: -3px;
}
@media (hover: hover) and (pointer: fine) {
  .splitter:hover:after {
    background: var(--color-panel-border);
    opacity: 0.5;
  }
}
.splitter.dragging:after {
  background: var(--color-panel-border-hover);
  opacity: 0.5;
}
@media(pointer: coarse){
  .splitter:after {
    right: -5px;
    left: -5px;
  }
}
</style>
