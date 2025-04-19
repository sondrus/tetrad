import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import markdownit from 'markdown-it'

import type { AppData } from '@/models/appdata'

import { fetcher } from '@/utils/fetch';
import { useLogStore } from '@/stores/logStore'

export const useAboutStore = defineStore('about', () => {
	const logStore = useLogStore()

	// Auto open <dialog> if true (and auto close if false)
	const isOpen = ref<boolean>(false)

	// Auto open license <dialog> if true (and auto close if false)
	const isOpenLicense = ref<boolean>(false)

	// Check data is loaded
	const loaded = ref<boolean>(false)

	// App data (version, name, license, ...)
	const app = ref<AppData>({} as AppData)

	// Get license text converting links
	const getLicenseText = computed(() => {

		const linkRegex = /^(\*) (.*?) \((https?:\/\/[^\s]+)\): (.*?) \((https?:\/\/[^\s]+)\)/gm;
	
		const text = (app.value.licenseText ?? '').split('\n').join('\n\n').replace(linkRegex, 
			(match, mark, name, url, license, licenseUrl) => {
				return `${mark} [${name}](${url}): [${license}](${licenseUrl})`
			}
		);

		const md = markdownit({
			html: true,
			linkify: true,
			xhtmlOut: true,
			typographer: true,
			breaks: true
		})

		return md.render(text)
	});
	
	//
	const loadData = async () => {
		const url = `/api/about`;
		const response = await fetcher(url, { method: "GET" });

		if(!response.ok){
			logStore.error(`Error loading app data: ${response.message}`)
			return
		}

		if (!response.json) {
			logStore.error(`Invalid response type: ${response.json}`)
			return
		}

		const responseData = response.json as {success: boolean, app: AppData}

		const data = responseData.app
		data.copyrights = data.copyrights.replace('(c)', '©')
		app.value = data

		// Set loaded flag
		loaded.value = true
	};

	// Show
	const showDialog = async () => {
		isOpen.value = true;
	};

	// Close
	const closeDialog = () => {
		isOpen.value = false;
	};

	// Show license
	const showLicenseDialog = async () => {
		isOpenLicense.value = true;
	};

	// Close license
	const closeLicenseDialog = () => {
		isOpenLicense.value = false;
	};

	return {
		app,
		loadData,

		getLicenseText,

		isOpen,
		showDialog,
		closeDialog,

		isOpenLicense,
		showLicenseDialog,
		closeLicenseDialog,
	};

});
