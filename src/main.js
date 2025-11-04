import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initPerformanceMonitoring } from './utils/performance.js'
import './styles/global.css'

// Initialize performance monitoring for SEO optimization
initPerformanceMonitoring()

createApp(App).use(router).mount('#app')
