<template>
  <Teleport to="body">

    <dialog ref="refDialog"
      @close="aboutStore.closeDialog()"
      @cancel="aboutStore.closeDialog()"
    >
      <div class="inner">

        <PopupHeader :title="$t('popup_about.header')" />

        <div class="contents">

          <div class="about_main">
            <div class="about_main-icon">
              <span class="icon logo"></span>
            </div>
            <div class="about_main-info">
              <div class="about_main-name">{{ aboutStore.app.name }}</div>
              <div class="about_main-version">
                {{ $t('popup_about.version') }} {{ aboutStore.app.version }}
              </div>
            </div>
          </div>

          <div class="about_more">
            <div class="about_more-item notes">
              {{ $t('popup_about.notes') }}
            </div>
            <div class="about_more-item site">
              Site: <a :href="aboutStore.app.site" target="_blank">{{ aboutStore.app.site }}</a>
            </div>
            <div class="about_more-item license">
              License: <a href="#" @click="aboutStore.showLicenseDialog">{{ aboutStore.app.licenseType }}</a>
            </div>
            <div class="about_more-item copyrights">
              {{ aboutStore.app.copyrights }}
            </div>
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

import { useAboutStore } from '@/stores/aboutStore'

const aboutStore = useAboutStore()

// Prepare settings
const refDialog = ref<HTMLDialogElement>()

// Popup buttons
const popupButtons = [
  {
    lang: 'button.ok',
    icon: 'check',
    onClick: () => aboutStore.closeDialog(),
  },
]

// Auto open when isOpen=true and auto close when isOpen=false
watch(() => aboutStore.isOpen, (isOpen) => {
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
  height: 340px;
  width: 480px;
}
.contents {
  user-select: text;
}
.about_main {
  display: flex;
  margin-bottom: 15px;
}
.about_main-icon {
  flex: 0 0 64px;
}
.about_main-icon .icon {
  background-size: contain;
  height: 100%;
  width: 100%;
}
.about_main-info {
  flex: 1 1 100%;
  padding-left: 20px;
}
.about_main-name {
  font-size: 32px;
  padding: 4px 0;
}
.about_main-version {
  color: var(--color-text-gray);
}
.about_more-item {
  margin-bottom: 10px;
}
.about_more-item:last-child {
  margin-bottom: 0;
}
</style>
