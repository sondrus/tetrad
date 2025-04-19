import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		{
			name: 'inject-build-version',
			transformIndexHtml(html) {
				const version = Date.now()
				return html
					.replace('/index.js', `/index.js?${version}`)
					.replace('/index.css', `/index.css?${version}`)
			},
		},
	],
	build: {
		outDir: '../backend/static/files/homepage/',
		cssCodeSplit: true,
		assetsDir: '',
		rollupOptions: {
			output: {
				entryFileNames: '[name].js',
				chunkFileNames: '[name].js',
				assetFileNames: '[name].css',
			},
		},
		chunkSizeWarningLimit: 2097152,

	},
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		},
	},
	server: {
		hmr: false,
		host: '0.0.0.0',
		port: 5173,
		proxy: {
			'/api': 'http://localhost:8888',
			'/download': 'http://localhost:8888',
			'/highlightjs': 'http://localhost:8888',
			'/iframe': 'http://localhost:8888',
		}
	}
})
