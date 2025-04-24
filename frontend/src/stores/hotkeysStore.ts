import { defineStore } from 'pinia';
import { ref } from 'vue';

import type { HotKeys } from '@/models/hotkeys';
import { useActionsStore } from '@/stores/actionsStore';

export const useHotkeysStore = defineStore('hokey', () => {
	const actions = useActionsStore()

	const hotkeysDefault: HotKeys = {
		general: {
			homepage:
				['Ctrl+Alt+H', actions.general.goToWelcomePage],
			message_log:
				['Ctrl+Alt+M', actions.general.showMessageLog],
      emoji_selector:
        ['Ctrl+Alt+J', actions.general.showEmojiSelector],
		},
		treeview: {
			expand_all:
				['Ctrl+Alt+ArrowLeft', actions.treeview.collapseAll],
			collapse_all:
				['Ctrl+Alt+ArrowRight', actions.treeview.expandAll],
			multiline_toggle:
				['Ctrl+Alt+X', actions.treeview.multilineToggle],
			go_home:
				['Ctrl+Alt+ArrowUp', actions.treeview.goHome],
			go_end:
				['Ctrl+Alt+ArrowDown', actions.treeview.goEnd],
			go_up:
				['Alt+ArrowUp', actions.treeview.goUp],
			go_down:
				['Alt+ArrowDown', actions.treeview.goDown],
			go_parent:
				['Alt+ArrowLeft', actions.treeview.goParent],
			go_child:
				['Alt+ArrowRight', actions.treeview.goChild],
		},
		note: {
			add_root:
				['Ctrl+Alt+R', actions.note.addRoot],
			add_near:
				['Ctrl+Alt+N', actions.note.addNear],
			add_child:
				['Ctrl+Alt+C', actions.note.addChild],
			edit:
				['Ctrl+Alt+Q', actions.note.edit],
			delete:
				['Ctrl+Alt+D', actions.note.delete],
		},
		view: {
			sidebar:
				['Ctrl+Alt+S', actions.view.toggleSidebar],
			viewer:
				['Ctrl+Alt+V', actions.view.showViewer],
			editor:
				['Ctrl+Alt+E', actions.view.showEditor],
			toggle:
				['Ctrl+Space', actions.view.toggle],
			mode_default:
				['Ctrl+Alt+Backquote', actions.view.modeDefault],
			mode_vertical:
				['Ctrl+Alt+1', actions.view.modeVertical],
			mode_horizontal:
				['Ctrl+Alt+2', actions.view.modeHorizontal],
			linewrap:
				['Ctrl+Alt+L', actions.view.toggleWrap],
		},
		search: {
			focus:
				['Ctrl+Alt+F', actions.search.focus],
			clear:
				['Ctrl+Alt+Z', actions.search.clear],
			title:
				['Ctrl+Alt+T', actions.search.searchInTitles],
			whole:
				['Ctrl+Alt+W', actions.search.searchWholePhrase],
			tree_mode:
				['Ctrl+Alt+Y', actions.search.searchTreeMode],
		},
		database: {
			vacuum:
				['Ctrl+Alt+Minus', actions.database.optimize],
			download:
				['Ctrl+Alt+Equal', actions.database.download],
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
