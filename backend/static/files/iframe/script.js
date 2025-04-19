// Initialize iframe
window.parent.postMessage({action: 'tetrad_init'}, location.origin);

// Passthrough hotkeys
document.addEventListener('keydown', (event)=>{
	window.parent.postMessage({
		action: 'tetrad_keydown',
		payload: {
			// build own object becauseKeyboardEvent object could not be cloned
			event: {
				key: event.key,
				code: event.code,
				ctrlKey: event.ctrlKey,
				shiftKey: event.shiftKey,
				altKey: event.altKey,
				metaKey: event.metaKey,
			}
		}
	}, location.origin);
})
