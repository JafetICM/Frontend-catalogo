//nombre-proyecto\frontend-vue/src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/welcome-style.css'

// Agregar Font Awesome CDN
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
document.head.appendChild(link);

const app = createApp(App)
app.use(router)
app.mount('#app')
