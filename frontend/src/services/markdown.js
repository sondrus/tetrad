import markdownit from 'markdown-it'
import pluginAbbr from 'markdown-it-abbr'
import pluginCheckbox from 'markdown-it-checkbox'
import pluginCollapsible from 'markdown-it-collapsible'
import pluginContainer from 'markdown-it-container'
import pluginDeflist from 'markdown-it-deflist'
import pluginFootnote from 'markdown-it-footnote'
import pluginIns from 'markdown-it-ins'
import pluginKbd from 'markdown-it-kbd'
import pluginLinkAttributes from 'markdown-it-link-attributes'
import pluginMark from 'markdown-it-mark'
import pluginMultimdTable from 'markdown-it-multimd-table'
import pluginPlantUML from 'markdown-it-plantuml'
import pluginSub from 'markdown-it-sub'
import pluginSup from 'markdown-it-sup'
import pluginVideo from 'markdown-it-video'
import pluginAnchor from 'markdown-it-anchor'
import pluginToc from 'markdown-it-table-of-contents'

import hljs from 'highlight.js'

// Markdown code handler
const highlightCode = (code, lang, classname, numbers) => {
	let highlighted = '';

	// detect lang and highlighting
	if (lang && hljs.getLanguage(lang)) {
		const params = {
			language: getHighlightLang(lang),
			ignoreIllegals: true,
		}
		try {
			highlighted = hljs.highlight(code, params).value
		} catch (error) {
			console.error(error)
		}
	}

	// If no lang detected => plaintext
	if (highlighted == '') {
		lang = 'plaintext'
		highlighted = markdownIt.utils.escapeHtml(code)
	}

	// rtrim()
	highlighted = highlighted.replace(/[ \t\r\n]+$/, '')

	// Transform to <ol> for enable line numbers
	if(numbers === undefined){
		numbers = true
	}
	if(numbers){ // true | undefined
		let
			lines = highlighted.split("\n"),
			ol = document.createElement('ol');
		lines.forEach((line) => {
			let li = document.createElement('li');
			li.innerHTML = line;
			ol.appendChild(li);
		})
		if (ol.childNodes.length > 1) {
			highlighted = ol.outerHTML
		}
	}

	// class
	classname = typeof classname === 'string' ? ` class="${classname}"` : ''

	// Output
	return `<pre${classname}>`+
		`<code class="hljs language-${lang}">${highlighted}</code>`+
		`<button>copy</button>`+
		`<span>${lang}</span>`+
	`</pre>`;
}

// Some replaces for languages in highlight.js
const getHighlightLang = (language) => {
	language = language.toLowerCase()
	if (language == 'js') {
		language = 'javascript'
	} else if (language == 'html') {
		language = 'xml'
	} else if (language == 'sh' || language == 'shell') {
		language = 'bash'
	}
	return language != '' && hljs.listLanguages().includes(language) ? language : 'plaintext'
}

// Anchor for both plugins toc and anchor
const anchorSlugify = (text) => {
	// Convert to lowercase
	text = text.toLowerCase();
	
	// Normalize text to remove accents and diacritical marks
	text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	
	// Replace non-alphanumeric characters with dashes
	text = text.replace(/[^a-z0-9]+/g, '_');
	
	// Trim dashes from the beginning and end
	text = text.replace(/^[-]+|[-]+$/g, '');
	
	return 'tetrad_' + text;
}

// Init markdown-it
const markdownIt = markdownit({
	html: true,
	linkify: true,
	xhtmlOut: true,
	typographer: true,
	breaks: false,
	highlight: highlightCode
})
.use(pluginCollapsible)
.use(pluginCheckbox, {
	idPrefix: 'tetrad-checkbox-',
	divWrap: true,
	divClass: 'checkbox_wrapper'
})
.use(pluginLinkAttributes, {
	attrs: {
		target: "_blank" 
	}
})
.use(pluginKbd)
.use(pluginSub)
.use(pluginSup)
.use(pluginFootnote)
.use(pluginDeflist)
.use(pluginAbbr)
.use(pluginIns)
.use(pluginMark)
.use(pluginMultimdTable, {
	multiline: true,
	rowspan: true,
	headerless: true,
	multibody: true,
	aotolabel: true
})
.use(pluginPlantUML)
.use(pluginContainer, 'error')
.use(pluginContainer, 'warning')
.use(pluginContainer, 'info')
.use(pluginContainer, 'note')
.use(pluginContainer, 'quote')
.use(pluginVideo)
.use(pluginAnchor, {
	slugify: anchorSlugify
})
.use(pluginToc, {
	slugify: anchorSlugify,
	containerClass: 'table_of_contents',
	includeLevel: [2]
})

