<template>
  <div :title="dbStore.dbPath">{{ dbStore.dbName }}</div>
</template>

<script setup lang="ts">
import { useDbStore } from '@/stores/dbStore';
const dbStore = useDbStore();
</script>

<style scoped>

</style>
