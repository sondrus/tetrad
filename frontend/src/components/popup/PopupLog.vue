<template>
  <Teleport to="body">

    <dialog ref="refDialog"
      @close="logStore.closeDialog()"
      @cancel="logStore.closeDialog()"
    >
    <div class="inner">

        <PopupHeader :title="$t('popup_log.header')" />

        <div class="contents">

          <div v-for="log in logStore.allLogs" :key="log.timestamp" :class="log.type">
            <span class="timestamp">[{{ logStore.formatDate(log.timestamp) }}] </span>
            <span class="message">{{ log.message }}</span>
          </div>

        </div>

        <PopupFooter :actions="popupButtons" />

      </div>
    </dialog>

  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import PopupHeader from '@/components/popup/parts/PopupHeader.vue'
import PopupFooter from '@/components/popup/parts/PopupFooter.vue'

import { i18n } from '@/i18n'

import { useLogStore } from '@/stores/logStore'

const logStore = useLogStore()

// Prepare settings
const refDialog = ref<HTMLDialogElement>()

// Popup buttons
const popupButtons = [
  {
    lang: 'button.ok',
    icon: 'check',
    onClick: () => logStore.closeDialog(),
  },
  {
    lang: 'popup_log.btn_clear',
    icon: 'delete',
    onClick: () => {
      if(confirm(i18n.global.t('popup_log.clear_confirm'))) {
        logStore.clear()
        logStore.closeDialog()
      }
    }
  },
]

// Auto open when isOpen=true and auto close when isOpen=false
watch(() => logStore.isOpen, (isOpen) => {
    if (!refDialog.value) {
      return
    }
    // Open
    if (isOpen && !refDialog.value.open) {
      refDialog.value.showModal()
    }
    // Close
    else if (!isOpen && refDialog.value.open) {
      refDialog.value.close()
    }
  },
)
</script>

<style scoped>
dialog {
  height: 400px;
  width: 800px;
}
dialog .contents {
  font-size: 90%;
  font-family: monospace;
  user-select: text;
}
div.info {
  color: var(--color-text-errorinfo);
}
div.warning {
  color: var(--color-text-warning);
}
div.error {
  color: var(--color-text-error);
}
</style>
