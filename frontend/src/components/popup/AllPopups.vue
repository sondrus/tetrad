<template>
  <div v-show="false">
    <PopupNote />
    <PopupParent />
    <PopupAbout />
    <PopupLicense />
    <PopupLog />
    <PopupEmoji />
  </div>
</template>

<script setup lang="ts">
import PopupNote from '@/components/popup/PopupNote.vue';
import PopupParent from '@/components/popup/PopupParent.vue';
import PopupAbout from '@/components/popup/PopupAbout.vue';
import PopupLicense from '@/components/popup/PopupLicense.vue';
import PopupLog from '@/components/popup/PopupLog.vue';
import PopupEmoji from '@/components/popup/PopupEmoji.vue';
</script>
