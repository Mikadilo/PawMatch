import { createApp } from 'vue'
import './style.css'
import App from './App.vue';
import router from './router';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap'; // Pour les composants JS comme modals, dropdowns, etc.
import { createPinia } from 'pinia'


const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
