import { defineStore } from 'pinia';
import { ref, computed, reactive, watch, watchEffect } from 'vue';

import type { Note, SaveNote } from '@/models/note';
import { i18n } from '@/i18n'
import { fetcher } from '@/utils/fetch';
import { scrollToSelected } from '@/utils/viewport.ts'
import { useSettingsStore } from '@/stores/settingsStore';
import { useLogStore } from '@/stores/logStore';

export const useNotesStore = defineStore('notes', () => {
	const settingsStore = useSettingsStore()
	const logStore = useLogStore()

	// Flag for check if notes was loaded
	const loaded = ref<boolean>(false);

	// Flag if error on notes load
	const loadError = ref<boolean>(false);

	// Notes tree
	const notesTree = ref<Note[]>([]);

	// Notes map
	const notesMap = reactive(new Map<number, Note>());

	// Check note is opened
	const isNoteOpened = ref(false)

	// Check current note is editable
	const isEditable = ref(false)

	//
	const makeNewNoteObject = (): Note => {
		const note = {
			id: 0,
			parentId: 0,
			readonly: false,
			icon: 0,
			type: '',
			title: '',
			contents: '',
			url: '',
			syntax: '',
			dateCreated: Math.floor(Date.now() / 1000),
			dateModified: Math.floor(Date.now() / 1000),
		} as Note
		note.children = []
		return note
	}

	// Current displayed note
	const current = ref<Note>(makeNewNoteObject());

	// Init loaded notes
	const setNotesTree = (newNotes: Note[]) => {
		notesTree.value = newNotes;
	};

	// Check current note is editable
	const checkIsEditable = (note: Note) => {
		const loaded = note.id > 0
		const readonly = note.readonly === true
		const typeEditable = !['URL'].includes(note.type)
		return loaded && !readonly && typeEditable
	}

	// Set current note (debounce - just for load contents)
  let debounceTimerSetCurrent: number | undefined
	const setCurrent = (id: number | undefined, debounce: boolean = false, expand: boolean = false) => {
		// Do not change if already set as current
		if(id == current.value?.id){ // this interferes select note after save, so move this logic to component
			return
		}

		// Unselect all
		Array.from(notesMap.values())
			.filter(item => item.selected)
			.forEach((note) => {
				note.selected = false
			})

		// Show welcome (if null)
		if (!id) {
			current.value = makeNewNoteObject()
			return
		}

		// Get note by id
		const note = notesMap.get(id)
		if (!note) {
			logStore.error(`Note ${id} is not found!`)
			return
		}

		// Activate found note
		note.selected = true
		current.value = {...note}

		// Expand parents
		expandParents(note.id)

		// Expand current note
		if(expand === true){
      toggleExpand(note.id, true)
		}

		// Scroll to note
		scrollToSelected(document.querySelector('nav'))

		// Load contents (with debounce for fast navigate in treeview)
		if(!['URL'].includes(note.type)){
      const delay = debounce ? 50 : 0
      clearTimeout(debounceTimerSetCurrent)
      debounceTimerSetCurrent = setTimeout(() => {
        loadNoteContents(note.id);
      }, delay)
		}

		// Auto view (or if not editable): viewer mode
		const isEditable = checkIsEditable(note)
		if (settingsStore.settings.editor.autoview || !isEditable) {
			settingsStore.setEditMode(false)
		}

	};

	// Set current note to undefined
	const resetCurrent = () => {
		setCurrent(undefined);
	};

	// Expand all parents for correct display selected note in tree
	const expandParents = (id: number) => {
		const parents = getNoteParents(id)
		if (!parents) {
			return
		}

		parents.forEach((parent) => {
			parent.expanded = true
		})

		return parents
	};

	// Expand DIRECT children
	const expandChildren = (id: number) => {
		const children = getNoteChildren(id)
		if (!children) {
			return
		}

		children.forEach((child) => {
			child.expanded = true
		})

		return children
	};

	// Collapse ALL children
	const collapseChildren = (id: number) => {
		const children = getNoteChildren(id)
		if (!children) {
			return
		}

		children.forEach((child) => {
			child.expanded = false
		})

		return children
	};

	// Load notes from backend
	const loadNotes = async () => {
		// Get current selected item
		let selectedId = 0
		const selectedItem = Array.from(notesMap.values())
			.filter(item => item.selected)
		if (selectedItem.length) {
			selectedId = selectedItem[0].id
		}

		const url = `/api/notes/tree`;
		const response = await fetcher(url, { method: "GET" });

		if (!response.ok) {
			loadError.value = true
			logStore.error(`Error loading notes tree: ${response.message}`)
			return
		}

		if (!response.json) {
			logStore.error(`Invalid response type: ${response.json}`)
			return
		}

		const responseData = (response.json as {notes: Note[]})

		// If something was selected => reselect it (in JSON response)
		if (selectedId) {
			updateNoteInTree(responseData.notes as Note[], selectedId, (note) => {
				note.selected = true
			})
		}

		// Set notes
		setNotesTree(responseData.notes as Note[])

		// Set loaded flag
		loaded.value = true
	};

	// Apply callback for each note in tree
	const updateNoteInTree = (
		items: Note[],
		targetId: number,
		updater: (note: Note) => void
	): boolean => {
		for (const note of items) {
			if (note.id === targetId) {
				updater(note)
				return true
			}
			if (note.children && updateNoteInTree(note.children, targetId, updater)) {
				return true
			}
		}
		return false
	}


	// Load note from database by fetch
	const loadNoteContents = async (id: number) => {
		const url = `/api/note/${id}`;
		const response = await fetcher(url, { method: "GET" });

		if (!response.ok) {
			logStore.error(`Error loading contents: ${response.message}`)
			return
		}

		if (!response.json) {
			logStore.error(`Invalid response type: ${response.json}`)
			return
		}

		const responseData = response.json as {note: Note}

		if (typeof responseData.note.contents != 'string') {
			logStore.error(`Invalid data structure: ${responseData.note.contents}`)
		}

		if (!current.value) {
			return
		}

		current.value.contents = responseData.note.contents
	};

	// Update current note contents (in store)
	const updateNoteContents = (contents: string) => {
		if (!current.value) {
			return;
		}

		const note = notesMap.get(current.value.id)
		if(!note){
			return
		}

		current.value.contents = contents;
		note.contentsLength = contents.length
	};

	// Add/edit existent note
	const saveNote = async (note: SaveNote) => {
		let id = note.id ?? 0

		const edit = !!id
		const add = !edit;

		const url = `/api/note/${edit ? id : 'add'}`;
		const response = await fetcher(url, {
			method: edit ? "PATCH" : "POST",
			json: note
		});

		if (!response.ok) {
			logStore.error(`Error save note: ${response.message}`)
			return
		}

		if (!response.json) {
			logStore.error(`Invalid response type: ${response.json}`)
			return
		}

		logStore.info(`Note saved: [${id}] ${note.title}`)

		const responseData = response.json as {id: number, date: number}

		if(add){
			id = responseData.id
		}

		if(edit){
			current.value.dateModified = responseData.date
		}

		await loadNotes()

		// If `add` mode, expand current note
		if (add && current.value) {
			toggleExpand(id, true)
		}

		// Update dateModified
		if (edit) {
			const note = notesMap.get(id)
			if(note){
				note.dateModified = (response.json as {date: number}).date
			}
		}

		// Save current to current and go to it
		if (edit) {
			setCurrent(undefined)
		}
		setCurrent(id)

		// If added, go edit mode
		if(add && !['URL'].includes(note.type ?? '')){
			settingsStore.setEditMode(true)
		}

		return true
	};

	// Save note contents
	const saveNoteContents = async (id: number, contents: string) => {
		const url = `/api/note/${id}`;
		const response = await fetcher(url, { method: "PATCH", json: { contents: contents } });

		if (!response.ok) {
			logStore.error(`Error saving note contents: ${response.message}`)
			return
		}

		if (!response.json) {
			logStore.error(`Invalid response type: ${response.json}`)
			return
		}

		logStore.info(`Note #${id} contents saved at ${logStore.formatDate(Date.now())}`)

		const responseData = response.json as {id: number, date: number}

		// Change current note date modified (used for ?t= in iframe URL)
		current.value.dateModified = responseData.date
	};

	// Save note contents using timeout
	let debounceTimerSaveNoteContents: number | undefined
	const saveNoteContentsWithDebounce = async (id: number, contents: string) => {
		clearTimeout(debounceTimerSaveNoteContents)
		debounceTimerSaveNoteContents = setTimeout(() => {
			saveNoteContents(id, contents);
		}, settingsStore.settings.editor.saveDelay);
	};

	// Get latest notes
	const getLatest = (field: keyof Note, count: number) => computed(() =>
		Array.from(notesMap.values())
			.sort((a, b) => (b[field] as number) - (a[field] as number))
			.slice(0, count)
	);

	// Delect note by id
	const deleteNote = async (id: number) => {
		if (id <= 0) {
			return false
		}

		const title = current.value?.title ?? ''

		if (!confirm(i18n.global.t('note.delete_confirm', {id: id, title: title}))) {
			return false
		}

		const selectedParentId = current.value?.parentId ?? 0

		const url = `/api/note/${id}`;
		const response = await fetcher(url, { method: "DELETE" });

		if (!response.ok) {
			logStore.error(`Error delete note: ${response.message}`)
			return
		}

		if (!response.json) {
			logStore.error(`Invalid response type: ${response.json}`)
			return
		}

		logStore.warning(`Note deleted: [${id}] ${title}`)

		await loadNotes()

		// If `add` mode, expand current note and go to children
		if (selectedParentId) {
			setCurrent(selectedParentId)
		}
		return true
	}
	// Delect note by id
	const deleteCurrentNote = async () => {
		await deleteNote(current.value.id)
	}


	// Expand/collapse note (true - expanded, false - collapsed, null - toggle)
	const toggleExpand = async (id: number, expanded: boolean | null = null) => {
		const item = notesMap.get(id)
		if (!item) {
			return;
		}

		// Set expanded flag
		item.expanded = expanded ?? !item.expanded

		// Arrays of notes to expand/collapse
		let expandId: number[] = []
		let collapseId: number[] = []

		// If expanded, expand parents
		if (item.expanded) {
			expandId = expandParents(id)?.map(item => item.id) ?? []
			expandId.push(item.id)
		}
		// If collapsed, collapse children
		else {
			collapseId = collapseChildren(id)?.map(item => item.id) ?? []
			collapseId.push(item.id)
		}

		// Send request
		await fetcher('/api/notes/expand', {
			method: "POST", json: { expand: expandId, collapse: collapseId }
		});
	}

	// Expand all notes
	const expandAll = async () => {
		await fetcher('/api/notes/expand', {method: "POST", json: { expand: [0] }});
		await loadNotes()
		scrollToSelected(document.querySelector('nav'))
	}

	// Collapse all notes
	const collapseAll = async () => {
		activateRootParent();
		await fetcher('/api/notes/expand', {method: "POST", json: { collapse: [0] }});
		await loadNotes()
		scrollToSelected(document.querySelector('nav'))
	}

	// Activate root item of current note
	const activateRootParent = () => {
		const parents = getNoteParentsId(current.value.id)
		if(!parents.length){
			return
		}

		setCurrent(parents[0])
	}

	// Get parents ID for current note
	const getNoteParentsId = (id: number): number[] => {
		const parents = []

		let maxDepth = 10

		while (true) {
			if (--maxDepth == 0) {
				break
			}

			const note = notesMap.get(id)
			if (note && note.parentId) {
				parents.push(note.parentId)
				id = note.parentId
				continue
			}

			break
		}

		return parents.reverse()
	}

	// Get parents for current note
	const getNoteParents = (noteId: number): Note[] => {
		const result: Note[] = []

		getNoteParentsId(noteId).forEach((parentId) => {
			const parent = notesMap.get(parentId)
			if (parent) {
				result.push(parent)
			}
		})

		return result
	}

	// Get children ID for current note
	const getNoteChildrenId = (id: number, recursive: boolean = false): number[] => {
		const src = notesMap.get(id)
		if (!src) {
			return []
		}

		const filterRecursive = ([, note]: [number, Note]) => {
			return note.left > src.left && note.right < src.right
		}

		const filterDirect = ([, note]: [number, Note]) => {
			return note.parentId === id
		}

		return Array.from(notesMap)
			.filter(recursive ? filterRecursive : filterDirect)
			.map(([id]) => id)
	}

	// Get chidlren for current note
	const getNoteChildren = (noteId: number, recursive: boolean = false): Note[] => {
		const result: Note[] = []

		getNoteChildrenId(noteId, recursive).forEach((childId) => {
			const child = notesMap.get(childId)
			if (child) {
				result.push(child)
			}
		})

		return result
	}

	// Format note date
	const formatNoteDate = (timestamp: number | null) => {
		if (!timestamp) {
			return ''
		}
		return new Date(timestamp * 1000).toISOString().split("T")[0];
	};

	// Fill notesMap
	const addNotesToMap = (notes: Note[]) => {
		notes.forEach(note => {
			notesMap.set(note.id, note);
			if (note.children && note.children.length > 0) {
				addNotesToMap(note.children);
			}
		});
	};

	// Set current note as favorite
	const toggleFavorite = async (flag: boolean | undefined = undefined) => {
		if(!current.value.id){
			return
		}

		const isFav = flag ?? !current.value.favorite

		const url = `/api/note/${current.value.id}`;
		const response = await fetcher(url, {
			method: "PATCH",
			json: {
				"favorite": isFav
			}
		});

		if (!response.ok) {
			logStore.error(`Error favorite note: ${response.message}`)
			return
		}

		if (!response.json) {
			logStore.error(`Invalid response type: ${response.json}`)
			return
		}

		current.value.favorite = isFav

		const note = notesMap.get(current.value.id)
		if(note){
			note.favorite = isFav
		}
	}

	// Get favorites notes list
	const getFavorites = (count: number) => computed(() =>
		Array.from(notesMap.values())
			.filter(note => note.favorite)
			.sort((a, b) => (b.left as number) - (a.left as number))
			.slice(0, count)
	);

	// Fill notesMap
	watchEffect(() => {
		notesMap.clear();
		addNotesToMap(notesTree.value);
	});

	// Handle open/close note: set `isEditable` and `isNoteOpened`
	watch(() => current.value, (note) => {
		isEditable.value = checkIsEditable(note)
		isNoteOpened.value = note.id > 0
	})

	return {
		loaded,
		loadError,

		makeNewNoteObject,

		notesTree,
		notesMap,

		current,
		setCurrent,
		resetCurrent,
		isNoteOpened,
		isEditable,

		loadNotes,
		loadNoteContents,
		updateNoteContents,
		saveNote,
		saveNoteContents,
		saveNoteContentsWithDebounce,

		getLatest,

		expandParents,
		expandChildren,
		collapseChildren,
		expandAll,
		collapseAll,

		deleteNote,
		deleteCurrentNote,

		activateRootParent,
		getNoteParentsId,
		getNoteParents,
		getNoteChildrenId,
		getNoteChildren,
		toggleExpand,

		toggleFavorite,
		getFavorites,

		formatNoteDate,
	};
});
