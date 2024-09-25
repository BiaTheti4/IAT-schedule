import {defineStore} from "pinia";

export const globalStore = defineStore('global', {
    state: () => {
        return {
            isLoading: false,
            loadingDeep: 0,
            auth: false,
            user: '',
            access_token: ''

        }
    }
})