import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { Note } from '@/models/note'

import { useNotesStore } from '@/stores/notesStore'

export const useNewNoteStore = defineStore('new_note', () => {
	const notesStore = useNotesStore()

	// Simple empty note (used for ref in `noteData`)
	const note: Note = notesStore.makeNewNoteObject()

	// Auto open <dialog> if true (and auto close if false)
	const isOpen = ref<boolean>(false)

	// `isOpen` for another dialog
	const isOpenSelectParent = ref<boolean>(false)

	// Current edit note data
	const noteData = ref<Note>(note)

	// Target to note create in
	const targetId = ref<number>(0)

	// Target that selected in separate dialog
	const targetIdSelected = ref<number>(0)

	// Type of target: root [undefined], near [false], child [true]
	const targetType = ref<boolean | undefined>()

	// Check is edit mode
	const isEditMode = () => noteData.value.id > 0

	// Show dialog as a modal popup
	const showDialog = () => {
		setTargetId();
		isOpen.value = true;
	};

	// Wrapper for `showDialog`: show dialog for add new note
	const showDialogAdd = (type: boolean | undefined = undefined) => {
		targetType.value = type;

    // Inherit some properties for new note by default
    const parentNote = notesStore.notesMap.get(notesStore.current.id)
    if(parentNote){
      const { icon, type, syntax } = parentNote;
      Object.assign(noteData.value, { icon, type, syntax });
    }

		showDialog();
	};

	// Wrapper for `showDialog`: show dialog for edit note
	const showDialogEdit = (id: number | undefined = undefined) => {
		if(!id){
			id = notesStore.current.id
		}
		// get note
		const note = notesStore.notesMap.get(id)
		if(!note){
			return
		}
		noteData.value = {...note}

		showDialog();
	};

	const showSelectParent = () => {
		isOpenSelectParent.value = true;
	};

	const closeSelectParent = () => {
		isOpenSelectParent.value = false;
	};

	// Close current dialog
	const close = () => {
		isOpen.value = false;
		targetId.value = 0;
		noteData.value = notesStore.makeNewNoteObject()
	};

	// Set target note ID
	const setTargetId = () => {
		if(isEditMode()){
			targetId.value = noteData.value.parentId ?? 0
			targetIdSelected.value = noteData.value.parentId ?? 0
		}
		else{
			switch(targetType.value){
				case undefined: // 'ROOT'
					targetId.value = 0;
					break;
				case false: // 'NEAR'
					targetId.value = notesStore.current.parentId;
					break;
				case true: // 'CHILD'
					targetId.value = notesStore.current.id;
					break;
			}
		}
	};

	return {
		isOpen,
		isOpenSelectParent,
		showSelectParent,
		closeSelectParent,

		noteData,

		targetId,
		targetIdSelected,

		isEditMode,

		showDialog,
		showDialogAdd,
		showDialogEdit,
		close,
	};
});
