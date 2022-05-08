import { createApp } from 'vue'
import App from "./App";
import router from "@/router/router";
import store from "./store/index";
import axios from "axios";
// import "vue-toastification/dist/index.css";
// import Toast from "vue-toastification";
// const options = {
//     // You can set your default options here
// };

const app=createApp(App)

// import Multiselect from 'vue-multiselect';
// app.component('multiselect', Multiselect);

app.use(router);
app.use(store);
// app.use(Toast, options);

app.mount('#app');