// markdown-it-imsize (original is not working :( )
const imsize = (md) => {function parseImageSize(str, pos, max) {var code,result = { ok: false, pos: 0, width: "", height: "" };if (pos >= max) {return result;}code = str.charCodeAt(pos);if (code !== 0x3d) {return result;}pos++;code = str.charCodeAt(pos);if (code !== 0x78 && (code < 0x30 || code > 0x39)) {return result;}var resultW = parseNextNumber(str, pos, max);pos = resultW.pos;code = str.charCodeAt(pos);if (code !== 0x78) {return result;}pos++;var resultH = parseNextNumber(str, pos, max);pos = resultH.pos;result.width = resultW.value;result.height = resultH.value;result.pos = pos;result.ok = true;return result;}function parseNextNumber(str, pos, max) {var code,start = pos,result = { ok: false, pos: pos, value: "" };code = str.charCodeAt(pos);while ((pos < max && code >= 0x30 && code <= 0x39) || code === 0x25) {code = str.charCodeAt(++pos);}result.ok = true;result.pos = pos;result.value = str.slice(start, pos);return result;}function image_with_size(md) {return function (state, silent) {var attrs,code,label,labelEnd,labelStart,pos,ref,res,title,width = "",height = "",token,tokens,start,href = "",oldPos = state.pos,max = state.posMax;if (state.src.charCodeAt(state.pos) !== 0x21) {return false;}if (state.src.charCodeAt(state.pos + 1) !== 0x5b) {return false;}labelStart = state.pos + 2;labelEnd = md.helpers.parseLinkLabel(state, state.pos + 1, false);if (labelEnd < 0) {return false;}pos = labelEnd + 1;if (pos < max && state.src.charCodeAt(pos) === 0x28) {pos++;for (; pos < max; pos++) {code = state.src.charCodeAt(pos);if (code !== 0x20 && code !== 0x0a) {break;}}if (pos >= max) {return false;}start = pos;res = md.helpers.parseLinkDestination(state.src, pos, state.posMax);if (res.ok) {href = state.md.normalizeLink(res.str);if (state.md.validateLink(href)) {pos = res.pos;} else {href = "";}}start = pos;for (; pos < max; pos++) {code = state.src.charCodeAt(pos);if (code !== 0x20 && code !== 0x0a) {break;}}res = md.helpers.parseLinkTitle(state.src, pos, state.posMax);if (pos < max && start !== pos && res.ok) {title = res.str;pos = res.pos;for (; pos < max; pos++) {code = state.src.charCodeAt(pos);if (code !== 0x20 && code !== 0x0a) {break;}}} else {title = "";}if (pos - 1 >= 0) {code = state.src.charCodeAt(pos - 1);if (code === 0x20) {res = parseImageSize(state.src, pos, state.posMax);if (res.ok) {width = res.width;height = res.height;pos = res.pos;for (; pos < max; pos++) {code = state.src.charCodeAt(pos);if (code !== 0x20 && code !== 0x0a) {break;}}}}}if (pos >= max || state.src.charCodeAt(pos) !== 0x29) {state.pos = oldPos;return false;}pos++;} else {if (typeof state.env.references === "undefined") {return false;}for (; pos < max; pos++) {code = state.src.charCodeAt(pos);if (code !== 0x20 && code !== 0x0a) {break;}}if (pos < max && state.src.charCodeAt(pos) === 0x5b) {start = pos + 1;pos = md.helpers.parseLinkLabel(state, pos);if (pos >= 0) {label = state.src.slice(start, pos++);} else {pos = labelEnd + 1;}} else {pos = labelEnd + 1;}if (!label) {label = state.src.slice(labelStart, labelEnd);}ref = state.env.references[md.utils.normalizeReference(label)];if (!ref) {state.pos = oldPos;return false;}href = ref.href;title = ref.title;}if (!silent) {state.pos = labelStart;state.posMax = labelEnd;var newState = new state.md.inline.State(state.src.slice(labelStart, labelEnd),state.md,state.env,(tokens = []),);newState.md.inline.tokenize(newState);token = state.push("image", "img", 0);token.attrs = attrs = [["src", href],["alt", ""],];token.children = tokens;if (title) {attrs.push(["title", title]);}if (width !== "") {attrs.push(["width", width]);}if (height !== "") {attrs.push(["height", height]);}}state.pos = pos;state.posMax = max;return true;};}md.inline.ruler.before("emphasis", "image", image_with_size(md));}
markdownIt.use(imsize)

// Wrap tables with <div class="table_wrapper"></div>
markdownIt.renderer.rules.table_open = () => '<div class="table_wrapper"><table>';
markdownIt.renderer.rules.table_close = () => '</table></div>';

// export
export { markdownIt, highlightCode, getHighlightLang }
