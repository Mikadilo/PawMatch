import { createApp } from 'vue'
import './style.css'
import App from './App.vue';
import router from './router';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap'; // Pour les composants JS comme modals, dropdowns, etc.

createApp(App).use(router).mount('#app');
