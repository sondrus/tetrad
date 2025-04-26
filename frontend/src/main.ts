import './assets/base.css'
import './assets/main.css'
import './assets/icons.css'
import './assets/editor.css'
import './assets/preview.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { i18n } from '@/i18n'

import App from './App.vue'

const app = createApp(App)

// Plugin: pinia
app.use(createPinia())

// Plugin: internalization
app.use(i18n);

// Start app
app.mount('#tetrad');

// For debug in production
(window as { tetrad?: typeof app }).tetrad = app


