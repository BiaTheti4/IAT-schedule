import {globalStore} from "@/store/gloabal"

export default {

    methods: {
        showLoading() {
            this.globalStore.loadingDeep++;
            this.globalStore.isLoading = true;
        },
        hideLoading() {
            this.globalStore.loadingDeep--;
            if (this.globalStore.loadingDeep <= 0) {
                this.globalStore.isLoading = false;
            }
        }
    },
    computed: {
        env() {
            return process.env;
        },
        serverUrl() {
            return this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT;
        },
        isLoading() {
            return this.globalStore.isLoading;
        },
        globalStore() {
            return globalStore();
        }
    }

}