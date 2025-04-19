import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'log'
const MAX_LOGS = 100

type LogMessageType = 'info' | 'warning' | 'error'

interface LogEntry {
	timestamp: number
	type: LogMessageType
	message: string
}

export const useLogStore = defineStore('log', () => {
	const logs = ref<LogEntry[]>([])

	// Auto open <dialog> if true (and auto close if false)
	const isOpen = ref<boolean>(false)

	const allLogs = computed(() => logs.value)
	const allLogMessages = computed(() => logs.value.map(item => {
		return `[${formatDate(item.timestamp)}] [${item.type}] ${item.message}`
	}))
	const lastMessage = computed(() => logs.value[logs.value.length - 1] || null)

	// If need show old items
	function loadFromStorage() {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (raw) {
			try {
				logs.value = JSON.parse(raw)
			} catch {
				logs.value = []
			}
		}
	}

	function saveToStorage() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.value))
	}

	function add(message: string, type: LogMessageType = 'info') {
		nativeLog(message, type)

		logs.value.push({
			timestamp: Date.now(),
			message,
			type,
		})

		if (logs.value.length > MAX_LOGS) {
			logs.value.splice(0, logs.value.length - MAX_LOGS)
		}

		saveToStorage()
	}

	const info = (message: string) => {
		add(message, 'info')
	}

	const warning = (message: string) => {
		add(message, 'warning')
	}

	const error = (message: string) => {
		add(message, 'error')
	}

	function nativeLog(message: string, type: LogMessageType = 'info') {
		if (type == 'info') {
			// do not log unimportant messages
		} else if (type == 'warning') {
			console.warn(message)
		} else if (type == 'error') {
			console.error(message)
		}
	}

	function clear() {
		logs.value = []
		saveToStorage()
	}

	// Show
	const showDialog = () => {
		isOpen.value = true;
	};

	// Close
	const closeDialog = () => {
		isOpen.value = false;
	};

	// Format UNIX timestamp to MySQL format
	function formatDate(timestamp: number): string {
		const date = new Date(timestamp)

		const pad = (n: number) => n.toString().padStart(2, '0')

		const year = date.getFullYear()
		const month = pad(date.getMonth() + 1)
		const day = pad(date.getDate())
		const hours = pad(date.getHours())
		const minutes = pad(date.getMinutes())
		const seconds = pad(date.getSeconds())

		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
	}

	return {
		isOpen,
		showDialog,
		closeDialog,

		add,
		info,
		warning,
		error,

		logs,
		allLogs,
		allLogMessages,
		lastMessage,

		loadFromStorage,
		saveToStorage,

		formatDate,

		clear,
	}
})
