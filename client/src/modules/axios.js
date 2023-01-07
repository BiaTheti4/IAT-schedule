import axios from "axios";
import router from "@/router/router"

const instance = axios.create({
    baseURL: process.env.VUE_APP_SERVER || "http://localhost:8080",
});

instance.interceptors.request.use(
    config => {
        config.headers['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);
instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    const data = response.data.success;
    if (data === false) {
        // need login
        return router.push({name: 'login'})
    } else {
        return response;
    }
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
});

export default instance;