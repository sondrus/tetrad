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

app.use(createPinia())

app.use(i18n);

app.mount('#tetrad');

// For debug in production
(window as { tetrad?: typeof app }).tetrad = app


