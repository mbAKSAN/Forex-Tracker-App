import { createApp } from "vue";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import router from "./router";
import { createPinia } from "pinia";
import "primeicons/primeicons.css";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { registerGlobalComponents } from "@/components";

const app = createApp(App);
const pinia = createPinia();

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
registerGlobalComponents(app);
pinia.use(piniaPluginPersistedstate);
app.mount("#app");
