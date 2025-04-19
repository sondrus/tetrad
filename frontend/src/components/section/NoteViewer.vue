<template>
  <div class="note_viewer">
    
    <iframe ref="refIFrame" :src="iframeSrc"
      v-show="isIFrameVisible"
    ></iframe>

    <article ref="refContainer" id="__note__" tabindex="0"
      v-show="!isIFrameVisible"
      :class="['preview', {
        nopadding: noPadding,
        prewrap: preWrap,
      }]"
    ></article>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

import { markdownIt, highlightCode } from '@/services/markdown'
import { copyToClipboard } from '@/utils/clipboard'
import { executeScripts } from '@/utils/scripts'
import { useSettingsStore } from '@/stores/settingsStore'
import { useHotkeysStore } from '@/stores/hotkeysStore'
import { useNotesStore } from '@/stores/notesStore'
import { i18n } from '@/i18n'

const settingsStore = useSettingsStore()
const hotkeysStore = useHotkeysStore()
const notesStore = useNotesStore()

const refIFrame = ref<HTMLIFrameElement>()
const refContainer = ref<HTMLElement>()

// Check current note is URL
const isIFrameVisible = computed(() => {
  return ['URL', 'IFRAME'].includes(notesStore.current.type);
});

// Get current iframe src
const iframeSrc = computed(() => {
  if(!isIFrameVisible.value){
    return 'about:blank';
  }
  if(notesStore.current.type === 'IFRAME'){
    return `/iframe/${notesStore.current.id}?t=${notesStore.current.dateModified}`;
  }
  return notesStore.current.url
});

// Check if article has no padding
const noPadding = computed(() => {
  return ['HTML', 'CODE', 'TEXT'].includes(notesStore.current.type)
});

// Check is activated line wrap for <pre> in viewer
const preWrap = computed(() => settingsStore.settings.viewer.prewrap);

// Handler for changes note
watch(() => notesStore.current.contents, (contents) => {
  // Clear HTML
  refContainer.value!.innerHTML = '';

  switch(notesStore.current.type){
    case 'HTML':
      renderHtml(contents)
      break
    case 'IFRAME':
      // nothing
      break
    case 'CODE':
      renderCode(contents)
      break
    case 'TEXT':
      renderText(contents)
      break
    default:
      renderMarkdown(contents)
      break
  }
});

const renderMarkdown = (markdown: string) => {
  // Convert markdown to HTML and put to <article>
  refContainer.value!.innerHTML = markdownIt.render(markdown);

  // Disable checkboxes
  refContainer.value?.querySelectorAll('.checkbox_wrapper input[type=checkbox]')
    .forEach((checkbox)=>{
      (checkbox as HTMLInputElement).disabled = true
    })

  // Execute all <script> tags in HTML
  if(settingsStore.settings.viewer.executeScripts){
    executeScripts(refContainer.value!);
  }
}

const renderHtml = (html: string) => {
  // Directly set HTML without conversion
  refContainer.value!.innerHTML = html;
  
  // Execute all <script> tags in HTML (always)
  executeScripts(refContainer.value!);
}

const renderCode = (code: string) => {
  const syntax = (notesStore.current.syntax ?? '').toLowerCase()
  refContainer.value!.innerHTML = highlightCode(code, syntax, 'fullpage');
}

const renderText = (text: string) => {
  const syntax = 'plain'
  const numbers = false
  refContainer.value!.innerHTML = highlightCode(text, syntax, 'fullpage plaintext', numbers);
}

// Copying code on button click

onMounted(() => {
  refContainer.value?.addEventListener('click', copyCodeOnClick);
  window.addEventListener("message", handleIFrameMessage);
})

onBeforeUnmount(() => {
  refContainer.value?.removeEventListener('click', copyCodeOnClick)
  window.removeEventListener("message", handleIFrameMessage);
})

const copyCodeOnClick = (event: MouseEvent) => {
  const button = event.target as HTMLButtonElement
  if(!button || button.tagName !== 'BUTTON'){
    return;
  }

  const pre = button.parentNode as HTMLPreElement;
  if(!pre || pre.tagName != 'PRE'){
    return;
  }

  const code = pre.querySelector(':scope > code') as HTMLElement;
  if(!code){
    return;
  }

  copyToClipboard(code.innerText, (success) => {
    button.innerText = i18n.global.t(`clipboard.${success ? 'success' : 'error'}`);
    button.classList.add('active');
    setTimeout(() => {
      button.innerText = i18n.global.t('clipboard.copy');
      button.classList.remove('active');
    }, 1500);
  });
}

// Watch for edit mode is changed to `off` => set focus to <article>
watch(() => settingsStore.settings.editor.editMode, (newValue, oldValue) => {
  if(newValue === false && oldValue === true) {
    refContainer.value?.focus();
    if(isIFrameVisible.value){
      refIFrame.value?.focus();
    }
  }
});

// Handle message from iframe
const handleIFrameMessage = (event: MessageEvent)  => {
  // Security check
  if(event.origin !== location.origin){
    return
  }

  const iframeDocument = (event.source as Window).document;
  const payload = event.data.payload

  // Initialize <iframe>
  if(event.data.action === 'tetrad_init'){

    /* release (app) */
    document.querySelectorAll('link[rel="stylesheet"][href]').forEach(link => {
      const newLink = iframeDocument.createElement('link')
      newLink.setAttribute('rel', 'stylesheet')
      newLink.setAttribute('href', link.getAttribute('href') ?? '')
      iframeDocument.head.appendChild(newLink)
    })

    /* debug (vite), just 4 css: base.css, main.css, icons.css, codemirror.css */
    let max = 5;
    document.querySelectorAll('style').forEach(style => {
      if(--max <= 0){
        return
      }
      if(style.id.length){ // stylebot-css-* and others
        return
      }
      const newStyle = iframeDocument.createElement('style');
      newStyle.textContent = style.textContent
      iframeDocument.head.appendChild(newStyle)
    })

    // focus
    setTimeout(() => {
      refIFrame.value?.focus();
      iframeDocument.body.focus()
    }, 500)

  }

  // Handle keydown
  else if (event.data.action === 'tetrad_keydown'){
    payload.event.preventDefault = () => {}; // we cannot pass it through `postMessage`
    hotkeysStore.handleHotKey(payload.event)
  }

}
</script>

<style scoped>
.note_viewer {
  display: none;
}
.note_viewer.visible {
  display: block;
  overflow: hidden;
  position: relative;
}
.mainmenu_opened .note_viewer:has(>iframe:not([src="about:blank"])).visible:after,
.splitter_dragging .note_viewer:has(>iframe:not([src="about:blank"])).visible:after {
  content: '';
  height: 100%;
  left: 0;
  background: transparent;
  position: absolute;
  top: 0;
  width: 100%;
}
.horizontal .note_viewer.visible {
  height: 50%;
}
/* content */
iframe {
  border: none;
  height: 100%;
  width: 100%;
}
article {
  height: 100%;
  overflow: auto;
  padding: var(--tetrad-content-padding);
  position: relative;
  width: 100%;
  word-wrap: break-word;
  word-break: break-word;
}
article:empty {
  background-color: var(--color-panel-bg-light);
}
/* nopadding-mode (HTML, CODE, TEXT)*/
article.nopadding {
  padding: 0;
}
</style>
