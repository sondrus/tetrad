import { EditorState, Compartment, EditorSelection } from "@codemirror/state";
import {
	EditorView, keymap, highlightSpecialChars, drawSelection, highlightActiveLineGutter,
	dropCursor, rectangularSelection, crosshairCursor, lineNumbers, highlightActiveLine,
	ViewUpdate
} from "@codemirror/view";
import {
	defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching, foldGutter,
	foldKeymap
} from "@codemirror/language";
import {
	defaultKeymap, indentMore, indentLess, copyLineDown, moveLineUp, moveLineDown, history,
	historyKeymap
} from "@codemirror/commands";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { autocompletion, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";


type refContents = {value: string}

let editor: EditorView;

let lastNoteId = 0;

let isFocused = false;

let isInitializing = false;

const lineWrappingCompartment = new Compartment();
const undoRedo = new Compartment();

const editorCreate = (parent: HTMLElement, callback: () => refContents) => {

	editor = new EditorView({
		doc: '', // notesStore.current.contents
		parent: parent,
		extensions: [
			lineNumbers(),
			foldGutter(),
			highlightSpecialChars(),
			drawSelection(),
			dropCursor(),
			EditorState.allowMultipleSelections.of(true),
			indentOnInput(),
			syntaxHighlighting(defaultHighlightStyle),
			bracketMatching(),
			closeBrackets(),
			autocompletion(),
			rectangularSelection(),
			crosshairCursor(),
			highlightActiveLine(),
			highlightActiveLineGutter(),
			highlightSelectionMatches(),
			markdown({ base: markdownLanguage, addKeymap: true }),
			html(),
			css(),
			javascript(),
			undoRedo.of([history()]),
			createUpdateListener(callback),
			keymap.of([
				{ key: "Tab", run: ({state, dispatch}) => {
					if (state.selection.ranges.some(range => !range.empty)) {
						return indentMore({state, dispatch});
					}
					else {
						dispatch(state.update(state.replaceSelection("\t")));
						return true;
					}
				} },
				{ key: "Shift-Tab", run: indentLess },
				{ key: "Ctrl-d", run: copyLineDown },
				{ key: "Ctrl-Shift-ArrowUp", run: moveLineUp },
				{ key: "Ctrl-Shift-ArrowDown", run: moveLineDown },
				{ key: "Alt-ArrowUp", run: () => true },
				{ key: "Alt-ArrowDown", run: () => true },
				{ key: "Shift-Alt-ArrowUp", run: () => true },
				{ key: "Shift-Alt-ArrowDown", run: () => true },
				...historyKeymap,
				...closeBracketsKeymap,
				...defaultKeymap,
				...searchKeymap,
				...foldKeymap,
			]),
			lineWrappingCompartment.of([]),
		]
	});
	return editor
}

// Create listener of contents and focus change
const createUpdateListener = (callback: () => refContents) => {
	return EditorView.updateListener.of((update: ViewUpdate) => {
		isFocused = update.view.hasFocus;

		if (!update.docChanged) {
			return;
		}

		if (isInitializing) {
			return;
		}

		const contents = update.state.doc.toString()

		if(callback().value === contents){
			return
		}

		callback().value = contents
	});
}

// Set custom contents for editor
const editorSetContent = (newText: string, noteId: number = 0) => {
	if (!editor) {
		return
	}

	isInitializing = true;

  // Get cursor pos
  const cursorPos = noteId === lastNoteId ? editor.state.selection.main.head : 0

  // Set new content and cursor pos
	editor.dispatch(editor.state.update({
    // Set new content
		changes: { from: 0, to: editor.state.doc.length, insert: newText },

   // Set cursor pos (especially relevant for editing)
    selection: EditorSelection.cursor(cursorPos),
    scrollIntoView: true
	}));

  // Clear undo history
  if(noteId !== lastNoteId) {
    editor.dispatch({
      effects: undoRedo.reconfigure([])
    });
    editor.dispatch({
      effects: undoRedo.reconfigure([history()])
    });
  }

	isInitializing = false

  lastNoteId = noteId
};

// Set line wrap
const editorSetLineWrap = (flag: boolean) => {
	if(!editor){
		return
	}

	editor.dispatch({
		effects: lineWrappingCompartment.reconfigure(flag ? EditorView.lineWrapping : [])
	});
}

// Set focus to delay
const editorSetFocus = (delay: number = 10) => {
	if(!editor){
		return
	}

	setTimeout(() => {
		editor.focus();
	}, delay)
}

// Insert text at cursor
const editorInsertAtCursor = (text: string) => {
	if (!editor) {
    return;
  }

  editor.dispatch(editor.state.update(editor.state.replaceSelection(text), {
    scrollIntoView: true,
    userEvent: "input"
  }));
};


// Is focused?
const editorIsFocused = () => isFocused

export { editorCreate, editorSetContent, editorSetLineWrap, editorSetFocus, editorIsFocused,
  editorInsertAtCursor }
