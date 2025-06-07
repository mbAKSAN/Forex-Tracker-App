import { createApp } from "vue";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import router from './router'
import { createPinia } from 'pinia';
import 'primeicons/primeicons.css'


const app = createApp(App);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false,
    },
  },
});
app.use(router); 
app.use(createPinia());
app.mount("#app");

