declare module "*.vue" {
	import { DefineComponent } from 'vue';
	const component: DefineComponent<unknown, unknown, unknown>;
	export default component;
}

declare module '@/services/markdown' {
	import { MarkdownIt } from 'markdown-it';

	export const markdownIt: MarkdownIt;

	export const highlightCode: (code: string, lang: string, classname: string = '', numbers: boolean = true) => string;
	export const getHighlightLang: (language: string) => string;
}
