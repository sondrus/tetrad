<template>

  <li>

    <div
      ref="treeViewItem"
      :title="noteHint"
      :class="{
        expanded: isExpanded,
        selected: isSelected,
        empty: isEmpty,
        root: isRoot,
        url: isUrl,
        restricted: isRestricted, // for select parent
        found_y: isFound, // for search mode
        found_n: !isFound, // for search mode
      }"
      @mousedown="onMouseDown"
      @contextmenu="onContextMenu"
      @dblclick="onDblClick"
    > <!-- :data-note-id="(props.note?.id ?? 0)" -->
      <span :class="['expand', { is_parent: !!childCount }]" @mousedown="onDblClick()"
        v-if="!props.selectMode && !props.searchMode"></span>
      <span :class="['icon', {root: isRoot, folder: !!childCount, file: !childCount}]"></span>
      <span class="title"><span>{{ isRoot ? '--- Root ---' : props.note?.title }}</span></span>
      <span class="count" v-if="!!childCount">{{ childCount }}</span>
    </div>

    <ul v-if="isExpanded && !!childCount">
      <TreeViewItem v-for="child in props.note?.children" :key="child.id" :note="child"
        :selectMode="props.selectMode"
        :searchMode="!props.selectMode && searchStore.searchMode" />
    </ul>

  </li>

</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

import type { Note } from '@/models/note'
import { useNotesStore } from '@/stores/notesStore'
import { useNewNoteStore } from '@/stores/newNoteStore'
import { useSearchStore } from '@/stores/searchStore'

const newNoteStore = useNewNoteStore()
const notesStore = useNotesStore()
const searchStore = useSearchStore()

// Props
const props = defineProps<{
  searchMode: boolean,
  selectMode: boolean,
  note?: Note,
}>()

// Ref to current <div>
const treeViewItem = ref<HTMLDivElement | null>(null)

// Count note children
const countChildren = (notes?: Note[]): number =>
  notes?.reduce((sum, note) => sum + 1 + countChildren(note.children), 0) ?? 0

const noteHint = computed(() => `${props.note?.title} [${props.note?.id}]`)

const childCount = computed(() => countChildren(props.note?.children))

// Check if expanded
const isExpanded = computed(() => {
  if(props.searchMode){
    return true;
  }
  if(props.selectMode){
    return true;
  }
  return props.note?.expanded;
});

// Check if root item
const isRoot = computed(() => {
  if(!props.note){
    return true
  }
  return false;
})

// Check if selected
const isSelected = computed(() => {
  if(props.selectMode){
    return (props.note?.id ?? 0) === newNoteStore.targetIdSelected // `0` is `root`
  }
  return props.note?.selected
})

// Check if URL
const isUrl = computed(() => {
  return props.note?.type === 'URL'
});

// Check if empty
const isEmpty = computed(() => {
  return props.note?.contentsLength === 0 && props.note?.type !== 'URL'
});

// Check if restricted for selection
const isRestricted = computed(() => {
  if(!props.selectMode){
    return false;
  }
  if(!props.note?.left || !props.note?.right){
    return false;
  }
  if(!newNoteStore.noteData.left || !newNoteStore.noteData.right){
    return false;
  }
  const targetLeft = newNoteStore.noteData.left
  const targetRight = newNoteStore.noteData.right
  const inside = targetLeft > props.note?.left || targetRight < props.note?.right
  return props.selectMode && !inside
});

// Check if dimmed (when searching)
const isFound = computed(() => {
  if(!props.searchMode){
    return false;
  }
  if(!props.note?.id){
    return;
  }
  return searchStore.searchResults.includes(props.note?.id)
});

const onMouseDown = () => {
  if(isRestricted.value){
    return
  }
  if(props.selectMode){
    newNoteStore.targetIdSelected = props.note?.id || 0
    return
  }
  notesStore.setCurrent(props.note?.id)
}

const onContextMenu = (event: Event) => {
  event.preventDefault()
}

// Change expanded state
const onDblClick = () => {
  if(props.searchMode){
    return
  }
  if(props.selectMode){
    return
  }
  if(!props.note){
    return
  }
  notesStore.toggleExpand(props.note?.id)
}

// Debug
// import { onUpdated } from 'vue'
// onUpdated(() => {
//   console.warn(`Updated [${props.note?.id}] ${props.note?.title}`)
// })
</script>

<style scoped>
ul {
  padding-left: 0;
}
li {
  display: block;
  margin-left: 0;
}
li div {
  cursor: pointer;
  display: flex;
  place-items: center;
  padding: 2px 4px;
  padding-left: 0;
}
li div > span {
  line-height: 100%;
}
span.expand {
  height: 16px;
  margin-right: 4px;
  flex: 0 0 16px;
  width: 16px;
}
span.is_parent.expand {
  background-image: url('data:image/webp;base64,UklGRmgAAABXRUJQVlA4IFwAAABQAgCdASoJAAkAAgA0JZwC7AaTA7soT8BvI8AA/vm69YW39NNwsCWeAz4/utnG7Ay3+9PQLnCJWIOXxzt87d96Lmv6c/ptNzHyCim3l7QTTG/2DWpChsiBtsAAAA==');
  background-position: center center;
  background-repeat: no-repeat;
}
div.expanded span.is_parent.expand {
  background-image: url('data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAADwAQCdASoJAAkAAgA0JZwAAtzQEE5tdQAA/vm69YW39NNwsCWcA0bQKNkg5fHO3zt7n5lZ/cv0cebqQaCJGvwcF/g5etmUxkaZgIAA');
  background-position: center center;
  background-repeat: no-repeat;
}
span.icon {
  margin-right: 4px;
  flex: 0 0 var(--tetrad-height-icons-s);
  position: relative;
  top: -1px;
}
span.title {
  flex: 1 1 100%;
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
div.empty span.title {
  color: var(--color-text-error);
}
div.url span.title span {
  text-decoration: underline;
}
span.count {
  color: var(--color-text-gray);
  font-size: 90%;
  margin-left: 6px;
}
@media (hover: hover) and (pointer: fine) {
  li div:hover button {
    display: inline-block;
  }
}
/* select mode */
div.restricted {
  cursor: not-allowed;
}
div.restricted span.title {
  color: var(--color-text-silver);
}
/* search mode */
nav.search_mode li:not(:has(.found_y)) {
  display: none;
}
nav.search_mode div.found_n {
  opacity: 0.35;
}
/* search mode + tree mode */
nav.search_mode:not(.tree_mode) div.found_n {
  display: none !important;
}
nav.search_mode:not(.tree_mode) li div {
  padding-left: 2px !important;
}
/**/
@media (hover: hover) and (pointer: fine) {
  li div:hover {
    background-color: var(--color-menuitem-hover-bg);
    color: var(--color-menuitem-hover-color);
  }
}
li div.selected {
  background-color: var(--color-menuitem-highlight);
  color: var(--color-text-white);
}
li div.selected span.count {
  color: var(--color-text-white);
}
@media (hover: hover) and (pointer: fine) {
  li div:hover span.title span {
    text-decoration: underline;
  }
}
/**/
nav.select_mode > ul > li > div {
  padding-left: 4px;
}
/**/
li div {
  padding-left: 2px;
}
li li div {
  padding-left: 15px;
}
li li li div {
  padding-left: 30px;
}
li li li li div {
  padding-left: 45px;
}
li li li li li div {
  padding-left: 60px;
}
li li li li li li div {
  padding-left: 75px;
}
/* Option: multiline */
nav.multiline span.title {
  overflow: initial;
  text-overflow: initial;
  white-space: initial;
}
</style>
