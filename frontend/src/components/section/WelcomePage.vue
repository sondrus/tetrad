<template>
  
  <article class="loading" v-if="!notesStore.loaded">{{$t('welcome.loading')}}</article>

  <article ref="refArticle" v-else>
    <p>
      <span><strong>{{$t('welcome.database')}}:</strong></span>
      &nbsp;
      <span :title="dbStore.dbPath">{{ dbStore.dbName }}</span>
      &nbsp;
      <span v-if="dbStore.dbSize > 0">({{ dbStore.dbSizeFormatted }})</span>
      &nbsp;
      <span class="link" @click="dbStore.dbOptimize" v-if="dbStore.dbSize > 0">{{ $t('welcome.db_optimize') }}</span>
      &nbsp;
      <span class="link" @click="dbStore.dbDownload" v-if="dbStore.dbSize > 0">{{ $t('welcome.db_download') }}</span>
    </p>
    
    <p>
      <span><strong>{{$t('welcome.total_notes')}}:</strong></span>
      &nbsp;
      <span>{{ notesStore.notesMap.size }}</span>
    </p>

    <WelcomeItems
      :title="$t('welcome.favorite_notes')"
      :items="notesStore.getFavorites(settingsStore.settings.welcome.itemsCount).value"
      :compact="isCompact"
      />

    <WelcomeItems
      :title="$t('welcome.last_modified_notes')"
      :items="notesStore.getLatest('dateModified', settingsStore.settings.welcome.itemsCount).value"
      :compact="isCompact"
      />

    <WelcomeItems
      :title="$t('welcome.last_added_notes')"
      :items="notesStore.getLatest('dateCreated', settingsStore.settings.welcome.itemsCount).value"
      :compact="isCompact"
      />

  </article>

</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

import { useDbStore } from '@/stores/dbStore';
import { useNotesStore } from '@/stores/notesStore';
import { useSettingsStore } from '@/stores/settingsStore';

import WelcomeItems from '@/components/section/WelcomeItems.vue';

const dbStore = useDbStore();
const notesStore = useNotesStore();
const settingsStore = useSettingsStore();

const refArticle = ref<HTMLElement>();

const isCompact = computed(() => settingsStore.widthClientArea <= 360)
</script>

<style scoped>
article {
  height: 100%;
  overflow: auto;
  padding: var(--tetrad-content-padding);
}
p {
  margin-bottom: 10px;
}
.notes_list {
  margin: 20px 0;
}
h3 {
  margin-bottom:10px;
}
span.link {
  color: var(--color-a);
  cursor: pointer;
  text-decoration: underline;
}
@media (hover: hover) and (pointer: fine) {
  span.link:hover {
    text-decoration: none;
  }
}
span.link:active {
  text-decoration: none;
}
</style>
