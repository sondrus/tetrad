export interface Note {
	id: number;
	parentId: number;
	depth: number;
	left: number;
	right: number;
	expanded: boolean;
	readonly: boolean;
	icon: number;
	type: string;
	title: string;
	contents: string;
	url?: string;
	syntax?: string;
	favorite: boolean;
	dateCreated: number;
	dateModified: number;

	// virtual
	contentsLength: number;
	children: Note[];
	selected: boolean;
}

export interface SaveNote {
	id?: number;
	parentId?: number;
	expanded?: boolean;
	readonly?: boolean;
	icon?: number;
	type?: string;
	title?: string;
	contents?: string;
	url?: string;
	syntax?: string;
	options?: string;
}
