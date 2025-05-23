import { defineStore } from 'pinia';

import { useSettingsStore } from '@/stores/settingsStore';
import { useNotesStore } from '@/stores/notesStore';
import { useNewNoteStore } from '@/stores/newNoteStore';
import { useSearchStore } from '@/stores/searchStore';
import { useLogStore } from '@/stores/logStore';
import { useDbStore } from '@/stores/dbStore';
import { useAboutStore } from '@/stores/aboutStore';
import { useEmojiStore } from '@/stores/emojiStore';
import { selectNote } from '@/utils/noteselect';

type ActionMap = Record<string, () => void>

export const useActionsStore = defineStore('actions', () => {
	const settingsStore = useSettingsStore()
	const notesStore = useNotesStore()
	const newNoteStore = useNewNoteStore()
	const searchStore = useSearchStore()
	const logStore = useLogStore()
	const dbStore = useDbStore()
	const aboutStore = useAboutStore()
	const emojiStore = useEmojiStore()

	// GENERAL

	const general: ActionMap = {};

	general.goToWelcomePage = () => {
		notesStore.resetCurrent();
	}

	general.showMessageLog = () => {
		logStore.showDialog()
	}

	general.showAbout = () => {
		aboutStore.showDialog()
	}

	general.showEmojiSelector = () => {
		if(!notesStore.isNoteOpened){
			return
		}
		emojiStore.showDialog()
	}

	// TREEVIEW

	const treeview: ActionMap = {};

	treeview.expandAll = () => {
		notesStore.expandAll()
	}

	treeview.collapseAll = () => {
		notesStore.collapseAll()
	}

	treeview.singleline = () => {
		settingsStore.settings.treeview.multiline = false
	}

	treeview.multiline = () => {
		settingsStore.settings.treeview.multiline = true
	}

	treeview.multilineToggle = () => {
		settingsStore.settings.treeview.multiline = !settingsStore.settings.treeview.multiline
	}

	treeview.goHome = () => {
		selectNote(document.querySelector('aside nav'), 'HOME')
	}

	treeview.goEnd = () => {
		selectNote(document.querySelector('aside nav'), 'END')
	}

	treeview.goUp = () => {
		selectNote(document.querySelector('aside nav'), 'UP')
	}

	treeview.goDown = () => {
		selectNote(document.querySelector('aside nav'), 'DOWN')
	}

	treeview.goParent = () => {
		selectNote(document.querySelector('aside nav'), 'PARENT')
	}

	treeview.goChild = () => {
		selectNote(document.querySelector('aside nav'), 'CHILD')
	}

	// NOTE

	const note: ActionMap = {};

	note.addRoot = () => {
		newNoteStore.showDialogAdd()
	}

	note.addNear = () => {
		newNoteStore.showDialogAdd(false)
	}

	note.addChild = () => {
		newNoteStore.showDialogAdd(true)
	}

	note.edit = () => {
		newNoteStore.showDialogEdit()
	}

	note.delete = () => {
		notesStore.deleteCurrentNote()
	}

	// VIEW

	const view: ActionMap = {};

	view.toggleSidebar = () => {
		settingsStore.toggleSidebar()
	}

	view.showViewer = () => {
		if(!settingsStore.isEditMode())
			return
		settingsStore.setEditMode(false)
	}

	view.showEditor = () => {
		if(!notesStore.current.id)
			return
		if(notesStore.current.readonly)
			return
		if(settingsStore.settings.doublePanel.enabled)
			return
		if(notesStore.current.type === 'URL')
			return
		if(settingsStore.isEditMode())
			return
		settingsStore.setEditMode(true)
	}

	view.toggle = () => {
		if(settingsStore.isEditMode())
			view.showViewer()
		else
			view.showEditor()
	}

	view.toggleAutoView = () => {
		settingsStore.toggleAutoView()
	}

	view.modeDefault = () => {
		settingsStore.setDoublePanelMode(false, false);
	}

	view.modeVertical = () => {
		settingsStore.setDoublePanelMode(true, true);
	}

	view.modeHorizontal = () => {
		settingsStore.setDoublePanelMode(true, false);
	}

	view.toggleWrap = () => {
		if(settingsStore.settings.doublePanel.enabled){
			settingsStore.toggleEditorLineWrap()
			settingsStore.setViewerPreWrap(settingsStore.isEditorLineWrap())
		}
		else{
			if(settingsStore.isEditMode()){
				settingsStore.toggleEditorLineWrap()
			}
			else{
				settingsStore.toggleViewerPreWrap()
			}
		}
	}

	view.toggleEditorLineWrap = () => {
		settingsStore.toggleEditorLineWrap()
	}

	view.toggleViewerPreWrap = () => {
		settingsStore.toggleViewerPreWrap()
	}

	view.toggleReverseMobileInterface = () => {
		settingsStore.toggleReverseMobileInterface()
	}

	view.nextHljsTheme = () => {
		const themes = Array.from(settingsStore.hljsThemes)
		const index = themes.indexOf(settingsStore.settings.theme.hljs);
		const newTheme = themes[(index + 1) % themes.length];
		settingsStore.settings.theme.hljs = newTheme
	}

	// SEARCH

	const search: ActionMap = {};

	search.focus = () => {
		searchStore.focusInput()
	}

	search.clear = () => {
		searchStore.clearInput()
	}

	search.searchInTitles = () => {
		settingsStore.toggleSearchFindTitle()
		searchStore.focusInput()
		searchStore.searchExecute()
	}

	search.searchWholePhrase = () => {
		settingsStore.toggleSearchFindWhole()
		searchStore.focusInput()
		searchStore.searchExecute()
	}

	search.searchTreeMode = () => {
		settingsStore.toggleSearchTreeMode()
		searchStore.focusInput()
	}

	// DATABASE

	const database: ActionMap = {};

	database.optimize = () => {
		dbStore.dbOptimize()
	}

	database.download = () => {
		dbStore.dbDownload()
	}

	//

	return {
		general,
		treeview,
		note,
		view,
		search,
		database,
	};
});
