import { createApp } from "vue";
import router from "./router/routes.ts";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import Aura from "@primevue/themes/aura";
import { App } from "./index.ts";
import { createPinia } from "pinia";

import "./style.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(ConfirmationService);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    colorScheme: "light",
  },
});
app.mount("#app");
