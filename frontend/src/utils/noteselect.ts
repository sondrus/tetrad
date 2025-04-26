import type { Note } from '@/models/note';
import { useNotesStore } from '@/stores/notesStore';
import { useSearchStore } from '@/stores/searchStore';
import { useSettingsStore } from '@/stores/settingsStore';

type SelectType = 'HOME' | 'END' | 'PARENT' | 'CHILD' | 'UP' | 'DOWN'

type SelectOptions = {
  nav: HTMLElement,
  note: Note | null
  store: ReturnType<typeof useNotesStore>,
  searchMode: boolean,
  treemode: boolean,
}

// Select note in tree
const selectNote = (nav: HTMLElement | null, type: SelectType) => {
  if(nav === null){
    return
  }

  const notesStore = useNotesStore()

  if(!notesStore.notesTree.length){
    return
  }

  const options: SelectOptions = {
    nav,
    note: notesStore.notesMap.get(notesStore.current.id) ?? null,
    store: notesStore,
    searchMode: useSearchStore().searchMode,
    treemode: useSettingsStore().settings.search.treeMode,
  }

  switch(type){

    case 'HOME':
      selectNoteHome(options)
      break;

    case 'END':
      selectNoteEnd(options)
      break;

    case 'PARENT':
      selectNoteParent(options)
      break;

    case 'CHILD':
      selectNoteChild(options)
      break;

    case 'UP':
      selectNoteUp(options)
      break;

    case 'DOWN':
      selectNoteDown(options)
      break;

  }
}

const selectNoteHome = (options: SelectOptions) => {
  const firstId = getVisibleNotesIds(options).at(0) ?? 0
  if(!firstId){
    return;
  }

  options.store.setCurrent(firstId, true)
}

const selectNoteEnd = (options: SelectOptions) => {
  const lastId = getVisibleNotesIds(options).at(-1) ?? 0
  console.log(lastId)
  if(!lastId){
    return;
  }

  options.store.setCurrent(lastId, true)
}

const selectNoteParent = (options: SelectOptions) => {
  if(!options.note){
    return;
  }

  if(options.searchMode){
    return;
  }

  if(options.note.expanded && !options.searchMode){
    options.store.toggleExpand(options.note.id, false)
    return;
  }

  if(!options.store.current.parentId){
    return;
  }

  options.store.setCurrent(options.note.parentId, true)
}

const selectNoteChild = (options: SelectOptions) => {
  if(!options.note){
    return;
  }

  if(options.searchMode){
    return;
  }

  if(!options.store.current.children.length){
    return;
  }

  // If not expanded, then expand. If searching, then all items are already expanded
  if(!options.note.expanded && !options.searchMode){
    options.store.toggleExpand(options.note.id, true)
    return;
  }

  // Use only visible children
  const visibleNotesId = getVisibleNotesIds(options)
  const visibleChildren = options.store.current.children.filter((child) => {
    return visibleNotesId.includes(child.id)
  })
  if(!visibleChildren.length){
    return
  }

  options.store.setCurrent(visibleChildren[0].id, true)
}

const selectNoteUp = (options: SelectOptions) => {
  if(!options.note){
    selectNoteHome(options);
    return;
  }

  const visibleNotesId = getVisibleNotesIds(options)
  if(!visibleNotesId.includes(options.note.id)){
    selectNoteHome(options);
    return;
  }

  const prev = findPrevId(visibleNotesId, options.note?.id || 0)
  if(!prev){
    return;
  }

  options.store.setCurrent(prev, true)
}

const selectNoteDown = (options: SelectOptions) => {
  if(!options.note){
    selectNoteHome(options);
    return;
  }


  const visibleNotesId = getVisibleNotesIds(options)
  if(!visibleNotesId.includes(options.note.id)){
    selectNoteHome(options);
    return;
  }

  const next = findNextId(visibleNotesId, options.note?.id || 0)
  if(!next){
    return;
  }

  options.store.setCurrent(next, true)
}

// Get plain list of ID of visible notes
const getVisibleNotesIds = (options: SelectOptions): number[] => {
  const items = options.nav.querySelectorAll('.item')

  const result: number[] = []
  Array.from(items).forEach((item) => {
    if(item.classList.contains('found_n')){
      return;
    }

    const id = parseInt(item.getAttribute('data-id') ?? '');
    if(!id){
      return;
    }

    result.push(id)
  });

  return result
}

// Find prev ID in array
function findPrevId(arr: number[], target: number): number | null {
  const index: number = arr.indexOf(target);
  if (index > 0) {
    return arr[index - 1];
  }
  return null;
}

// Find next ID in array
function findNextId(arr: number[], target: number): number | null {
  const index: number = arr.indexOf(target);
  if (index !== -1 && index < arr.length - 1) {
    return arr[index + 1];
  }
  return null;
}

export { selectNote }
