import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

import { fetcher } from '@/utils/fetch';

import { useLogStore } from '@/stores/logStore'

export const useDbStore = defineStore('database', () => {
	const logStore = useLogStore()

	// Database file name
	const dbPath = ref<string>('')
	const dbName = ref<string>('')

	// Database size (in bytes)
	const dbSize = ref<number>(0)
	const dbSizeFormatted = computed(() => formatDbSize(dbSize.value))

	// Parse headers: read 'X-Database-File' and 'X-Database-Size'
	const parseHeaders = (headers: Headers) => {
		dbPath.value = headers?.get('X-Database-File') ?? ''
		dbName.value = dbPath.value.replace(/\\/g, '/').split('/').pop() ?? ''
		dbSize.value = parseInt(headers?.get('X-Database-Size') ?? '') || 0
	}

	// Do optimize DB (with fetch)
	const dbOptimize = async () => {
		const url = `/api/database/optimize`;
		const response = await fetcher(url, { method: "POST" });

		if (!response.ok) {
			logStore.error(`Error optimizing table: ${response.message}`)
			return
		}

		if (!response.json) {
			logStore.error(`Invalid response type: ${response.json}`)
			return
		}

		const sizeOld = (response.json as { size_old: number }).size_old
		const sizeNew = (response.json as { size_new: number }).size_new
		dbSize.value = sizeNew
		if(sizeNew >= sizeOld){
			logStore.warning(`Database already optimized.`)
			return
		}

		const savedPercent = Math.max(0, Math.round((sizeOld - sizeNew) / sizeOld * 100))
		logStore.info(`Database optimized. Saved ${savedPercent.toFixed(2)}%.`)
	
	}

	// Format size of database from bytes: 2048 -> 2Kb
	const formatDbSize = (bytes: number) => {
		if (bytes < 1024) {
			return bytes + 'b';
		} else if (bytes < 1048576) {
			return (bytes / 1024).toFixed(2) + 'Kb';
		} else {
			return (bytes / 1048576).toFixed(2) + 'Mb';
		}
	}

	const dbDownload = () => {
		window.open('/download')
	}

	return {
		dbPath,
		dbName,
		dbSize,
		dbSizeFormatted,

		parseHeaders,

		dbOptimize,
		dbDownload,

		formatDbSize,
	};
});
