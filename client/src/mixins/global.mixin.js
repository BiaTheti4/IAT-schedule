import {globalStore} from "@/store/global"

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
        },
        setAuth(token, name) {
            if (token) {
                this.globalStore.auth = true;
                this.globalStore.user = name;
                this.globalStore.access_token = token;
            } else {
                this.globalStore.auth = false;
                this.globalStore.user = '';
                this.globalStore.access_token = '';
            }
            localStorage['auth'] = this.globalStore.auth;
            localStorage['user'] = this.globalStore.user;
            localStorage['access_token'] = this.globalStore.access_token;
        }
    },
    computed: {
        env() {
            return process.env;
        },
        serverUrl() {
            console.log(this.env);
            return this.env.VUE_APP_SERVER_SERT + this.env.VUE_APP_SERVER_IP + this.env.VUE_APP_SERVER_PORT;
        },
        isLoadingContent() {
            return this.globalStore.isLoading;
        },
        globalStore() {
            return globalStore();
        },
        isAuthorized() {
            return this.globalStore.auth;
        }
    },

}