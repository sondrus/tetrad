<template>
  <div>{{ dbStore.dbSizeFormatted }}</div>
</template>

<script setup lang="ts">
import { useDbStore } from '@/stores/dbStore';
const dbStore = useDbStore();
</script>

<style scoped>

</style>
