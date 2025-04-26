import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { HotKeys } from '@/models/hotkeys';
import { useActionsStore } from '@/stores/actionsStore';
import { useLogStore } from '@/stores/logStore';

export const useHotkeysStore = defineStore('hokey', () => {
	const actionsStore = useActionsStore()
	const logStore = useLogStore()

	const hotkeysDefault: HotKeys = {
		general: {
			homepage:
				['Ctrl+Alt+H', actionsStore.general.goToWelcomePage],
			message_log:
				['Ctrl+Alt+M', actionsStore.general.showMessageLog],
			emoji_selector:
				['Ctrl+Alt+J', actionsStore.general.showEmojiSelector],
		},
		treeview: {
			collapse_all:
				['Ctrl+Alt+A', actionsStore.treeview.collapseAll],
			expand_all:
				['Ctrl+Alt+G', actionsStore.treeview.expandAll],
			multiline_toggle:
				['Ctrl+Alt+X', actionsStore.treeview.multilineToggle],
			go_home:
				['Ctrl+Alt+ArrowUp', actionsStore.treeview.goHome],
			go_end:
				['Ctrl+Alt+ArrowDown', actionsStore.treeview.goEnd],
			go_up:
				['Alt+ArrowUp', actionsStore.treeview.goUp],
			go_down:
				['Alt+ArrowDown', actionsStore.treeview.goDown],
			go_parent:
				['Alt+ArrowLeft', actionsStore.treeview.goParent],
			go_child:
				['Alt+ArrowRight', actionsStore.treeview.goChild],
		},
		note: {
			add_root:
				['Ctrl+Alt+R', actionsStore.note.addRoot],
			add_near:
				['Ctrl+Alt+N', actionsStore.note.addNear],
			add_child:
				['Ctrl+Alt+C', actionsStore.note.addChild],
			edit:
				['Ctrl+Alt+Q', actionsStore.note.edit],
			delete:
				['Ctrl+Alt+D', actionsStore.note.delete],
		},
		view: {
			sidebar:
				['Ctrl+Alt+S', actionsStore.view.toggleSidebar],
			viewer:
				['Ctrl+Alt+V', actionsStore.view.showViewer],
			editor:
				['Ctrl+Alt+E', actionsStore.view.showEditor],
			toggle:
				['Ctrl+Space', actionsStore.view.toggle],
			mode_default:
				['Ctrl+Alt+Backquote', actionsStore.view.modeDefault],
			mode_vertical:
				['Ctrl+Alt+1', actionsStore.view.modeVertical],
			mode_horizontal:
				['Ctrl+Alt+2', actionsStore.view.modeHorizontal],
			linewrap:
				['Ctrl+Alt+L', actionsStore.view.toggleWrap],
		},
		search: {
			focus:
				['Ctrl+Alt+F', actionsStore.search.focus],
			clear:
				['Ctrl+Alt+Z', actionsStore.search.clear],
			title:
				['Ctrl+Alt+T', actionsStore.search.searchInTitles],
			whole:
				['Ctrl+Alt+W', actionsStore.search.searchWholePhrase],
			tree_mode:
				['Ctrl+Alt+Y', actionsStore.search.searchTreeMode],
		},
		database: {
			vacuum:
				['Ctrl+Alt+Minus', actionsStore.database.optimize],
			download:
				['Ctrl+Alt+Equal', actionsStore.database.download],
		}
	};

	const hotkeys = ref<HotKeys>(hotkeysDefault)

	// Start handler for hotkeys
	const initHandler = () => {
		document.removeEventListener('keydown', handleHotKey);
		document.addEventListener('keydown', handleHotKey);
	};

	// Handler for keydown event
	const handleHotKey = (event: KeyboardEvent) => {
		const hotkey = detectHotKeyFromEvent(event);
		if (!hotkey) {
			return;
		}

		logStore.debug('Hot key pressed', {hotkey}, {event})

		for (const group in hotkeys.value) {
			if (!Object.hasOwn(hotkeys.value, group)) {
				continue;
			}

			for (const item in hotkeys.value[group]) {
				if (!Object.hasOwn(hotkeys.value[group], item)) {
					continue;
				}
				if(hotkeys.value[group][item][0] !== hotkey){
					continue;
				}

				const action = `${group}.${item}`
				const callback = hotkeys.value[group][item][1]

				event.preventDefault()
				executeAction(action, callback)
			}
		}

	};

	// Execute action: `note.add_child`, `search.title`, etc
	const executeAction = (action: string, callback: (() => void)) => {
		if(typeof callback === 'function'){
			callback();
		}
	};

	// Detect hotkey from event (eg, `Ctrl+Shift+Alt+X`)
	const detectHotKeyFromEvent = (event: KeyboardEvent) => {
		if (['Control', 'Shift', 'Alt', 'Meta'].includes(event.key)) {
			return;
		}
		if (['NumLock', 'CapsLock', 'ScrollLock'].includes(event.code)) {
			return;
		}

		// Detect key code
		let key = event.code

		// Detect modifiers
		const ctrl = event.ctrlKey
		const shift = event.shiftKey
		const alt = event.altKey
		const meta = event.metaKey

		// Transform KeyA => A, KeyG => G, KeyW => W
		const match1 = key.match(/Key([A-Z])/)
		if (match1) {
			key = match1[1]
		}

		// Transform Digit1 => 1, Digit2 => 2, Digit9 => 9
		const match2 = key.match(/Digit([0-9])/)
		if (match2) {
			key = match2[1]
		}

		// Use `NumpadEnter` as `Enter`
		if (key == 'NumpadEnter') {
			key = 'Enter';
		}

		// Skip some single keys
		if (!ctrl && !shift && !alt && !meta) {

			// Common keys
			const general = ['Enter', 'Space', 'Backspace', 'Tab', 'Backquote', 'Escape',
				'ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
			if (general.includes(key)) {
				return;
			}

			// A, B, C, 0, 1, 2, ...
			if (/^[A-Za-z0-9]$/.test(key)) {
				return;
			}

		}

		// Build text for hotkey
		const hotkey = []
		if (ctrl) {
			hotkey.push('Ctrl')
		}
		if (shift) {
			hotkey.push('Shift')
		}
		if (alt) {
			hotkey.push('Alt')
		}
		if (meta) {
			hotkey.push('Meta')
		}
		hotkey.push(key)

		return hotkey.join('+')
	}



	return {
		hotkeys,
		handleHotKey,
		initHandler,
	};
});
