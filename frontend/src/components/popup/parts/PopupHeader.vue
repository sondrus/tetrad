<template>
  <div class="header">
    <div>{{ props.title }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
}>()
</script>
