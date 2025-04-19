// Check element is in viewport
const isElementInViewport = (
	element: HTMLElement | null,
	container: HTMLElement | null
): boolean => {
	if(!element || !container) {
		return false
	}

	const elementRect = element.getBoundingClientRect()
	const containerRect = container.getBoundingClientRect()

	return elementRect.top >= containerRect.top && elementRect.bottom <= containerRect.bottom
}

// Scroll to element
const scrollIntoView = (
	element: HTMLElement | null,
	behavior: ScrollBehavior = 'smooth',
	block: ScrollLogicalPosition = 'center'
) => {
	if(!element){
		return
	}

	element?.scrollIntoView({ behavior: behavior, block: block })
};

// Scroll into view
const scrollToSelected = (nav: HTMLElement | null, selector: string = ".selected") => {
	if(!nav){
		return
	}

	setTimeout(() => {
		const item = nav?.querySelector(selector) as HTMLElement
		if(!isElementInViewport(item, nav)){
			scrollIntoView(item)
		}
	}, 10)
};

export { isElementInViewport, scrollIntoView, scrollToSelected }
