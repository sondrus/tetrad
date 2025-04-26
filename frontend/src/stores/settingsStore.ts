import { defineStore } from 'pinia';
import { ref, computed, watch, onMounted } from 'vue';

import { i18n } from '@/i18n'
import { fetcher } from '@/utils/fetch';
import type { Settings } from '@/models/settings';
import { useLogStore } from '@/stores/logStore';

export const useSettingsStore = defineStore('settings', () => {
	const logStore = useLogStore()

	const widthWindow = ref<number>(window.innerWidth);
	const widthClientArea = ref<number>(0);

	// Flag for check if notes was loaded
	const loaded = ref<boolean>(false);

	const settingsDefault: Settings = {
		language: 'en',
		mobile: {
			reverseInterface: false,
		},
		theme: {
			default: 'light',
			hljs: 'github',
		},
		title: {
			pathSeparator: ' | ',
		},
		sidebar: {
			visible: true,
			width: 300
		},
		treeview: {
			multiline: false
		},
		doublePanel: {
			enabled: false,
			vertical: true
		},
		editor: {
			linewrap: true,
			editMode: false,
			saveDelay: 500,
			autoview: true,
		},
		viewer: {
			prewrap: false,
			executeScripts: true,
		},
		welcome: {
			itemsCount: 15,
		},
		search: {
			title: false,
			whole: false,
			searchDelay: 500,
      treeMode: false
		}
	};

	const settings = ref<Settings>(settingsDefault)

	// Flag for prevent looping on save
	let saveAllowed = true

	// Highlight.js themes
	const hljsThemes = ref<string[]>([])

	//
	const setLanguage = (language: string) => {
		i18n.global.locale.value = language as "bn" | "br" | "cn" | "de" | "en" | "es" | "fr" | "hi" | "it" | "jp" | "ko" | "ru" | "sa" | "tr"
	}

	// Change language
	watch(() => settings.value.language, (language) => {
		setLanguage(language);
	});

	// Apply loaded settings
	const applyNewSettings = (newSettings: Settings, save: boolean = true) => {
		if (!save) {
			saveAllowed = false
		}
		settings.value = mergeSettings(settingsDefault, newSettings)
	}

	const loadSettings = async () => {
		const url = `/api/settings`;
		const response = await fetcher(url, { method: "GET" });

		if (!response.ok) {
			logStore.error(`Error loading settings: ${response.message}`)
			return
		}

		if (!response.json) {
			logStore.error(`Invalid response type: ${response.json}`)
			return
		}

		const responseData = response.json as {settings: Settings, hljsThemes: string[]}

		applyNewSettings(responseData.settings, false)
		setLanguage(settings.value.language)
		hljsThemes.value = responseData.hljsThemes

		// Set loaded flag
		loaded.value = true
	};

	function mergeSettings(defaults: Settings, overrides: Partial<Settings>): Settings {
		const result = { ...defaults };

		for (const key of Object.keys(overrides) as (keyof Settings)[]) {
			const defaultVal = defaults[key];
			const overrideVal = overrides[key];

			if (isPlainObject(defaultVal) && isPlainObject(overrideVal)) {
				result[key] = {
					...defaultVal,
					...overrideVal
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				} as any;
			} else if (overrideVal !== undefined) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				result[key] = overrideVal as any;
			}
		}

		return result as Settings;
	}

	function isPlainObject(value: unknown): value is Record<string, unknown> {
		return typeof value === 'object' && value !== null && !Array.isArray(value);
	}

	// Save settings on change
	watch(settings, () => {
		if (saveAllowed) {
			saveSettings()
		}
		saveAllowed = true
	}, { deep: true })

	// Do save settigns
	const saveSettings = async () => {
		const url = `/api/settings`;
		const response = await fetcher(url, { method: "PUT", json: settings.value });

		if (!response.ok) {
			logStore.error(`Error saving settings: ${response.message}`)
			return
		}

		if (!response.json) {
			logStore.error(`Invalid response type: ${response.json}`)
			return
		}
	};

	const hljsCssFilename = computed(() => `/highlightjs/${settings.value.theme.hljs}.min.css`)

	const setTheme = (theme: string) => {
		settings.value.theme.default = theme;
	};

	const isSidebar = () => {
		return settings.value.sidebar.visible
	};

	const showSidebar = (flag: boolean) => {
		settings.value.sidebar.visible = flag
	};

	const toggleSidebar = () => {
		settings.value.sidebar.visible = !settings.value.sidebar.visible;
	};

	const setSearchFindTitle = (flag: boolean) => {
		settings.value.search.title = flag;
	}

	const toggleSearchFindTitle = () => {
		settings.value.search.title = !settings.value.search.title;
	}

	const setSearchFindWhole = (flag: boolean) => {
		settings.value.search.whole = flag;
	}

	const toggleSearchFindWhole = () => {
		settings.value.search.whole = !settings.value.search.whole;
	}

	const toggleSearchTreeMode = () => {
		settings.value.search.treeMode = !settings.value.search.treeMode;
	}

	const setMultiline = (flag: boolean) => {
		settings.value.treeview.multiline = flag;
	}

	const toggleMultiline = () => {
		settings.value.treeview.multiline = !settings.value.treeview.multiline;
	}

	const setDoublePanelMode = (flag: boolean, vertical: boolean) => {
		settings.value.doublePanel.enabled = flag;
		settings.value.doublePanel.vertical = vertical;
	}

	const toggleDoublePanelMode = () => {
		if (settings.value.doublePanel.enabled) {
			if (settings.value.doublePanel.vertical) {
				settings.value.doublePanel.vertical = false;
			}
			else {
				settings.value.doublePanel.enabled = false;
				settings.value.doublePanel.vertical = true;
			}
		}
		else {
			settings.value.doublePanel.enabled = true;
			settings.value.doublePanel.vertical = true;
		}
	}

	const isEditMode = (): boolean => {
		return settings.value.editor.editMode
	}

	const setEditMode = (flag: boolean) => {
		settings.value.editor.editMode = flag
	};

	const toggleEditMode = () => {
		settings.value.editor.editMode = !settings.value.editor.editMode;
	};

	const isAutoView = (): boolean => {
		return settings.value.editor.autoview
	}

	const setAutoView = (flag: boolean) => {
		settings.value.editor.autoview = flag
	};

	const toggleAutoView = () => {
		settings.value.editor.autoview = !settings.value.editor.autoview;
	};

	const isViewerPreWrap = (): boolean => {
		return settings.value.viewer.prewrap
	}

	const setViewerPreWrap = (flag: boolean) => {
		settings.value.viewer.prewrap = flag
	};

	const toggleViewerPreWrap = () => {
		settings.value.viewer.prewrap = !settings.value.viewer.prewrap;
	};

	const isEditorLineWrap = (): boolean => {
		return settings.value.editor.linewrap
	}

	const setEditorLineWrap = (flag: boolean) => {
		settings.value.editor.linewrap = flag
	};

	const toggleEditorLineWrap = () => {
		settings.value.editor.linewrap = !settings.value.editor.linewrap;
	};

	const isReverseMobileInterface = (): boolean => {
		return settings.value.mobile.reverseInterface
	}

	const setReverseMobileInterface = (flag: boolean) => {
		settings.value.mobile.reverseInterface = flag
	};

	const toggleReverseMobileInterface = () => {
		settings.value.mobile.reverseInterface = !settings.value.mobile.reverseInterface;
	};

	onMounted(() => {
		window.addEventListener('resize', () => {
			widthWindow.value = window.innerWidth
		})
	})

	watch(() => settings.value.mobile.reverseInterface, (isOn) => {
		document.body.classList.toggle('reverse_mobile', isOn);
	});

	return {
		loaded,

		setLanguage,

		widthWindow,
		widthClientArea,

		loadSettings,
		saveSettings,

		settings,
		setTheme,

		hljsCssFilename,
		hljsThemes,

		isSidebar,
		showSidebar,
		toggleSidebar,

		setSearchFindTitle,
		toggleSearchFindTitle,
		setSearchFindWhole,
		toggleSearchFindWhole,
    toggleSearchTreeMode,

		setMultiline,
		toggleMultiline,

		setDoublePanelMode,
		toggleDoublePanelMode,

		isEditMode,
		setEditMode,
		toggleEditMode,

		isAutoView,
		setAutoView,
		toggleAutoView,

		isEditorLineWrap,
		setEditorLineWrap,
		toggleEditorLineWrap,

		isViewerPreWrap,
		setViewerPreWrap,
		toggleViewerPreWrap,

		isReverseMobileInterface,
		setReverseMobileInterface,
		toggleReverseMobileInterface,
	};
});
