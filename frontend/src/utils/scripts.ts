// Execute scripts in a div
const executeScripts = (div: HTMLElement) => {
	if (div) {
		const scripts = div.querySelectorAll('script');
		scripts.forEach((oldScript: HTMLScriptElement) => {
			const newScript = document.createElement('script');

			// Copy script attributes
			for (const attr of Array.from(oldScript.attributes)) {
				newScript.setAttribute(attr.name, attr.value);
			}

			newScript.textContent = oldScript.textContent;

			// Replace old to new
			oldScript.parentNode?.replaceChild(newScript, oldScript);
		});
	}
};

export { executeScripts }
