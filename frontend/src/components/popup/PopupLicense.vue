<template>
  <Teleport to="body">

    <dialog ref="refDialog"
      @close="aboutStore.closeLicenseDialog()"
      @cancel="aboutStore.closeLicenseDialog()"
    >
      <div class="inner">

        <PopupHeader :title="$t('popup_license.header')" />

        <div class="contents license_text" v-html="aboutStore.getLicenseText"></div>

        <PopupFooter :actions="popupButtons" />
        
      </div>
    </dialog>

  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import PopupHeader from '@/components/popup/parts/PopupHeader.vue'
import PopupFooter from '@/components/popup/parts/PopupFooter.vue'

import { useAboutStore } from '@/stores/aboutStore'

const aboutStore = useAboutStore()

// Prepare settings
const refDialog = ref<HTMLDialogElement>()

// Popup buttons
const popupButtons = [
  {
    lang: 'btn_ok',
    icon: 'check',
    onClick: () => aboutStore.closeLicenseDialog(),
  },
]

// Auto open when isOpenLicense=true and auto close when isOpenLicense=false
watch(() => aboutStore.isOpenLicense, (isOpenLicense) => {
    if (!refDialog.value) {
      return
    }
    // Open
    if (isOpenLicense && !refDialog.value.open) {
      refDialog.value.showModal()
    }
    // Close
    else if (!isOpenLicense && refDialog.value.open) {
      refDialog.value.close()
    }
  },
)
</script>

<style scoped>
dialog {
  height: 480px;
  width: 720px;
}
</style>

<style>
.license_text {
  font-size: 90%;
}
.license_text > p {
  font-family: monospace;
  user-select: text;
  white-space: pre-wrap;
}
.license_text > p:first-child {
  margin-top: 0;
}
.license_text > * {
  margin: 10px 0;
}
.license_text ul {
  padding: 0 0 0 20px;
  white-space: normal;
}
.license_text ul li {
  margin-bottom: 10px;
}
</style>
