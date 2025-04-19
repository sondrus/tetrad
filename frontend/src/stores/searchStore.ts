import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

import type { Note } from '@/models/note';

import { fetcher } from '@/utils/fetch';
import { useLogStore } from '@/stores/logStore';
import { useSettingsStore } from '@/stores/settingsStore';

export const useSearchStore = defineStore('search', () => {
	const logStore = useLogStore()
	const settingsStore = useSettingsStore()

	const searchInput = ref<HTMLInputElement | null>(null)

	const searchText = ref<string>('')

	const searchResults = ref<number[]>([])

	const searchMode = ref(false)

	const isLoading = ref(false)
	
	const notFound = ref(false)

	const setInput = (input: HTMLInputElement) => {
		searchInput.value = input
	}

	const focusInput = () => {
		searchInput.value?.focus()
	}

	const clearInput = () => {
		searchText.value = ''
		searchInput.value?.blur()
	}

	// If empty search text => set `searchMode` = `off`
	const toggleSearchMode = (text: string) => {
		searchMode.value = !!text.length
		isLoading.value = searchMode.value

		if(!searchMode.value){
			searchResults.value = []
		}
	}

	// Do search
	const search = async (query: string) => {
		searchResults.value = []

		notFound.value = false

		if(!query.length){
			return
		}

		const url = `/api/notes/search`;
		const response = await fetcher(url, { method: "POST", json: {
			query: query,
			title: settingsStore.settings.search.title,
			whole: settingsStore.settings.search.whole,
		}});

		isLoading.value = false

		if (!response.ok) {
			logStore.error(`Error searching '${query}': ${response.message}`)
			return
		}

		const responseData = response.json as {notes: Note[]}

		searchResults.value = responseData.notes.map(note => note.id)

		if(!searchResults.value.length){
			notFound.value = true
		}
	}

	// Do search (with debounce)
	let debounceTimer: number | undefined
	const searchWithDebounce = async (text: string) => {
		toggleSearchMode(text)
		
		notFound.value = false

		clearTimeout(debounceTimer)
		debounceTimer = setTimeout(() => {
			search(text);
		}, settingsStore.settings.search.searchDelay);
	};

	watch(() => searchText.value, (text) => {
		searchWithDebounce(text ?? '')
	})

	const searchExecute = async () => {
		await search(searchText.value)
	}

	return {
		setInput,
		focusInput,
		clearInput,

		searchText,
		searchResults,
		searchMode,

		isLoading,
		notFound,

		search,
		searchWithDebounce,
		searchExecute,
	};
});
