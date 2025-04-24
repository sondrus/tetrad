export interface Settings {
	language: string,
	theme: {
		default: string,
		hljs: string,
	},
	title: {
		pathSeparator: string,
	},
	sidebar: {
		visible: boolean,
		width: number,
	},
	treeview: {
		multiline: boolean,
	},
	doublePanel: {
		enabled: boolean,
		vertical: boolean,
	},
	editor: {
		linewrap: boolean,
		saveDelay: number,
		editMode: boolean,
		autoview: boolean,
	},
	viewer: {
		prewrap: boolean,
		executeScripts: boolean,
	},
	mobile: {
		reverseInterface: boolean,
	},
	welcome: {
		itemsCount: number,
	},
	search: {
		title: boolean,
		whole: boolean,
		searchDelay: number,
		treeMode: boolean,
	}
}
