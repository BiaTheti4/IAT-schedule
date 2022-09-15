export default {
    data() {
        return {
            isLoading: false,
            loadingDeep: 0,
        };
    },
    methods: {
        showLoading() {
            this.loadingDeep++;
            this.isLoading = true;
        },
        hideLoading() {
            this.loadingDeep--;
            if (this.loadingDeep === 0) {
                this.isLoading = false;
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
    }
}