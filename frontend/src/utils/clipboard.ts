const copyToClipboard = (text: string, callback: (success: boolean) => void) => {
	navigator.clipboard.writeText(text)
		.then(() => callback(true))
		.catch(() => callback(false));
}

export { copyToClipboard }