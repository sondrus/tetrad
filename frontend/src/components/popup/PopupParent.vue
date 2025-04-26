<template>
  <Teleport to="body">

    <dialog ref="refDialog"
      @close="newNoteStore.closeSelectParent"
      @cancel="newNoteStore.closeSelectParent"
    >
      <div class="inner">
        <PopupHeader :title="$t('popup_parent.title')" />

        <div class="contents">

          <TreeView :selectMode="true" />

        </div>

        <PopupFooter :actions="popupButtons" />

      </div>
    </dialog>

  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import { useNewNoteStore } from '@/stores/newNoteStore'

import { scrollToSelected } from '@/utils/viewport.ts'

import PopupHeader from '@/components/popup/parts/PopupHeader.vue'
import PopupFooter from '@/components/popup/parts/PopupFooter.vue'

import TreeView from '@/components/sidebar/TreeView.vue'

const newNoteStore = useNewNoteStore()

// Prepare settings
const refDialog = ref<HTMLDialogElement>()

// Popup buttons
const popupButtons = [
  {
    lang: 'button.ok',
    icon: 'check',
    onClick: () => {
      newNoteStore.targetId = newNoteStore.targetIdSelected
      newNoteStore.closeSelectParent()
    },
  },
  {
    lang: 'button.cancel',
    icon: 'cancel',
    onClick: () => newNoteStore.closeSelectParent(),
  },
]

// Auto open when isOpen=true and auto close when isOpen=false
watch(() => newNoteStore.isOpenSelectParent, (isOpen) => {
    if (!refDialog.value) {
      return
    }

    // Open
    if (isOpen && !refDialog.value.open) {
      newNoteStore.noteData.type = newNoteStore.noteData.type || 'MD'
      refDialog.value.showModal()
      scrollToSelected(refDialog.value?.querySelector('nav') ?? null)
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
  height: 600px;
  width: 800px;
}
</style>
