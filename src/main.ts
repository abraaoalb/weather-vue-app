import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

// Import Bootstrap and BootstrapVueNext CSS
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'

// Corrected import for BootstrapVueNext: Use the named export
import { bootstrapPlugin } from 'bootstrap-vue-next'

const app = createApp(App)

app.use(bootstrapPlugin)

createApp(App).mount('#app')
