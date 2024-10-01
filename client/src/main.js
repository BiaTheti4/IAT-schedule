import {createApp} from 'vue';
import {createPinia} from 'pinia'
import App from './App';
import router from '@/router/router';
import Toaster from "@meforma/vue-toaster";
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import GlobalMixin from "@/mixins/global.mixin";
import './assets/style.css'
import axios from './modules/axios'

const app = createApp(App);
const pinia = createPinia()
app.mixin(GlobalMixin);
app.component('Datepicker', Datepicker);
app.use(Toaster);
app.use(router);
app.use(pinia);

app.config.globalProperties.$axios = {...axios}

app.mount('#app');
//Vue.$toast.open({/* options */});

