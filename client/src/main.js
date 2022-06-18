import {createApp} from 'vue';
import App from './App';
import router from '@/router/router';
import store from './store/index';
import Toaster from "@meforma/vue-toaster";


const app = createApp(App);

app.use(Toaster);
app.use(router);
app.use(store);

app.mount('#app');
//Vue.$toast.open({/* options */});

