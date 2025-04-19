export interface HotKeys {
	[group: string]: {
		[item: string]: [string, (() => void)];
	};
};