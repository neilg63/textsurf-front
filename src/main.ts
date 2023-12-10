import './assets/main.css'
import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/lara-light-green/theme.css'
import Tooltip from 'primevue/tooltip';
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'primeicons/primeicons.css'
import mitt from "mitt";

import "primeicons/primeicons.css";

const emitter = mitt();

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.config.globalProperties.emitter = emitter;

app.use(createPinia())
app.use(router)
app.use(PrimeVue);
app.directive('tooltip', Tooltip);

app.mount('#app')
