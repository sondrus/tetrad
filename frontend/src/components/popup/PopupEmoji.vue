<template>
  <Teleport to="body">

    <dialog ref="refDialog"
      @close="emojiStore.closeDialog()"
      @cancel="emojiStore.closeDialog()"
    >
      <div class="inner">

        <PopupHeader :title="$t('popup_emoji.header')" />

        <div class="contents" @click="handleEmojiClick">

          <div :key="group"
            v-for="(emojis, group) in emojiStore.emojiGroups"
          >
            <h4>
              <span class="first-letter">{{ Array.from($t(`emoji.${group}`))[0] }}</span>
              {{ Array.from($t(`emoji.${group}`)).slice(1).join('') }}
            </h4>
            <span :key="emoji"
              v-for="emoji in emojis"
            >{{ emoji }}</span>
            <hr/>
          </div>

        </div>

        <PopupFooter :actions="popupButtons">
          <input ref="emojiSelected" type="text" value="" max-length="255" />
        </PopupFooter>

      </div>
    </dialog>

  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import PopupHeader from '@/components/popup/parts/PopupHeader.vue'
import PopupFooter from '@/components/popup/parts/PopupFooter.vue'

import { useEmojiStore } from '@/stores/emojiStore'

const emojiStore = useEmojiStore()

// Prepare settings
const refDialog = ref<HTMLDialogElement>()

// Selected emoji as text
const emojiSelected = ref<HTMLInputElement>();

// Popup buttons
const popupButtons = [
  {
    lang: 'button.ok',
    icon: 'check',
    onClick: () => {
      emojiStore.emoji = emojiSelected.value?.value ?? '';
      emojiStore.closeDialog()
    }
  },
  {
    lang: 'button.cancel',
    icon: 'cancel',
    onClick: () => emojiStore.closeDialog(),
  },
]

// Auto open when isOpen=true and auto close when isOpen=false
watch(() => emojiStore.isOpen, (isOpen) => {
    if (!refDialog.value) {
      return
    }
    // Open
    if (isOpen && !refDialog.value.open) {
      refDialog.value.showModal();
      (emojiSelected.value as HTMLInputElement).value = ''
    }
    // Close
    else if (!isOpen && refDialog.value.open) {
      refDialog.value.close()
    }
  },
)

// Handle select emoji
const handleEmojiClick = (event: Event) => {
  const target = event.target as HTMLElement
  if(target.tagName !== 'SPAN'){
    return
  }

  const emoji = target.textContent ?? '';

  (emojiSelected.value as HTMLInputElement).value += emoji
}
</script>

<style scoped>
dialog {
  height: 540px;
  width: 960px;
}
.contents {
  font-size: 1.5rem;
  user-select: text;
}
.contents > div + div{
  margin-top: 15px;
}
.contents > div h4 {
  cursor: default;
  font-size: 1.2rem;
  font-weight: bold;
  margin: 15px 0;
}
.contents > div h4:first-child {
  margin-top: 0;
}
.contents > div span {
  cursor: pointer;
  display: inline-block;
  margin: 0 8px 8px 0;
}
.contents > div hr {
  margin: 15px 0;
}
.contents > div:last-child hr {
  display: none;
}
input[type=text] {
  font-size: 1.5rem;
}
</style>
